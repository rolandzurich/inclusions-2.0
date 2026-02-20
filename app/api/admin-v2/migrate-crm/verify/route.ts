export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db-postgres';
import fs from 'fs';
import path from 'path';

/**
 * Verifikations-API: Vergleicht JSON-Dateien mit PostgreSQL
 * 
 * Zeigt:
 * - Anzahl in JSON vs. Anzahl in DB
 * - Welche E-Mails in JSON aber nicht in DB sind (fehlend)
 * - Welche E-Mails in DB aber nicht in JSON sind (nur DB)
 * - Gesamtstatus: OK / WARNUNG / FEHLT
 */
export async function GET() {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    const checks: any[] = [];
    let overallStatus: 'OK' | 'WARNUNG' | 'FEHLER' = 'OK';

    // ========================================
    // 1. VIP-Registrierungen
    // ========================================
    const vipCheck = await verifyDataset({
      label: 'VIP-Anmeldungen',
      jsonFile: path.join(dataDir, 'vip_registrations.json'),
      dbQuery: `
        SELECT c.email, v.created_at, v.status
        FROM vip_registrations v
        JOIN contacts c ON v.contact_id = c.id
      `,
      getEmail: (item: any) => item.email,
    });
    checks.push(vipCheck);

    // ========================================
    // 2. Newsletter-Subscriber
    // ========================================
    const nlCheck = await verifyDataset({
      label: 'Newsletter-Abos',
      jsonFile: path.join(dataDir, 'newsletter_subscribers.json'),
      dbQuery: `
        SELECT c.email, n.created_at, n.status
        FROM newsletter_subscriptions n
        JOIN contacts c ON n.contact_id = c.id
      `,
      getEmail: (item: any) => item.email,
    });
    checks.push(nlCheck);

    // ========================================
    // 3. Booking-Requests
    // ========================================
    const bookCheck = await verifyDataset({
      label: 'Booking-Anfragen',
      jsonFile: path.join(dataDir, 'contact_requests.json'),
      dbQuery: `
        SELECT c.email, b.created_at, b.status
        FROM booking_requests b
        JOIN contacts c ON b.contact_id = c.id
      `,
      getEmail: (item: any) => item.email,
    });
    checks.push(bookCheck);

    // Overall Status
    for (const check of checks) {
      if (check.status === 'FEHLER') overallStatus = 'FEHLER';
      else if (check.status === 'WARNUNG' && overallStatus !== 'FEHLER') overallStatus = 'WARNUNG';
    }

    return NextResponse.json({
      success: true,
      overallStatus,
      message: overallStatus === 'OK'
        ? 'Alle Daten sind vollständig in der Datenbank vorhanden'
        : overallStatus === 'WARNUNG'
        ? 'Einige Daten sind nur in einer Quelle vorhanden'
        : 'Es fehlen Daten – Migration erforderlich',
      checks,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function verifyDataset({
  label,
  jsonFile,
  dbQuery,
  getEmail,
}: {
  label: string;
  jsonFile: string;
  dbQuery: string;
  getEmail: (item: any) => string;
}) {
  // JSON lesen
  let jsonData: any[] = [];
  let jsonFileExists = false;
  if (fs.existsSync(jsonFile)) {
    jsonFileExists = true;
    jsonData = JSON.parse(fs.readFileSync(jsonFile, 'utf-8'));
  }

  // DB lesen
  const dbResult = await query(dbQuery);
  const dbData = dbResult.data || [];

  // E-Mail-Sets
  const jsonEmails = new Set(jsonData.map(getEmail).filter(Boolean));
  const dbEmails = new Set(dbData.map((d: any) => d.email).filter(Boolean));

  // Differenzen
  const missingInDb = [...jsonEmails].filter((e) => !dbEmails.has(e));
  const onlyInDb = [...dbEmails].filter((e) => !jsonEmails.has(e));

  // Status bestimmen
  let status: 'OK' | 'WARNUNG' | 'FEHLER' = 'OK';
  if (missingInDb.length > 0) status = 'FEHLER';
  else if (onlyInDb.length > 0) status = 'WARNUNG';

  return {
    label,
    status,
    jsonFile: jsonFileExists ? path.basename(jsonFile) : 'NICHT GEFUNDEN',
    counts: {
      json: jsonData.length,
      db: dbData.length,
      match: jsonData.length === dbData.length && missingInDb.length === 0,
    },
    missingInDb: missingInDb.length > 0 ? missingInDb : [],
    onlyInDb: onlyInDb.length > 0 ? onlyInDb : [],
    message: missingInDb.length > 0
      ? `${missingInDb.length} Einträge fehlen in der DB – Migration nötig!`
      : onlyInDb.length > 0
      ? `Alle JSON-Daten in DB. ${onlyInDb.length} zusätzliche Einträge nur in DB (z.B. via Formular).`
      : 'Vollständig synchronisiert',
  };
}
