export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db-postgres';

function normalizePaidBy(value: any): string | null {
  const raw = String(value || '').trim().toLowerCase();
  if (!raw) return null;
  if (raw.includes('roland')) return 'Roland';
  if (raw.includes('reto')) return 'Reto';
  return String(value).trim();
}

/** Normalisiert ein Datum auf YYYY-MM-DD, unabhängig vom Timezone-Offset. */
function normalizeDate(raw: any): string | null {
  if (!raw) return null;
  const s = String(raw).trim();
  // ISO-Timestamp: 2026-03-17T23:00:00.000Z → nehme den Datums-Teil
  const match = s.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : null;
}

// GET - Alle Journal-Einträge
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from') || '';
    const to = searchParams.get('to') || '';
    const type = searchParams.get('type') || '';
    const category = searchParams.get('category') || '';
    const reimbursed = searchParams.get('reimbursed') || '';
    const paidBy = searchParams.get('paid_by') || '';
    const openingBalance = parseFloat(
      searchParams.get('opening_balance') ||
        process.env.ACCOUNTING_OPENING_BALANCE_CHF ||
        '0'
    );

    let sql = `
      SELECT
        j.*,
        CASE WHEN j.entry_type = 'income' THEN j.amount_chf ELSE 0 END as income_amount,
        CASE WHEN j.entry_type = 'expense' THEN j.amount_chf ELSE 0 END as expense_amount
      FROM journal_entries j
      WHERE 1=1
    `;
    let summarySql = `
      SELECT
        COALESCE(SUM(CASE WHEN j.entry_type = 'income' THEN j.amount_chf ELSE 0 END), 0) AS total_income,
        COALESCE(SUM(CASE WHEN j.entry_type = 'expense' THEN j.amount_chf ELSE 0 END), 0) AS total_expense,
        COALESCE(SUM(CASE WHEN j.entry_type = 'expense' AND j.is_reimbursed = true THEN j.amount_chf ELSE 0 END), 0) AS reimbursed_expense,
        COALESCE(SUM(CASE WHEN j.entry_type = 'expense' AND (j.is_reimbursed = false OR j.is_reimbursed IS NULL) AND COALESCE(NULLIF(TRIM(j.paid_by), ''), NULL) IS NOT NULL THEN j.amount_chf ELSE 0 END), 0) AS open_expense,
        COALESCE(SUM(CASE WHEN j.entry_type = 'income'  AND COALESCE(j.category, '') <> 'Transfer intern (nicht P&L)' THEN j.amount_chf ELSE 0 END), 0) AS operating_income,
        COALESCE(SUM(CASE WHEN j.entry_type = 'expense' AND COALESCE(j.category, '') <> 'Transfer intern (nicht P&L)' THEN j.amount_chf ELSE 0 END), 0) AS operating_expense,
        COALESCE(SUM(CASE WHEN j.entry_type = 'income'  AND COALESCE(j.category, '') = 'Transfer intern (nicht P&L)' THEN j.amount_chf ELSE 0 END), 0) AS transfer_in,
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
      return NextResponse.json({ error: result.error || summaryResult.error }, { status: 500 });
    }

    // Normalisiere entry_date in allen Einträgen zu YYYY-MM-DD
    const entries = (result.data || []).map((e: any) => ({
      ...e,
      entry_date: normalizeDate(e.entry_date) || e.entry_date,
    }));

    const summaryRow = summaryResult.data?.[0] || {};
    const totalIncome = parseFloat(summaryRow.total_income || 0);
    const totalExpense = parseFloat(summaryRow.total_expense || 0);
    const operatingIncome = parseFloat(summaryRow.operating_income || 0);
    const operatingExpense = parseFloat(summaryRow.operating_expense || 0);
    const balance = totalIncome - totalExpense;

    return NextResponse.json({
      success: true,
      entries,
      count: entries.length,
      summary: {
        total_income: totalIncome,
        total_expense: totalExpense,
        reimbursed_expense: parseFloat(summaryRow.reimbursed_expense || 0),
        open_expense: parseFloat(summaryRow.open_expense || 0),
        balance,
        operating_income: operatingIncome,
        operating_expense: operatingExpense,
        operating_result: operatingIncome - operatingExpense,
        transfer_in: parseFloat(summaryRow.transfer_in || 0),
        transfer_out: parseFloat(summaryRow.transfer_out || 0),
        opening_balance: openingBalance,
        estimated_closing_balance: openingBalance + balance,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Neuer Journal-Eintrag
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      entry_type,
      entry_date: rawEntryDate,
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

    if (!entry_type || !rawEntryDate || !amount_chf) {
      return NextResponse.json({ error: 'Typ, Datum und Betrag sind erforderlich' }, { status: 400 });
    }
    if (!['income', 'expense'].includes(entry_type)) {
      return NextResponse.json({ error: 'Typ muss "income" oder "expense" sein' }, { status: 400 });
    }
    const validVatRates = [0, 2.6, 8.1];
    if (vat_rate && !validVatRates.includes(parseFloat(vat_rate))) {
      return NextResponse.json({ error: 'Ungültiger MWST-Satz. Erlaubt: 0%, 2.6%, 8.1%' }, { status: 400 });
    }
    if (isNaN(amount_chf) || amount_chf <= 0) {
      return NextResponse.json({ error: 'Betrag muss positiv sein' }, { status: 400 });
    }

    // Normalisiere Datum: nimm immer nur den YYYY-MM-DD Teil (kein UTC-Offset-Problem)
    const entry_date = normalizeDate(rawEntryDate) || rawEntryDate;

    const normalizedPaidBy = normalizePaidBy(paid_by);
    const hasReceipt = Boolean(receipt_filename || receipt_url || metadata?.attachment?.filename);

    // Duplikat-Check: ±1 Tag Toleranz um Timezone-Fehler abzufangen
    const duplicateCheck = await query(
      `SELECT id, entry_date, amount_chf, description
       FROM journal_entries
       WHERE entry_type = $1
         AND entry_date BETWEEN ($2::date - INTERVAL '1 day') AND ($2::date + INTERVAL '1 day')
         AND amount_chf = $3
         AND COALESCE(LOWER(description), '') = LOWER(COALESCE($4, ''))
         AND COALESCE(LOWER(supplier), '')   = LOWER(COALESCE($5, ''))
       LIMIT 1`,
      [entry_type, entry_date, amount_chf, description || '', supplier || '']
    );

    if (duplicateCheck.error) {
      return NextResponse.json({ error: duplicateCheck.error }, { status: 500 });
    }

    if (duplicateCheck.data && duplicateCheck.data.length > 0) {
      return NextResponse.json(
        {
          success: false,
          duplicate: true,
          error: 'Potenzielles Duplikat erkannt.',
          existing_entry: duplicateCheck.data[0],
        },
        { status: 409 }
      );
    }

    // Bereinige metadata: Attachment-Data (base64) wird NICHT in der DB gespeichert,
    // nur filename und type (spart Speicher, verhindert Timeouts)
    const cleanMetadata = metadata?.attachment
      ? {
          attachment: {
            filename: metadata.attachment.filename,
            type: metadata.attachment.type,
          },
        }
      : null;

    const result = await query(
      `INSERT INTO journal_entries (
         entry_type, entry_date, amount_chf, vat_rate, vat_amount_chf,
         category, subcategory, description, reference, contact_id,
         company_id, project_id, event_id, notes, is_reconciled, metadata,
         supplier, paid_by, is_reimbursed, original_currency, original_amount,
         receipt_url, receipt_filename
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23)
       RETURNING *`,
      [
        entry_type, entry_date, amount_chf,
        vat_rate || 0, vat_amount_chf || 0,
        category || null, subcategory || null, description || null,
        reference || null, contact_id || null, company_id || null,
        project_id || null, event_id || null,
        notes || null,
        is_reconciled,
        cleanMetadata,
        supplier || null, normalizedPaidBy,
        is_reimbursed,
        original_currency || 'CHF',
        original_amount || null,
        receipt_url || null,
        receipt_filename || null,
      ]
    );

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    const entry = result.data?.[0];
    return NextResponse.json({
      success: true,
      message: 'Eintrag erfolgreich erstellt',
      entry: entry ? { ...entry, entry_date: normalizeDate(entry.entry_date) || entry.entry_date } : null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
