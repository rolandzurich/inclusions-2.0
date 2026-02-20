export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db-postgres';
import fs from 'fs';
import path from 'path';

/**
 * Sichere, idempotente Migration: JSON → PostgreSQL
 * 
 * SICHERHEITSGARANTIEN:
 * - Duplikat-Erkennung per E-Mail (Kontakte), per contact_id+created_at (VIP/Bookings)
 * - Kann beliebig oft ausgeführt werden ohne Datenverlust
 * - Backup der JSON-Daten im raw_data Feld (VIP)
 * - Detailliertes Ergebnis-Log pro Eintrag
 * 
 * Query-Param ?dry_run=true → Zeigt was passieren würde, ohne zu schreiben
 */
export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dryRun = searchParams.get('dry_run') === 'true';
    
    const results: { type: string; email: string; action: string; status: string }[] = [];
    const summary = { total: 0, created: 0, skipped: 0, errors: 0 };
    const dataDir = path.join(process.cwd(), 'data');

    // ========================================
    // 1. VIP-Registrierungen migrieren
    // ========================================
    const vipPath = path.join(dataDir, 'vip_registrations.json');
    if (fs.existsSync(vipPath)) {
      const vipData = JSON.parse(fs.readFileSync(vipPath, 'utf-8'));
      for (const vip of vipData) {
        summary.total++;
        const email = vip.email;
        try {
          // Duplikat-Check: Existiert bereits eine VIP-Registrierung mit dieser E-Mail?
          const existing = await query(`
            SELECT v.id FROM vip_registrations v
            JOIN contacts c ON v.contact_id = c.id
            WHERE c.email = $1
          `, [email]);

          if (existing.data && existing.data.length > 0) {
            results.push({ type: 'VIP', email, action: 'SKIP', status: 'Bereits in DB vorhanden' });
            summary.skipped++;
            continue;
          }

          if (dryRun) {
            results.push({ type: 'VIP', email, action: 'DRY_RUN', status: 'Würde erstellt werden' });
            summary.created++;
            continue;
          }

          // Kontakt erstellen oder finden
          const contactId = await upsertContact({
            first_name: vip.first_name || vip.name?.split(' ')[0] || 'Unbekannt',
            last_name: vip.last_name || vip.name?.split(' ').slice(1).join(' ') || '',
            email,
            phone: vip.phone,
            has_disability: true,
            has_iv_card: vip.iv_ausweis === 'ja' || vip.iv_ausweis === true,
            special_needs: vip.special_requirements || vip.besondere_beduerfnisse || null,
            categories: ['vip'],
            source: 'vip_form',
          });

          await query(`
            INSERT INTO vip_registrations (
              contact_id, registration_type, event_date, event_location,
              arrival_time, tixi_taxi, tixi_address,
              needs_caregiver, caregiver_name, caregiver_phone,
              emergency_contact_name, emergency_contact_phone,
              status, raw_data, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
          `, [
            contactId,
            vip.anmeldung_durch === 'betreuer' ? 'caregiver' : 'self',
            vip.event_date || null,
            vip.event_location || null,
            vip.ankunftszeit || null,
            vip.tixi_taxi === 'ja' || vip.tixi_taxi === true || false,
            vip.tixi_adresse || null,
            vip.braucht_betreuer === 'ja' || vip.vip_braucht_betreuer === 'ja' || false,
            vip.vip_betreuer_name || vip.betreuer_name || null,
            vip.vip_betreuer_telefon || vip.betreuer_telefon || null,
            vip.kontaktperson_name || vip.emergency_contact_name || null,
            vip.kontaktperson_telefon || vip.emergency_contact_phone || null,
            vip.status || 'pending',
            JSON.stringify(vip),
            vip.created_at || new Date().toISOString(),
          ]);

          results.push({ type: 'VIP', email, action: 'CREATED', status: 'Erfolgreich migriert' });
          summary.created++;
        } catch (err: any) {
          results.push({ type: 'VIP', email, action: 'ERROR', status: err.message });
          summary.errors++;
        }
      }
    } else {
      results.push({ type: 'VIP', email: '-', action: 'INFO', status: 'Keine Datei gefunden (vip_registrations.json)' });
    }

    // ========================================
    // 2. Newsletter-Subscriber migrieren
    // ========================================
    const nlPath = path.join(dataDir, 'newsletter_subscribers.json');
    if (fs.existsSync(nlPath)) {
      const nlData = JSON.parse(fs.readFileSync(nlPath, 'utf-8'));
      for (const sub of nlData) {
        summary.total++;
        const email = sub.email;
        try {
          // Duplikat-Check: Newsletter hat UNIQUE(contact_id), ON CONFLICT handelt das
          // Aber wir prüfen trotzdem vorab für besseres Logging
          const existing = await query(`
            SELECT n.id FROM newsletter_subscriptions n
            JOIN contacts c ON n.contact_id = c.id
            WHERE c.email = $1
          `, [email]);

          if (existing.data && existing.data.length > 0) {
            results.push({ type: 'Newsletter', email, action: 'SKIP', status: 'Bereits in DB vorhanden' });
            summary.skipped++;
            continue;
          }

          if (dryRun) {
            results.push({ type: 'Newsletter', email, action: 'DRY_RUN', status: 'Würde erstellt werden' });
            summary.created++;
            continue;
          }

          const contactId = await upsertContact({
            first_name: sub.first_name || 'Unbekannt',
            last_name: sub.last_name || '',
            email,
            has_disability: sub.has_disability || false,
            categories: ['newsletter'],
            source: 'newsletter_form',
          });

          await query(`
            INSERT INTO newsletter_subscriptions (
              contact_id, interests, status, opt_in_confirmed_at, created_at
            ) VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (contact_id) DO UPDATE SET
              interests = EXCLUDED.interests,
              status = EXCLUDED.status,
              opt_in_confirmed_at = EXCLUDED.opt_in_confirmed_at
          `, [
            contactId,
            sub.interests || [],
            sub.status || 'pending',
            sub.opt_in_confirmed_at || null,
            sub.created_at || new Date().toISOString(),
          ]);

          results.push({ type: 'Newsletter', email, action: 'CREATED', status: 'Erfolgreich migriert' });
          summary.created++;
        } catch (err: any) {
          results.push({ type: 'Newsletter', email, action: 'ERROR', status: err.message });
          summary.errors++;
        }
      }
    } else {
      results.push({ type: 'Newsletter', email: '-', action: 'INFO', status: 'Keine Datei gefunden (newsletter_subscribers.json)' });
    }

    // ========================================
    // 3. Booking-Requests migrieren
    // ========================================
    const brPath = path.join(dataDir, 'contact_requests.json');
    if (fs.existsSync(brPath)) {
      const brData = JSON.parse(fs.readFileSync(brPath, 'utf-8'));
      for (const req of brData) {
        summary.total++;
        const email = req.email;
        try {
          // Duplikat-Check: Booking per E-Mail + booking_item + created_at
          const existing = await query(`
            SELECT b.id FROM booking_requests b
            JOIN contacts c ON b.contact_id = c.id
            WHERE c.email = $1 AND b.created_at = $2
          `, [email, req.created_at]);

          if (existing.data && existing.data.length > 0) {
            results.push({ type: 'Booking', email, action: 'SKIP', status: 'Bereits in DB vorhanden' });
            summary.skipped++;
            continue;
          }

          if (dryRun) {
            results.push({ type: 'Booking', email, action: 'DRY_RUN', status: 'Würde erstellt werden' });
            summary.created++;
            continue;
          }

          const nameParts = (req.name || '').split(' ');
          const contactId = await upsertContact({
            first_name: nameParts[0] || 'Unbekannt',
            last_name: nameParts.slice(1).join(' ') || '',
            email,
            phone: req.phone || null,
            categories: ['booking'],
            source: 'booking_form',
          });

          await query(`
            INSERT INTO booking_requests (
              contact_id, booking_type, booking_item,
              event_date, event_location, event_type,
              message, status, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          `, [
            contactId,
            req.booking_type || null,
            req.booking_item || null,
            req.event_date || null,
            req.event_location || null,
            req.event_type || null,
            req.message || null,
            req.status === 'new' ? 'new' : req.status || 'new',
            req.created_at || new Date().toISOString(),
          ]);

          results.push({ type: 'Booking', email, action: 'CREATED', status: 'Erfolgreich migriert' });
          summary.created++;
        } catch (err: any) {
          results.push({ type: 'Booking', email, action: 'ERROR', status: err.message });
          summary.errors++;
        }
      }
    } else {
      results.push({ type: 'Booking', email: '-', action: 'INFO', status: 'Keine Datei gefunden (contact_requests.json)' });
    }

    return NextResponse.json({
      success: summary.errors === 0,
      dry_run: dryRun,
      message: dryRun
        ? `DRY RUN: ${summary.created} würden erstellt, ${summary.skipped} übersprungen`
        : `Migration abgeschlossen: ${summary.created} erstellt, ${summary.skipped} übersprungen, ${summary.errors} Fehler`,
      summary,
      results,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Hilfsfunktion: Kontakt erstellen oder aktualisieren (Dedup per E-Mail)
async function upsertContact(data: {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  has_disability?: boolean;
  has_iv_card?: boolean;
  special_needs?: string | null;
  categories: string[];
  source: string;
}): Promise<string> {
  // Prüfe ob Kontakt mit dieser E-Mail existiert
  if (data.email) {
    const existing = await query(
      `SELECT id, categories FROM contacts WHERE email = $1 LIMIT 1`,
      [data.email]
    );

    if (existing.data && existing.data.length > 0) {
      const contact = existing.data[0];
      // Kategorien zusammenführen
      const existingCats: string[] = contact.categories || [];
      const newCats = [...new Set([...existingCats, ...data.categories])];

      await query(`
        UPDATE contacts SET
          categories = $1,
          has_disability = CASE WHEN $2 THEN TRUE ELSE has_disability END,
          has_iv_card = CASE WHEN $3 THEN TRUE ELSE has_iv_card END,
          special_needs = COALESCE($4, special_needs),
          phone = COALESCE($5, phone),
          updated_at = NOW()
        WHERE id = $6
      `, [
        newCats,
        data.has_disability || false,
        data.has_iv_card || false,
        data.special_needs || null,
        data.phone || null,
        contact.id,
      ]);

      return contact.id;
    }
  }

  // Neuen Kontakt erstellen
  const result = await query(`
    INSERT INTO contacts (
      first_name, last_name, email, phone,
      has_disability, has_iv_card, special_needs,
      categories, source
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING id
  `, [
    data.first_name,
    data.last_name,
    data.email,
    data.phone || null,
    data.has_disability || false,
    data.has_iv_card || false,
    data.special_needs || null,
    data.categories,
    data.source,
  ]);

  return result.data![0].id;
}
