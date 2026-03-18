export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { executeMultiple, query } from '@/lib/db-postgres';

type InputRow = Record<string, any>;

function normalizePaidBy(value: any): string | null {
  const raw = String(value || '').trim().toLowerCase();
  if (!raw) return null;
  if (raw.includes('roland')) return 'Roland';
  if (raw.includes('reto')) return 'Reto';
  return String(value).trim();
}

function parseBool(value: any): boolean {
  const raw = String(value || '').trim().toLowerCase();
  return ['1', 'true', 'yes', 'ja', 'j', 'x'].includes(raw);
}

function parseNumber(value: any): number | null {
  if (value === null || value === undefined) return null;
  const normalized = String(value)
    .replace(/'/g, '')
    .replace(/\s/g, '')
    .replace(',', '.')
    .trim();
  if (!normalized) return null;
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseDate(value: any): string | null {
  const raw = String(value || '').trim();
  if (!raw) return null;

  // dd.mm.yyyy
  const dotMatch = raw.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (dotMatch) {
    const day = dotMatch[1].padStart(2, '0');
    const month = dotMatch[2].padStart(2, '0');
    const year = dotMatch[3];
    return `${year}-${month}-${day}`;
  }

  // yyyy-mm-dd
  const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) return raw;

  return null;
}

function pick(row: InputRow, aliases: string[]): any {
  for (const alias of aliases) {
    const keys = Object.keys(row);
    const matched = keys.find((k) => k.trim().toLowerCase() === alias.trim().toLowerCase());
    if (matched && row[matched] !== undefined && row[matched] !== null && String(row[matched]).trim() !== '') {
      return row[matched];
    }
  }
  return null;
}

function detectEntryType(rawType: any, amount: number | null): 'expense' | 'income' {
  const type = String(rawType || '').trim().toLowerCase();
  if (type.includes('ein') || type.includes('income')) return 'income';
  if (type.includes('aus') || type.includes('expense')) return 'expense';
  if (amount !== null && amount < 0) return 'expense';
  return 'expense';
}

function buildDedupKey(input: {
  entry_type: string;
  entry_date: string;
  amount_chf: number;
  description?: string;
  supplier?: string;
  paid_by?: string | null;
  reference?: string;
}) {
  const normalizedDescription = String(input.description || '').trim().toLowerCase();
  const normalizedSupplier = String(input.supplier || '').trim().toLowerCase();
  const normalizedReference = String(input.reference || '').trim().toLowerCase();
  const normalizedPaidBy = String(input.paid_by || '').trim().toLowerCase();

  return [
    input.entry_type,
    input.entry_date,
    Number(input.amount_chf).toFixed(2),
    normalizedDescription,
    normalizedSupplier,
    normalizedPaidBy,
    normalizedReference,
  ].join('|');
}

export async function POST(request: Request) {
  try {
    const migrationResult = await executeMultiple(`
      ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS metadata JSONB;
    `);

    if (!migrationResult.success) {
      return NextResponse.json(
        { error: `Schema-Migration fehlgeschlagen: ${migrationResult.error}` },
        { status: 500 }
      );
    }

    const body = await request.json();
    const rows: InputRow[] = Array.isArray(body?.rows) ? body.rows : [];
    const commit = body?.commit === true;
    const sourceLabel = String(body?.source_label || 'Google-Sheet-Import').trim();
    const receiptsFolderUrl = String(body?.receipts_folder_url || '').trim();

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'rows ist leer. Erwartet: { rows: [...] }' },
        { status: 400 }
      );
    }

    const preview: any[] = [];
    const inserted: any[] = [];
    const duplicates: any[] = [];
    const invalid: any[] = [];

    for (let idx = 0; idx < rows.length; idx++) {
      const row = rows[idx];

      const entryDate = parseDate(pick(row, ['Datum', 'date', 'entry_date']));
      const description = String(pick(row, ['Was', 'Beschreibung', 'description']) || '').trim();
      const supplier = String(pick(row, ['Lieferant/ Partner', 'Lieferant', 'supplier']) || '').trim();
      const rawType = pick(row, ['Typ', 'entry_type']);
      const amountChf = parseNumber(pick(row, ['Betrag CHF', 'amount_chf', 'Betrag']));
      const originalCurrency = String(
        pick(row, ['Währung', 'currency', 'original_currency']) || 'CHF'
      ).trim().toUpperCase();
      const originalAmount = parseNumber(
        pick(row, ['Betrag Fremdwährung', 'original_amount'])
      );
      const paidBy = normalizePaidBy(pick(row, ['Wer', 'Bezahlt von', 'paid_by']));
      const isReimbursed = parseBool(
        pick(row, ['Als Spesen beglichen', 'is_reimbursed', 'Spesen bezahlt'])
      );
      const receiptPresent = parseBool(
        pick(row, ['Quittung vorhanden', 'receipt_present', 'beleg vorhanden'])
      );
      const notes = String(pick(row, ['Bemerkung', 'Notiz', 'notes']) || '').trim();
      const reference = String(pick(row, ['Referenz', 'reference', 'Rechnungsnummer']) || '').trim();
      const receiptFilename = String(
        pick(row, ['receipt_filename', 'Quittung', 'Beleg-Datei']) || ''
      ).trim();
      const entryType = detectEntryType(rawType, amountChf);
      const category = String(
        pick(row, ['Kategorie', 'category']) ||
          (entryType === 'income' ? 'Sonstige Einnahmen' : 'Sonstige Ausgaben')
      ).trim();

      if (!entryDate || !description || amountChf === null || amountChf <= 0) {
        invalid.push({
          row_index: idx + 1,
          reason: 'Pflichtfelder fehlen/ungueltig (Datum, Beschreibung, Betrag CHF > 0)',
          row,
        });
        continue;
      }

      const dedupKey = buildDedupKey({
        entry_type: entryType,
        entry_date: entryDate,
        amount_chf: amountChf,
        description,
        supplier,
        paid_by: paidBy,
        reference,
      });

      const dupCheck = await query(
        `
          SELECT id
          FROM journal_entries
          WHERE entry_type = $1
            AND entry_date = $2
            AND amount_chf = $3
            AND COALESCE(LOWER(description), '') = COALESCE(LOWER($4), '')
            AND COALESCE(LOWER(supplier), '') = COALESCE(LOWER($5), '')
            AND COALESCE(LOWER(paid_by), '') = COALESCE(LOWER($6), '')
            AND COALESCE(LOWER(reference), '') = COALESCE(LOWER($7), '')
          LIMIT 1
        `,
        [entryType, entryDate, amountChf, description, supplier, paidBy || '', reference]
      );

      if (dupCheck.error) {
        invalid.push({
          row_index: idx + 1,
          reason: `Duplikatpruefung fehlgeschlagen: ${dupCheck.error}`,
          row,
        });
        continue;
      }

      if (dupCheck.data && dupCheck.data.length > 0) {
        duplicates.push({
          row_index: idx + 1,
          existing_id: dupCheck.data[0].id,
          dedup_key: dedupKey,
          description,
          amount_chf: amountChf,
          entry_date: entryDate,
        });
        continue;
      }

      const normalized = {
        entry_type: entryType,
        entry_date: entryDate,
        amount_chf: amountChf,
        vat_rate: 0,
        vat_amount_chf: 0,
        category,
        description,
        reference: reference || null,
        notes: [notes, sourceLabel].filter(Boolean).join(' | ') || sourceLabel,
        is_reconciled: true,
        supplier: supplier || null,
        paid_by: paidBy,
        is_reimbursed: isReimbursed,
        original_currency: originalCurrency || 'CHF',
        original_amount: originalAmount,
        receipt_url: receiptPresent && receiptsFolderUrl ? receiptsFolderUrl : null,
        receipt_filename: receiptFilename || null,
        metadata: {
          dedup_key: dedupKey,
          receipt_missing: !receiptPresent,
          import_source: sourceLabel,
        },
      };

      preview.push({
        row_index: idx + 1,
        ...normalized,
      });

      if (commit) {
        const insertRes = await query(
          `
            INSERT INTO journal_entries (
              entry_type, entry_date, amount_chf, vat_rate, vat_amount_chf,
              category, description, reference, notes, is_reconciled, metadata,
              supplier, paid_by, is_reimbursed, original_currency, original_amount,
              receipt_url, receipt_filename
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
            RETURNING id, entry_date, description, amount_chf
          `,
          [
            normalized.entry_type,
            normalized.entry_date,
            normalized.amount_chf,
            normalized.vat_rate,
            normalized.vat_amount_chf,
            normalized.category,
            normalized.description,
            normalized.reference,
            normalized.notes,
            normalized.is_reconciled,
            normalized.metadata,
            normalized.supplier,
            normalized.paid_by,
            normalized.is_reimbursed,
            normalized.original_currency,
            normalized.original_amount,
            normalized.receipt_url,
            normalized.receipt_filename,
          ]
        );

        if (insertRes.error) {
          invalid.push({
            row_index: idx + 1,
            reason: `Insert fehlgeschlagen: ${insertRes.error}`,
            row,
          });
          continue;
        }

        inserted.push(insertRes.data?.[0]);
      }
    }

    return NextResponse.json({
      success: true,
      mode: commit ? 'commit' : 'preview',
      summary: {
        input_rows: rows.length,
        new_rows: preview.length,
        inserted: inserted.length,
        duplicates: duplicates.length,
        invalid: invalid.length,
      },
      preview: commit ? undefined : preview,
      inserted: commit ? inserted : undefined,
      duplicates,
      invalid,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Unbekannter Fehler' },
      { status: 500 }
    );
  }
}
