export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query, executeMultiple } from '@/lib/db-postgres';

// Google Drive Quittungen-Ordner
const DRIVE_FOLDER_URL = 'https://drive.google.com/drive/folders/1mJM-sqwAyGclC2gNhOSUsKakZfDHIt9G';

/**
 * Ausgaben aus Google Sheet - aufbereitet mit Quittungs-Zuordnung
 * Quelle: https://docs.google.com/spreadsheets/d/1Xh9NJkjNCIiE-P4cuOREqCGyqx7EGP83_BwO4aVBBwo
 */
const EXPENSES_DATA = [
  {
    entry_date: '2025-03-04',
    description: 'Elementor (Website-Builder)',
    supplier: 'elementor.com',
    original_currency: 'USD',
    original_amount: 59.00,
    amount_chf: 55.44,
    paid_by: 'Roland',
    is_reimbursed: true,
    category: 'Marketing',
    notes: '3. März 2026 verlängern',
    receipt_filename: 'elementor-Website-Builder.jpg',
  },
  {
    entry_date: '2025-03-04',
    description: 'Domain',
    supplier: 'godaddy.com',
    original_currency: 'CHF',
    original_amount: 67.22,
    amount_chf: 67.22,
    paid_by: 'Roland',
    is_reimbursed: true,
    category: 'Verwaltung',
    notes: '3. März 2027 verlängern',
    receipt_filename: 'godaddy-domain.pdf',
  },
  {
    entry_date: '2025-03-10',
    description: 'Hosting',
    supplier: 'Green.ch',
    original_currency: 'CHF',
    original_amount: 77.40,
    amount_chf: 77.40,
    paid_by: 'Roland',
    is_reimbursed: true,
    category: 'Verwaltung',
    receipt_filename: 'Green-ch-Rechnung_8655292.pdf',
  },
  {
    entry_date: '2025-04-07',
    description: 'Support Webseite',
    supplier: 'Upwork',
    original_currency: 'USD',
    original_amount: 255.26,
    amount_chf: 229.53,
    paid_by: 'Roland',
    is_reimbursed: true,
    category: 'Marketing',
    receipt_filename: 'Upwork-2025-10-01_987a62c2cf9bbc66-SEA_T796909240_invoice.pdf',
  },
  {
    entry_date: '2025-04-14',
    description: 'Support Webseite',
    supplier: 'Upwork',
    original_currency: 'USD',
    original_amount: 27.12,
    amount_chf: 23.14,
    paid_by: 'Roland',
    is_reimbursed: true,
    category: 'Marketing',
    receipt_filename: 'Upwork-2025-10-01_987a631fca7dbc66-SEA_T799030182_invoice.pdf',
  },
  {
    entry_date: '2025-04-20',
    description: 'AI Videos',
    supplier: 'HeyGen',
    original_currency: 'USD',
    original_amount: 29.00,
    amount_chf: 24.83,
    paid_by: 'Roland',
    is_reimbursed: true,
    category: 'Marketing',
    receipt_filename: 'Heygen-Invoice-0C0BF131-0001.pdf',
  },
  {
    entry_date: '2025-05-20',
    description: 'AI Videos',
    supplier: 'HeyGen',
    original_currency: 'USD',
    original_amount: 29.00,
    amount_chf: 24.83,
    paid_by: 'Roland',
    is_reimbursed: true,
    category: 'Marketing',
    receipt_filename: 'Heygen-Invoice-0C0BF131-0002.pdf',
  },
  {
    entry_date: '2025-05-26',
    description: 'Support Webseite',
    supplier: 'Upwork',
    original_currency: 'USD',
    original_amount: 32.59,
    amount_chf: 27.89,
    paid_by: 'Roland',
    is_reimbursed: true,
    category: 'Marketing',
    receipt_filename: 'Upwork-2025-10-01_987a632e1ad4bc66-YVR_T811892390_invoice.pdf',
  },
  {
    entry_date: '2025-06-20',
    description: 'AI Videos',
    supplier: 'HeyGen',
    original_currency: 'USD',
    original_amount: 29.00,
    amount_chf: 24.83,
    paid_by: 'Roland',
    is_reimbursed: true,
    category: 'Marketing',
    receipt_filename: 'Heygen-Invoice-0C0BF131-0003.pdf',
  },
  {
    entry_date: '2025-07-20',
    description: 'AI Videos',
    supplier: 'HeyGen',
    original_currency: 'USD',
    original_amount: 29.00,
    amount_chf: 24.83,
    paid_by: 'Roland',
    is_reimbursed: true,
    category: 'Marketing',
    receipt_filename: 'Heygen-Invoice-0C0BF131-0004.pdf',
  },
  {
    entry_date: '2025-07-28',
    description: 'Flyer',
    supplier: 'Flyerking.ch',
    original_currency: 'CHF',
    original_amount: 198.00,
    amount_chf: 198.00,
    paid_by: 'Roland',
    is_reimbursed: true,
    category: 'Marketing',
    receipt_filename: 'Fylerking-2026-inclusions2.pdf',
  },
  {
    entry_date: '2025-08-20',
    description: 'AI Videos',
    supplier: 'HeyGen',
    original_currency: 'USD',
    original_amount: 29.00,
    amount_chf: 24.83,
    paid_by: 'Roland',
    is_reimbursed: true,
    category: 'Marketing',
    receipt_filename: 'Heygen-Invoice-0C0BF131-0005.pdf',
  },
  {
    entry_date: '2025-08-27',
    description: 'Newsletter',
    supplier: 'Mailchimp',
    original_currency: 'CHF',
    original_amount: 11.41,
    amount_chf: 11.41,
    paid_by: 'Roland',
    is_reimbursed: true,
    category: 'Marketing',
    receipt_filename: 'mailchimp-receipt-MC16944271.pdf',
  },
  {
    entry_date: '2025-09-08',
    description: 'Lanyard',
    supplier: 'Haikou Yidian Culture Media Co., Ltd',
    original_currency: 'CHF',
    original_amount: 330.00,
    amount_chf: 330.00,
    paid_by: 'Roland',
    is_reimbursed: true,
    category: 'Equipment',
  },
  {
    entry_date: '2025-09-09',
    description: 'Lanyard Lieferkosten',
    supplier: 'Haikou Yidian Culture Media Co., Ltd',
    original_currency: 'CHF',
    original_amount: 30.00,
    amount_chf: 30.00,
    paid_by: 'Roland',
    is_reimbursed: true,
    category: 'Equipment',
  },
  {
    entry_date: '2025-09-20',
    description: 'AI Videos',
    supplier: 'HeyGen',
    original_currency: 'USD',
    original_amount: 29.00,
    amount_chf: 24.83,
    paid_by: 'Roland',
    is_reimbursed: true,
    category: 'Marketing',
    receipt_filename: 'Heygen-Invoice-0C0BF131-0006.pdf',
  },
  {
    entry_date: '2025-09-22',
    description: 'Support Webseite',
    supplier: 'Upwork',
    original_currency: 'USD',
    original_amount: 108.64,
    amount_chf: 90.00,
    paid_by: 'Roland',
    is_reimbursed: true,
    category: 'Marketing',
    receipt_filename: 'Upwork-2025-10-01_987a634c4d38bc66-YVR_T848894625_invoice.pdf',
  },
  {
    entry_date: '2025-09-27',
    description: 'Newsletter',
    supplier: 'Mailchimp',
    original_currency: 'CHF',
    original_amount: 11.31,
    amount_chf: 11.31,
    paid_by: 'Roland',
    is_reimbursed: true,
    category: 'Marketing',
    receipt_filename: 'mailchimp-receipt-MC17142467.pdf',
  },
  {
    entry_date: '2025-10-24',
    description: 'AI Videos',
    supplier: 'HeyGen',
    original_currency: 'USD',
    original_amount: 29.00,
    amount_chf: 24.01,
    paid_by: 'Roland',
    is_reimbursed: false,
    category: 'Marketing',
    receipt_filename: 'Heygen-Receipt-2075-8278.pdf',
  },
  {
    entry_date: '2025-10-27',
    description: 'Newsletter',
    supplier: 'Mailchimp',
    original_currency: 'CHF',
    original_amount: 11.26,
    amount_chf: 11.26,
    paid_by: 'Roland',
    is_reimbursed: false,
    category: 'Marketing',
    receipt_filename: 'mailchimp-receipt-MC17341035.pdf',
  },
  {
    entry_date: '2025-11-22',
    description: 'Vibe Coding Webseite',
    supplier: 'Cursor',
    original_currency: 'USD',
    original_amount: 20.00,
    amount_chf: 16.84,
    paid_by: 'Roland',
    is_reimbursed: false,
    category: 'Verwaltung',
    receipt_filename: 'Cursor-Receipt-2637-9369.pdf',
  },
  {
    entry_date: '2025-11-24',
    description: 'AI Videos',
    supplier: 'HeyGen',
    original_currency: 'USD',
    original_amount: 29.00,
    amount_chf: 24.30,
    paid_by: 'Roland',
    is_reimbursed: false,
    category: 'Marketing',
    receipt_filename: 'HeyGen-Receipt-2119-3570.pdf',
  },
  {
    entry_date: '2025-11-27',
    description: 'Newsletter',
    supplier: 'Mailchimp',
    original_currency: 'CHF',
    original_amount: 11.42,
    amount_chf: 11.42,
    paid_by: 'Roland',
    is_reimbursed: false,
    category: 'Marketing',
    receipt_filename: 'mailchimp-receipt-MC17544327.pdf',
  },
  {
    entry_date: '2025-12-01',
    description: 'VPN',
    supplier: 'CyberGhost VPN',
    original_currency: 'CHF',
    original_amount: 70.00,
    amount_chf: 70.00,
    paid_by: 'Roland',
    is_reimbursed: false,
    category: 'Verwaltung',
    receipt_filename: 'CyberGhost-VPN-invoice-75717417.pdf',
  },
  {
    entry_date: '2025-12-22',
    description: 'Vibe Coding Webseite',
    supplier: 'Cursor',
    original_currency: 'USD',
    original_amount: 20.00,
    amount_chf: 16.56,
    paid_by: 'Roland',
    is_reimbursed: false,
    category: 'Verwaltung',
    receipt_filename: 'Cursor-Receipt-2145-2964.pdf',
  },
  {
    entry_date: '2025-12-27',
    description: 'Newsletter',
    supplier: 'Mailchimp',
    original_currency: 'CHF',
    original_amount: 11.17,
    amount_chf: 11.17,
    paid_by: 'Roland',
    is_reimbursed: false,
    category: 'Marketing',
    receipt_filename: 'mailchimp-receipt-MC17745659.pdf',
  },
  {
    entry_date: '2026-01-05',
    description: 'Social Media Tool',
    supplier: 'Zoho',
    original_currency: 'EUR',
    original_amount: 129.72,
    amount_chf: 125.73,
    paid_by: 'Roland',
    is_reimbursed: false,
    category: 'Marketing',
    receipt_filename: 'ZOHO-5300314863.pdf',
  },
  {
    entry_date: '2026-01-22',
    description: 'Vibe Coding Webseite',
    supplier: 'Cursor',
    original_currency: 'USD',
    original_amount: 20.00,
    amount_chf: 16.52,
    paid_by: 'Roland',
    is_reimbursed: false,
    category: 'Verwaltung',
    receipt_filename: 'Cursor-Receipt-2106-0897.pdf',
  },
  {
    entry_date: '2026-01-27',
    description: 'Newsletter',
    supplier: 'Mailchimp',
    original_currency: 'CHF',
    original_amount: 11.01,
    amount_chf: 11.01,
    paid_by: 'Roland',
    is_reimbursed: false,
    category: 'Marketing',
    receipt_filename: 'mailchimp-receipt-MC17945327.pdf',
  },
  {
    entry_date: '2026-01-31',
    description: 'Design Tool',
    supplier: 'Canva',
    original_currency: 'CHF',
    original_amount: 128.00,
    amount_chf: 128.00,
    paid_by: 'Roland',
    is_reimbursed: false,
    category: 'Marketing',
    receipt_filename: 'Canva-invoice-04778-25962847.pdf',
  },
];

// POST - Ausgaben aus Google Sheet importieren
export async function POST(request: Request) {
  try {
    // Zuerst: Schema-Migration ausführen (neue Spalten hinzufügen)
    const migrationResult = await executeMultiple(`
      ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS supplier TEXT;
      ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS paid_by TEXT;
      ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS is_reimbursed BOOLEAN DEFAULT false;
      ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS original_currency TEXT DEFAULT 'CHF';
      ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS original_amount DECIMAL(12, 2);
      ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS receipt_url TEXT;
      ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS receipt_filename TEXT
    `);

    if (!migrationResult.success) {
      return NextResponse.json({
        error: `Migration fehlgeschlagen: ${migrationResult.error}`,
      }, { status: 500 });
    }

    // Prüfe ob schon importiert
    const existing = await query(
      `SELECT COUNT(*) as count FROM journal_entries WHERE notes LIKE '%Google-Sheet-Import%'`
    );
    const existingCount = parseInt(existing.data?.[0]?.count || '0');

    if (existingCount > 0) {
      return NextResponse.json({
        success: false,
        error: `Es wurden bereits ${existingCount} Einträge importiert. Bitte zuerst die bestehenden Import-Einträge löschen.`,
        existing_count: existingCount,
      }, { status: 409 });
    }

    // Alle Ausgaben importieren
    const imported = [];
    const errors = [];

    for (const expense of EXPENSES_DATA) {
      const receiptUrl = expense.receipt_filename
        ? `${DRIVE_FOLDER_URL}`
        : null;

      const notesWithSource = [
        expense.notes || '',
        'Google-Sheet-Import',
      ].filter(Boolean).join(' | ');

      const result = await query(
        `INSERT INTO journal_entries (
          entry_type, entry_date, amount_chf, vat_rate, vat_amount_chf,
          category, description, supplier, paid_by, is_reimbursed,
          original_currency, original_amount, receipt_url, receipt_filename,
          notes, is_reconciled
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING id, description, amount_chf`,
        [
          'expense',
          expense.entry_date,
          expense.amount_chf,
          0,
          0,
          expense.category,
          expense.description,
          expense.supplier,
          expense.paid_by,
          expense.is_reimbursed,
          expense.original_currency,
          expense.original_amount,
          receiptUrl,
          expense.receipt_filename || null,
          notesWithSource,
          true,
        ]
      );

      if (result.error) {
        errors.push({
          description: expense.description,
          date: expense.entry_date,
          error: result.error,
        });
      } else {
        imported.push(result.data?.[0]);
      }
    }

    // Zusammenfassung berechnen
    const totalAmount = EXPENSES_DATA.reduce((sum, e) => sum + e.amount_chf, 0);
    const reimbursedAmount = EXPENSES_DATA.filter(e => e.is_reimbursed).reduce((sum, e) => sum + e.amount_chf, 0);
    const openAmount = totalAmount - reimbursedAmount;

    return NextResponse.json({
      success: true,
      message: `${imported.length} Ausgaben erfolgreich importiert`,
      summary: {
        total_entries: EXPENSES_DATA.length,
        imported: imported.length,
        errors: errors.length,
        total_amount_chf: totalAmount.toFixed(2),
        reimbursed_amount_chf: reimbursedAmount.toFixed(2),
        open_amount_chf: openAmount.toFixed(2),
      },
      imported,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET - Status des Imports prüfen
export async function GET() {
  try {
    const result = await query(
      `SELECT COUNT(*) as count, 
              SUM(amount_chf) as total_amount,
              SUM(CASE WHEN is_reimbursed = true THEN amount_chf ELSE 0 END) as reimbursed_amount
       FROM journal_entries 
       WHERE notes LIKE '%Google-Sheet-Import%'`
    );

    const data = result.data?.[0];
    const count = parseInt(data?.count || '0');

    return NextResponse.json({
      success: true,
      imported: count > 0,
      count,
      total_amount_chf: parseFloat(data?.total_amount || '0').toFixed(2),
      reimbursed_amount_chf: parseFloat(data?.reimbursed_amount || '0').toFixed(2),
      source_url: 'https://docs.google.com/spreadsheets/d/1Xh9NJkjNCIiE-P4cuOREqCGyqx7EGP83_BwO4aVBBwo',
      receipts_folder: DRIVE_FOLDER_URL,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Alle importierten Einträge löschen (Reset)
export async function DELETE() {
  try {
    const result = await query(
      `DELETE FROM journal_entries WHERE notes LIKE '%Google-Sheet-Import%' RETURNING id`
    );

    const count = result.data?.length || 0;

    return NextResponse.json({
      success: true,
      message: `${count} importierte Einträge gelöscht`,
      deleted_count: count,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
