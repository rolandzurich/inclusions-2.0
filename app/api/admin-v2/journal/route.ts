export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { executeMultiple, query } from '@/lib/db-postgres';

function normalizePaidBy(value: any): string | null {
  const raw = String(value || '').trim().toLowerCase();
  if (!raw) return null;
  if (raw.includes('roland')) return 'Roland';
  if (raw.includes('reto')) return 'Reto';
  return String(value).trim();
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

async function ensureJournalEntriesSchema() {
  const migrationResult = await executeMultiple(`
    ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS metadata JSONB;
  `);

  if (!migrationResult.success) {
    throw new Error(`Schema-Migration fehlgeschlagen: ${migrationResult.error}`);
  }
}

function isMissingMetadataColumnError(errorMessage?: string | null): boolean {
  if (!errorMessage) return false;
  return errorMessage.toLowerCase().includes('column "metadata" of relation "journal_entries" does not exist');
}

// GET - Alle Journal-Einträge
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from') || '';
    const to = searchParams.get('to') || '';
    const type = searchParams.get('type') || ''; // income, expense
    const category = searchParams.get('category') || '';
    const reimbursed = searchParams.get('reimbursed') || ''; // true, false
    const paidBy = searchParams.get('paid_by') || '';
    const openingBalance = parseFloat(
      searchParams.get('opening_balance') ||
        process.env.ACCOUNTING_OPENING_BALANCE_CHF ||
        '0'
    );

    let sql = `
      SELECT 
        j.*,
        CASE 
          WHEN j.entry_type = 'income' THEN j.amount_chf
          ELSE 0
        END as income_amount,
        CASE 
          WHEN j.entry_type = 'expense' THEN j.amount_chf
          ELSE 0
        END as expense_amount
      FROM journal_entries j
      WHERE 1=1
    `;
    let summarySql = `
      SELECT
        COALESCE(SUM(CASE WHEN j.entry_type = 'income' THEN j.amount_chf ELSE 0 END), 0) AS total_income,
        COALESCE(SUM(CASE WHEN j.entry_type = 'expense' THEN j.amount_chf ELSE 0 END), 0) AS total_expense,
        COALESCE(SUM(CASE WHEN j.entry_type = 'expense' AND COALESCE(NULLIF(TRIM(j.paid_by), ''), NULL) IS NOT NULL AND j.is_reimbursed = true THEN j.amount_chf ELSE 0 END), 0) AS reimbursed_expense,
        COALESCE(SUM(CASE WHEN j.entry_type = 'expense' AND COALESCE(NULLIF(TRIM(j.paid_by), ''), NULL) IS NOT NULL AND (j.is_reimbursed = false OR j.is_reimbursed IS NULL) THEN j.amount_chf ELSE 0 END), 0) AS open_expense,
        COALESCE(SUM(CASE WHEN j.entry_type = 'income' AND COALESCE(j.category, '') <> 'Transfer intern (nicht P&L)' THEN j.amount_chf ELSE 0 END), 0) AS operating_income,
        COALESCE(SUM(CASE WHEN j.entry_type = 'expense' AND COALESCE(j.category, '') <> 'Transfer intern (nicht P&L)' THEN j.amount_chf ELSE 0 END), 0) AS operating_expense,
        COALESCE(SUM(CASE WHEN j.entry_type = 'income' AND COALESCE(j.category, '') = 'Transfer intern (nicht P&L)' THEN j.amount_chf ELSE 0 END), 0) AS transfer_in,
        COALESCE(SUM(CASE WHEN j.entry_type = 'expense' AND COALESCE(j.category, '') = 'Transfer intern (nicht P&L)' THEN j.amount_chf ELSE 0 END), 0) AS transfer_out
      FROM journal_entries j
      WHERE 1=1
    `;
    const params: any[] = [];
    const summaryParams: any[] = [];

    if (from) {
      sql += ` AND j.entry_date >= $${params.length + 1}`;
      params.push(from);
      summarySql += ` AND j.entry_date >= $${summaryParams.length + 1}`;
      summaryParams.push(from);
    }

    if (to) {
      sql += ` AND j.entry_date <= $${params.length + 1}`;
      params.push(to);
      summarySql += ` AND j.entry_date <= $${summaryParams.length + 1}`;
      summaryParams.push(to);
    }

    if (type) {
      sql += ` AND j.entry_type = $${params.length + 1}`;
      params.push(type);
    }

    if (category) {
      sql += ` AND j.category = $${params.length + 1}`;
      params.push(category);
    }

    if (reimbursed === 'true' || reimbursed === 'false') {
      sql += ` AND j.is_reimbursed = $${params.length + 1}`;
      params.push(reimbursed === 'true');
    }

    if (paidBy) {
      sql += ` AND j.paid_by = $${params.length + 1}`;
      params.push(paidBy);
    }

    sql += ` ORDER BY j.entry_date DESC, j.created_at DESC`;

    const [result, summaryResult] = await Promise.all([
      query(sql, params),
      query(summarySql, summaryParams),
    ]);

    if (result.error || summaryResult.error) {
      return NextResponse.json(
        { error: result.error || summaryResult.error },
        { status: 500 }
      );
    }

    const entries = result.data || [];
    const summaryRow = summaryResult.data?.[0] || {
      total_income: 0,
      total_expense: 0,
      reimbursed_expense: 0,
      open_expense: 0,
    };

    const totalIncome = parseFloat(summaryRow.total_income || 0);
    const totalExpense = parseFloat(summaryRow.total_expense || 0);
    const reimbursedExpense = parseFloat(summaryRow.reimbursed_expense || 0);
    const openExpense = parseFloat(summaryRow.open_expense || 0);
    const operatingIncome = parseFloat(summaryRow.operating_income || 0);
    const operatingExpense = parseFloat(summaryRow.operating_expense || 0);
    const transferIn = parseFloat(summaryRow.transfer_in || 0);
    const transferOut = parseFloat(summaryRow.transfer_out || 0);
    const operatingResult = operatingIncome - operatingExpense;
    const balance = totalIncome - totalExpense;
    const estimatedClosingBalance = openingBalance + balance;

    return NextResponse.json({
      success: true,
      entries,
      count: entries.length,
      summary: {
        total_income: totalIncome,
        total_expense: totalExpense,
        reimbursed_expense: reimbursedExpense,
        open_expense: openExpense,
        balance,
        operating_income: operatingIncome,
        operating_expense: operatingExpense,
        operating_result: operatingResult,
        transfer_in: transferIn,
        transfer_out: transferOut,
        opening_balance: openingBalance,
        estimated_closing_balance: estimatedClosingBalance,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Neuer Journal-Eintrag
export async function POST(request: Request) {
  try {
    await ensureJournalEntriesSchema();

    const body = await request.json();
    const {
      entry_type,
      entry_date,
      amount_chf,
      vat_rate = 0,
      vat_amount_chf = 0,
      category,
      subcategory,
      description,
      reference,
      contact_id,
      company_id,
      project_id,
      event_id,
      notes,
      is_reconciled = false,
      metadata,
      supplier,
      paid_by,
      is_reimbursed = false,
      original_currency = 'CHF',
      original_amount,
      receipt_url,
      receipt_filename,
    } = body;

    if (!entry_type || !entry_date || !amount_chf) {
      return NextResponse.json(
        { error: 'Typ, Datum und Betrag sind erforderlich' },
        { status: 400 }
      );
    }

    if (!['income', 'expense'].includes(entry_type)) {
      return NextResponse.json(
        { error: 'Typ muss "income" oder "expense" sein' },
        { status: 400 }
      );
    }

    // Validiere MWST-Satz (Schweiz: 8.1%, 2.6%, 0%)
    const validVatRates = [0, 2.6, 8.1];
    if (vat_rate && !validVatRates.includes(parseFloat(vat_rate))) {
      return NextResponse.json(
        { error: 'Ungültiger MWST-Satz. Erlaubt: 0%, 2.6%, 8.1%' },
        { status: 400 }
      );
    }

    if (amount_chf && (isNaN(amount_chf) || amount_chf <= 0)) {
      return NextResponse.json(
        { error: 'Betrag muss positiv sein' },
        { status: 400 }
      );
    }

    const normalizedPaidBy = normalizePaidBy(paid_by);
    const hasReceipt = Boolean(receipt_filename || receipt_url || metadata?.attachment);
    const dedupKey = buildDedupKey({
      entry_type,
      entry_date,
      amount_chf: Number(amount_chf),
      description,
      supplier,
      paid_by: normalizedPaidBy,
      reference,
    });

    const duplicateCheck = await query(
      `
        SELECT id, entry_date, amount_chf, description
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
      [
        entry_type,
        entry_date,
        amount_chf,
        description || '',
        supplier || '',
        normalizedPaidBy || '',
        reference || '',
      ]
    );

    if (duplicateCheck.error) {
      return NextResponse.json({ error: duplicateCheck.error }, { status: 500 });
    }

    if (duplicateCheck.data && duplicateCheck.data.length > 0) {
      return NextResponse.json(
        {
          success: false,
          duplicate: true,
          error: 'Potenzielles Duplikat erkannt. Eintrag wurde nicht erstellt.',
          dedup_key: dedupKey,
          existing_entry: duplicateCheck.data[0],
        },
        { status: 409 }
      );
    }

    const sql = `
      INSERT INTO journal_entries (
        entry_type, entry_date, amount_chf, vat_rate, vat_amount_chf,
        category, subcategory, description, reference, contact_id,
        company_id, project_id, event_id, notes, is_reconciled, metadata,
        supplier, paid_by, is_reimbursed, original_currency, original_amount,
        receipt_url, receipt_filename
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
      RETURNING *
    `;

    let result = await query(sql, [
      entry_type,
      entry_date,
      amount_chf,
      vat_rate || 0,
      vat_amount_chf || 0,
      category || null,
      subcategory || null,
      description || null,
      reference || null,
      contact_id || null,
      company_id || null,
      project_id || null,
      event_id || null,
      notes || (hasReceipt ? null : 'Beleg fehlt'),
      is_reconciled,
      {
        ...(metadata || {}),
        dedup_key: dedupKey,
        receipt_missing: !hasReceipt,
      },
      supplier || null,
      normalizedPaidBy,
      is_reimbursed,
      original_currency || 'CHF',
      original_amount || null,
      receipt_url || null,
      receipt_filename || null,
    ]);

    if (isMissingMetadataColumnError(result.error)) {
      const fallbackSql = `
        INSERT INTO journal_entries (
          entry_type, entry_date, amount_chf, vat_rate, vat_amount_chf,
          category, subcategory, description, reference, contact_id,
          company_id, project_id, event_id, notes, is_reconciled,
          supplier, paid_by, is_reimbursed, original_currency, original_amount,
          receipt_url, receipt_filename
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
        RETURNING *
      `;

      result = await query(fallbackSql, [
        entry_type,
        entry_date,
        amount_chf,
        vat_rate || 0,
        vat_amount_chf || 0,
        category || null,
        subcategory || null,
        description || null,
        reference || null,
        contact_id || null,
        company_id || null,
        project_id || null,
        event_id || null,
        notes || (hasReceipt ? null : 'Beleg fehlt'),
        is_reconciled,
        supplier || null,
        normalizedPaidBy,
        is_reimbursed,
        original_currency || 'CHF',
        original_amount || null,
        receipt_url || null,
        receipt_filename || null,
      ]);
    }

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Eintrag erfolgreich erstellt',
      entry: result.data?.[0],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
