/**
 * INCLUSIONS KI-E-Mail-Hub – Täglicher Digest
 * 
 * Sendet eine Zusammenfassung aller E-Mails und Aktionen
 * per E-Mail an Roland und Reto.
 */

import { query } from './db-postgres';
import { sendEmail } from './resend';

const DIGEST_RECIPIENTS = ['info@inclusions.zone', 'reto@inclusions.zone'];

export interface DigestData {
  period: string;
  totalEmails: number;
  newEmails: number;
  analyzed: number;
  urgent: EmailDigestItem[];
  byClassification: Record<string, number>;
  actionsCreated: number;
  actionsApplied: number;
  topEmails: EmailDigestItem[];
}

interface EmailDigestItem {
  subject: string;
  from: string;
  account: string;
  classification: string;
  urgency: string;
  summary: string;
  received_at: string;
}

/**
 * Erstellt und sendet den täglichen Digest.
 */
export async function sendDailyDigest(): Promise<{ success: boolean; digestId?: string; error?: string }> {
  try {
    // Daten der letzten 24h sammeln
    const since = new Date();
    since.setHours(since.getHours() - 24);

    // Neue E-Mails
    const emailsResult = await query(`
      SELECT subject, from_name, from_email, account, ai_classification, ai_urgency, ai_summary, received_at
      FROM email_messages
      WHERE received_at >= $1 AND is_archived = false
      ORDER BY 
        CASE ai_urgency 
          WHEN 'critical' THEN 0 
          WHEN 'high' THEN 1 
          WHEN 'medium' THEN 2 
          ELSE 3 
        END,
        received_at DESC
    `, [since]);

    // Stats
    const statsResult = await query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE ai_status = 'analyzed') as analyzed,
        COUNT(*) FILTER (WHERE ai_urgency IN ('high', 'critical')) as urgent
      FROM email_messages
      WHERE received_at >= $1
    `, [since]);

    // Aktionen
    const actionsResult = await query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'suggested') as suggested,
        COUNT(*) FILTER (WHERE status = 'applied') as applied
      FROM email_actions
      WHERE created_at >= $1
    `, [since]);

    // Klassifikationen zählen
    const classResult = await query(`
      SELECT ai_classification, COUNT(*) as count
      FROM email_messages
      WHERE received_at >= $1 AND ai_classification IS NOT NULL
      GROUP BY ai_classification
      ORDER BY count DESC
    `, [since]);

    const stats = statsResult.data?.[0] || { total: '0', analyzed: '0', urgent: '0' };
    const actionStats = actionsResult.data?.[0] || { suggested: '0', applied: '0' };
    const emails = emailsResult.data || [];
    const urgent = emails.filter((e: any) => e.ai_urgency === 'high' || e.ai_urgency === 'critical');

    const byClassification: Record<string, number> = {};
    (classResult.data || []).forEach((r: any) => { byClassification[r.ai_classification] = parseInt(r.count); });

    // Prüfe ob es überhaupt was zu berichten gibt
    if (parseInt(stats.total) === 0) {
      console.log('📧 Digest: Keine neuen E-Mails in den letzten 24h');
      return { success: true, error: 'Keine neuen E-Mails' };
    }

    // HTML-Mail erstellen
    const html = buildDigestHTML({
      period: `${since.toLocaleDateString('de-CH')} – ${new Date().toLocaleDateString('de-CH')}`,
      totalEmails: parseInt(stats.total),
      newEmails: parseInt(stats.total),
      analyzed: parseInt(stats.analyzed),
      urgent: urgent.map(mapDigestItem),
      byClassification,
      actionsCreated: parseInt(actionStats.suggested) + parseInt(actionStats.applied),
      actionsApplied: parseInt(actionStats.applied),
      topEmails: emails.slice(0, 10).map(mapDigestItem),
    });

    // Mail senden
    const subject = `📧 INCLUSIONS E-Mail-Digest – ${new Date().toLocaleDateString('de-CH')}`;

    for (const recipient of DIGEST_RECIPIENTS) {
      await sendEmail({
        to: recipient,
        subject,
        html,
      });
    }

    // Digest in DB tracken
    const digestResult = await query(`
      INSERT INTO email_digests (digest_type, recipients, email_count, action_count, digest_data)
      VALUES ('daily', $1, $2, $3, $4)
      RETURNING id
    `, [
      `{${DIGEST_RECIPIENTS.join(',')}}`,
      parseInt(stats.total),
      parseInt(actionStats.suggested) + parseInt(actionStats.applied),
      JSON.stringify({ byClassification, urgentCount: urgent.length }),
    ]);

    return { success: true, digestId: digestResult.data?.[0]?.id };
  } catch (err: any) {
    console.error('❌ Digest-Fehler:', err);
    return { success: false, error: err.message };
  }
}

function mapDigestItem(e: any): EmailDigestItem {
  return {
    subject: e.subject,
    from: e.from_name || e.from_email,
    account: e.account?.split('@')[0] || '',
    classification: e.ai_classification || 'unbekannt',
    urgency: e.ai_urgency || 'normal',
    summary: e.ai_summary || '',
    received_at: e.received_at,
  };
}

function buildDigestHTML(data: DigestData): string {
  const urgentSection = data.urgent.length > 0 ? `
    <div style="background-color: #FEF2F2; border-left: 4px solid #DC2626; padding: 16px; margin: 16px 0; border-radius: 8px;">
      <h2 style="color: #DC2626; margin: 0 0 12px 0; font-size: 16px;">🔥 DRINGEND (${data.urgent.length})</h2>
      ${data.urgent.map(e => `
        <div style="margin-bottom: 8px; padding: 8px; background: white; border-radius: 4px;">
          <p style="margin: 0; font-weight: bold; font-size: 14px;">${e.subject}</p>
          <p style="margin: 2px 0 0 0; color: #666; font-size: 12px;">${e.from} (${e.account}@) – ${e.summary}</p>
        </div>
      `).join('')}
    </div>
  ` : '';

  const classLabels: Record<string, string> = {
    sponsoring: '💰 Sponsoring', booking: '🎵 Booking', partnership: '🤝 Partnerschaft',
    media: '📰 Medien', volunteer: '🙋 Volunteer', vip: '⭐ VIP', donation: '❤️ Spende',
    general: '📧 Allgemein', internal: '🏠 Intern', automated: '🤖 Automatisch',
  };

  const classSection = Object.entries(data.byClassification)
    .filter(([k]) => k !== 'internal' && k !== 'automated' && k !== 'spam')
    .map(([key, count]) => `<span style="display:inline-block;margin:4px;padding:4px 12px;background:#F3F4F6;border-radius:20px;font-size:13px;">${classLabels[key] || key}: <strong>${count}</strong></span>`)
    .join('');

  return `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <div style="text-align: center; margin-bottom: 24px;">
    <h1 style="color: #1F2937; font-size: 20px; margin: 0;">📧 INCLUSIONS E-Mail-Digest</h1>
    <p style="color: #9CA3AF; font-size: 13px; margin: 4px 0 0 0;">${data.period}</p>
  </div>

  <div style="display: flex; gap: 12px; margin-bottom: 20px; text-align: center;">
    <div style="flex: 1; background: #F3F4F6; padding: 16px; border-radius: 12px;">
      <p style="font-size: 28px; font-weight: bold; margin: 0; color: #1F2937;">${data.newEmails}</p>
      <p style="font-size: 12px; color: #6B7280; margin: 4px 0 0 0;">Neue E-Mails</p>
    </div>
    <div style="flex: 1; background: ${data.urgent.length > 0 ? '#FEF2F2' : '#F3F4F6'}; padding: 16px; border-radius: 12px;">
      <p style="font-size: 28px; font-weight: bold; margin: 0; color: ${data.urgent.length > 0 ? '#DC2626' : '#1F2937'};">${data.urgent.length}</p>
      <p style="font-size: 12px; color: #6B7280; margin: 4px 0 0 0;">Dringend</p>
    </div>
    <div style="flex: 1; background: #F0FDF4; padding: 16px; border-radius: 12px;">
      <p style="font-size: 28px; font-weight: bold; margin: 0; color: #16A34A;">${data.actionsCreated}</p>
      <p style="font-size: 12px; color: #6B7280; margin: 4px 0 0 0;">KI-Aktionen</p>
    </div>
  </div>

  ${urgentSection}

  <div style="margin: 16px 0;">
    <h2 style="font-size: 16px; color: #1F2937;">📊 Kategorien</h2>
    <div>${classSection || '<p style="color: #9CA3AF; font-size: 13px;">Keine analysierten E-Mails</p>'}</div>
  </div>

  <div style="margin: 16px 0;">
    <h2 style="font-size: 16px; color: #1F2937;">📩 Letzte E-Mails</h2>
    ${data.topEmails.slice(0, 8).map(e => `
      <div style="padding: 8px 0; border-bottom: 1px solid #F3F4F6;">
        <p style="margin: 0; font-size: 13px;"><strong>${e.from}</strong> (${e.account}@) – ${e.subject}</p>
        ${e.summary ? `<p style="margin: 2px 0 0 0; color: #6B7280; font-size: 12px;">${e.summary}</p>` : ''}
      </div>
    `).join('')}
  </div>

  <div style="text-align: center; margin-top: 24px;">
    <a href="https://inclusions.zone/admin-v2/email" style="display: inline-block; background: linear-gradient(to right, #EC4899, #8B5CF6); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px;">
      Dashboard öffnen
    </a>
  </div>

  <p style="text-align: center; color: #9CA3AF; font-size: 11px; margin-top: 24px;">
    Automatisch generiert vom INCLUSIONS KI-E-Mail-Hub
  </p>
</body>
</html>`;
}
