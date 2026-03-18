export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { query, executeMultiple } from '@/lib/db-postgres';

const REQUIRED_COLUMNS = [
  'entry_type',
  'entry_date',
  'amount_chf',
  'created_at',
  'updated_at',
  'supplier',
  'paid_by',
  'is_reimbursed',
  'original_currency',
  'original_amount',
  'receipt_url',
  'receipt_filename',
  'metadata',
];

export async function GET() {
  try {
    const tableCheck = await query(`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'journal_entries'
      ) AS exists
    `);

    if (tableCheck.error) {
      return NextResponse.json(
        { ok: false, error: `DB-Check fehlgeschlagen: ${tableCheck.error}` },
        { status: 503 }
      );
    }

    const tableExists = Boolean(tableCheck.data?.[0]?.exists);
    if (!tableExists) {
      return NextResponse.json(
        {
          ok: false,
          ready: false,
          reason: 'journal_entries fehlt',
          missing_columns: REQUIRED_COLUMNS,
        },
        { status: 503 }
      );
    }

    const columnsRes = await query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'journal_entries'
    `);

    if (columnsRes.error) {
      return NextResponse.json(
        { ok: false, error: `Spalten-Check fehlgeschlagen: ${columnsRes.error}` },
        { status: 503 }
      );
    }

    const presentColumns = new Set((columnsRes.data || []).map((r: any) => r.column_name));
    const missingColumns = REQUIRED_COLUMNS.filter((col) => !presentColumns.has(col));

    const statsRes = await query(`
      SELECT
        COUNT(*)::int AS total_entries,
        MIN(entry_date)::text AS min_entry_date,
        MAX(entry_date)::text AS max_entry_date
      FROM journal_entries
    `);

    if (statsRes.error) {
      return NextResponse.json(
        { ok: false, error: `Buchhaltungs-Statistik fehlgeschlagen: ${statsRes.error}` },
        { status: 503 }
      );
    }

    const stats = statsRes.data?.[0] || {
      total_entries: 0,
      min_entry_date: null,
      max_entry_date: null,
    };

    return NextResponse.json({
      ok: true,
      ready: missingColumns.length === 0,
      table_exists: true,
      missing_columns: missingColumns,
      total_entries: stats.total_entries || 0,
      min_entry_date: stats.min_entry_date,
      max_entry_date: stats.max_entry_date,
      checked_at: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || 'Unbekannter Fehler',
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const migration = await executeMultiple(`
      ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS supplier TEXT;
      ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS paid_by TEXT;
      ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS is_reimbursed BOOLEAN DEFAULT false;
      ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS original_currency TEXT DEFAULT 'CHF';
      ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS original_amount DECIMAL(12, 2);
      ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS receipt_url TEXT;
      ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS receipt_filename TEXT;
      ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS metadata JSONB
    `);

    if (!migration.success) {
      return NextResponse.json(
        { ok: false, error: migration.error || 'Migration fehlgeschlagen' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: 'Buchhaltungs-Schema vorbereitet',
      migration_results: migration.results,
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || 'Unbekannter Fehler' },
      { status: 500 }
    );
  }
}
