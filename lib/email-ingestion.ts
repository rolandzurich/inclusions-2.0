/**
 * INCLUSIONS KI-E-Mail-Hub – IMAP Ingestion
 * 
 * Liest E-Mails von 3 Swisshosting-Accounts via IMAP
 * und speichert sie dedupliziert in PostgreSQL.
 */

import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import type { ParsedMail } from 'mailparser';
import { query } from './db-postgres';

// ============================================
// KONFIGURATION
// ============================================

export interface EmailAccount {
  label: string;
  user: string;
  pass: string;
}

function getAccounts(): EmailAccount[] {
  const accounts: EmailAccount[] = [];
  
  for (let i = 1; i <= 3; i++) {
    const user = process.env[`IMAP_USER_${i}`];
    const pass = process.env[`IMAP_PASS_${i}`];
    if (user && pass) {
      accounts.push({
        label: user.split('@')[0], // info, reto, roland
        user,
        pass,
      });
    }
  }
  
  return accounts;
}

function getImapConfig(account: EmailAccount): any {
  return {
    host: process.env.IMAP_HOST || 'mail.swisshosting.ch',
    port: parseInt(process.env.IMAP_PORT || '993'),
    secure: true,
    auth: {
      user: account.user,
      pass: account.pass,
    },
    logger: false,
    // Timeout nach 30s
    socketTimeout: 30000,
    greetingTimeout: 15000,
  };
}

// ============================================
// E-MAIL ABRUF
// ============================================

export interface IngestedEmail {
  messageId: string;
  account: string;
  fromEmail: string;
  fromName: string;
  toEmail: string;
  cc: string;
  subject: string;
  bodyText: string;
  bodyHtml: string;
  receivedAt: Date;
  hasAttachments: boolean;
  attachmentInfo: any[];
}

/**
 * Ruft neue E-Mails von einem Account ab.
 * Liest nur E-Mails der letzten `daysBack` Tage (Standard: 7).
 */
async function fetchFromAccount(
  account: EmailAccount,
  daysBack: number = 7
): Promise<IngestedEmail[]> {
  const config = getImapConfig(account);
  const client = new ImapFlow(config);
  const emails: IngestedEmail[] = [];

  try {
    await client.connect();
    
    const lock = await client.getMailboxLock('INBOX');
    
    try {
      // Suche nach E-Mails der letzten X Tage
      const since = new Date();
      since.setDate(since.getDate() - daysBack);
      
      const messages = client.fetch(
        { since },
        { 
          envelope: true, 
          source: true,
          bodyStructure: true,
        }
      );
      
      for await (const msg of messages) {
        try {
          const parsed: ParsedMail = await simpleParser(msg.source as any);
          
          const messageId = parsed.messageId || 
                           msg.envelope?.messageId || 
                           `gen-${account.user}-${msg.uid}-${Date.now()}`;
          
          const from = parsed.from?.value?.[0];
          const to = parsed.to ? 
            (Array.isArray(parsed.to) ? parsed.to : [parsed.to])
              .flatMap(t => t.value || [])
              .map(a => a.address)
              .join(', ') : account.user;
          
          const cc = parsed.cc ?
            (Array.isArray(parsed.cc) ? parsed.cc : [parsed.cc])
              .flatMap(t => t.value || [])
              .map(a => a.address)
              .join(', ') : '';

          const attachments = (parsed.attachments || []).map(a => ({
            name: a.filename || 'unknown',
            size: a.size,
            type: a.contentType,
          }));

          emails.push({
            messageId,
            account: account.user,
            fromEmail: from?.address || 'unknown',
            fromName: from?.name || '',
            toEmail: to,
            cc,
            subject: parsed.subject || '(kein Betreff)',
            bodyText: (parsed.text || '').substring(0, 50000), // Max 50KB Text
            bodyHtml: (parsed.html || '').substring(0, 100000), // Max 100KB HTML
            receivedAt: parsed.date || new Date(),
            hasAttachments: attachments.length > 0,
            attachmentInfo: attachments,
          });
        } catch (parseErr) {
          console.error(`⚠️ Fehler beim Parsen (${account.user}, UID ${msg.uid}):`, parseErr);
        }
      }
    } finally {
      lock.release();
    }
    
    await client.logout();
  } catch (err) {
    console.error(`❌ IMAP-Fehler (${account.user}):`, err);
    throw err;
  }
  
  return emails;
}

// ============================================
// DATENBANK-SPEICHERUNG
// ============================================

/**
 * Speichert E-Mails in der DB (idempotent – Duplikate werden übersprungen).
 * Gibt die Anzahl neu gespeicherter E-Mails zurück.
 */
async function saveEmails(emails: IngestedEmail[]): Promise<{ saved: number; skipped: number }> {
  let saved = 0;
  let skipped = 0;
  
  for (const email of emails) {
    try {
      const result = await query(`
        INSERT INTO email_messages (
          message_id, account, from_email, from_name, to_email, cc,
          subject, body_text, body_html, received_at,
          has_attachments, attachment_info
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (message_id) DO NOTHING
        RETURNING id
      `, [
        email.messageId,
        email.account,
        email.fromEmail,
        email.fromName,
        email.toEmail,
        email.cc,
        email.subject,
        email.bodyText,
        email.bodyHtml,
        email.receivedAt,
        email.hasAttachments,
        JSON.stringify(email.attachmentInfo),
      ]);
      
      if (result.data && result.data.length > 0) {
        saved++;
      } else {
        skipped++;
      }
    } catch (err) {
      console.error(`❌ DB-Fehler für Message-ID ${email.messageId}:`, err);
    }
  }
  
  return { saved, skipped };
}

// ============================================
// HAUPT-FUNKTION
// ============================================

export interface IngestionResult {
  account: string;
  fetched: number;
  saved: number;
  skipped: number;
  error?: string;
}

/**
 * Hauptfunktion: Alle Accounts abrufen und speichern.
 */
export async function ingestAllAccounts(daysBack: number = 7): Promise<IngestionResult[]> {
  const accounts = getAccounts();
  const results: IngestionResult[] = [];
  
  if (accounts.length === 0) {
    throw new Error('Keine IMAP-Accounts konfiguriert. Prüfe IMAP_USER_1/IMAP_PASS_1 in .env.local');
  }
  
  console.log(`📧 Starte E-Mail-Ingestion für ${accounts.length} Accounts (${daysBack} Tage zurück)...`);
  
  for (const account of accounts) {
    try {
      console.log(`  📥 ${account.user}...`);
      const emails = await fetchFromAccount(account, daysBack);
      const { saved, skipped } = await saveEmails(emails);
      
      console.log(`  ✅ ${account.user}: ${emails.length} gelesen, ${saved} neu, ${skipped} Duplikate`);
      
      results.push({
        account: account.user,
        fetched: emails.length,
        saved,
        skipped,
      });
    } catch (err: any) {
      console.error(`  ❌ ${account.user}: ${err.message}`);
      results.push({
        account: account.user,
        fetched: 0,
        saved: 0,
        skipped: 0,
        error: err.message,
      });
    }
  }
  
  const totalNew = results.reduce((sum, r) => sum + r.saved, 0);
  console.log(`📧 Ingestion abgeschlossen: ${totalNew} neue E-Mails gespeichert.`);
  
  return results;
}

/**
 * Einzelnen Account abrufen (für Tests).
 */
export async function ingestSingleAccount(accountEmail: string, daysBack: number = 7): Promise<IngestionResult> {
  const accounts = getAccounts();
  const account = accounts.find(a => a.user === accountEmail);
  
  if (!account) {
    throw new Error(`Account ${accountEmail} nicht konfiguriert.`);
  }
  
  const emails = await fetchFromAccount(account, daysBack);
  const { saved, skipped } = await saveEmails(emails);
  
  return {
    account: account.user,
    fetched: emails.length,
    saved,
    skipped,
  };
}

/**
 * IMAP-Verbindung testen (ohne E-Mails zu lesen).
 */
export async function testConnection(accountEmail?: string): Promise<{ account: string; status: string; mailboxes?: string[] }[]> {
  const accounts = getAccounts();
  const toTest = accountEmail 
    ? accounts.filter(a => a.user === accountEmail)
    : accounts;
  
  const results = [];
  
  for (const account of toTest) {
    const config = getImapConfig(account);
    const client = new ImapFlow(config);
    
    try {
      await client.connect();
      const mailboxes = await client.list();
      const names = mailboxes.map(mb => mb.path);
      await client.logout();
      
      results.push({
        account: account.user,
        status: 'ok',
        mailboxes: names,
      });
    } catch (err: any) {
      results.push({
        account: account.user,
        status: `error: ${err.message}`,
      });
    }
  }
  
  return results;
}
