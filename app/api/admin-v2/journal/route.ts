export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db-postgres';

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
    const params: any[] = [];

    if (from) {
      sql += ` AND j.entry_date >= $${params.length + 1}`;
      params.push(from);
    }

    if (to) {
      sql += ` AND j.entry_date <= $${params.length + 1}`;
      params.push(to);
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

    const result = await query(sql, params);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // Berechne Summen
    const entries = result.data || [];
    const totalIncome = entries.reduce((sum: number, e: any) => sum + parseFloat(e.income_amount || 0), 0);
    const totalExpense = entries.reduce((sum: number, e: any) => sum + parseFloat(e.expense_amount || 0), 0);
    const balance = totalIncome - totalExpense;
    const reimbursedExpense = entries
      .filter((e: any) => e.entry_type === 'expense' && e.is_reimbursed)
      .reduce((sum: number, e: any) => sum + parseFloat(e.amount_chf || 0), 0);
    const openExpense = totalExpense - reimbursedExpense;

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

    const result = await query(sql, [
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
      notes || null,
      is_reconciled,
      metadata || null,
      supplier || null,
      paid_by || null,
      is_reimbursed,
      original_currency || 'CHF',
      original_amount || null,
      receipt_url || null,
      receipt_filename || null,
    ]);

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
