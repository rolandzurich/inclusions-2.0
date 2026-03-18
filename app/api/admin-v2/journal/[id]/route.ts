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

function normalizeDate(raw: any): string | null {
  if (!raw) return null;
  const s = String(raw).trim();
  const match = s.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : null;
}

// GET - Einzelner Journal-Eintrag
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const result = await query(`SELECT * FROM journal_entries WHERE id = $1`, [params.id]);

    if (result.error) return NextResponse.json({ error: result.error }, { status: 500 });
    if (!result.data?.length) return NextResponse.json({ error: 'Eintrag nicht gefunden' }, { status: 404 });

    const entry = result.data[0];
    return NextResponse.json({
      success: true,
      entry: { ...entry, entry_date: normalizeDate(entry.entry_date) || entry.entry_date },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Journal-Eintrag aktualisieren
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const {
      entry_type,
      entry_date: rawEntryDate,
      amount_chf,
      vat_rate,
      vat_amount_chf,
      category,
      subcategory,
      description,
      reference,
      contact_id,
      company_id,
      project_id,
      event_id,
      notes,
      is_reconciled,
      metadata,
      supplier,
      paid_by,
      is_reimbursed,
      original_currency,
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
    if (vat_rate !== undefined && vat_rate !== null && !validVatRates.includes(parseFloat(vat_rate))) {
      return NextResponse.json({ error: 'Ungültiger MWST-Satz. Erlaubt: 0%, 2.6%, 8.1%' }, { status: 400 });
    }

    const entry_date = normalizeDate(rawEntryDate) || rawEntryDate;
    const normalizedPaidBy = normalizePaidBy(paid_by);

    // Bereinige metadata: base64-Daten werden nicht in der DB gespeichert
    const cleanMetadata = metadata?.attachment
      ? {
          attachment: {
            filename: metadata.attachment.filename,
            type: metadata.attachment.type,
          },
        }
      : (metadata || null);

    const result = await query(
      `UPDATE journal_entries SET
         entry_type         = $1,
         entry_date         = $2,
         amount_chf         = $3,
         vat_rate           = $4,
         vat_amount_chf     = $5,
         category           = $6,
         subcategory        = $7,
         description        = $8,
         reference          = $9,
         contact_id         = $10,
         company_id         = $11,
         project_id         = $12,
         event_id           = $13,
         notes              = $14,
         is_reconciled      = $15,
         metadata           = $16,
         supplier           = $17,
         paid_by            = $18,
         is_reimbursed      = $19,
         original_currency  = $20,
         original_amount    = $21,
         receipt_url        = $22,
         receipt_filename   = $23,
         updated_at         = NOW()
       WHERE id = $24
       RETURNING *`,
      [
        entry_type, entry_date, amount_chf,
        vat_rate ?? 0, vat_amount_chf ?? 0,
        category || null, subcategory || null, description || null,
        reference || null, contact_id || null, company_id || null,
        project_id || null, event_id || null,
        notes || null,
        is_reconciled !== undefined ? is_reconciled : false,
        cleanMetadata,
        supplier || null, normalizedPaidBy,
        is_reimbursed !== undefined ? is_reimbursed : false,
        original_currency || 'CHF',
        original_amount || null,
        receipt_url || null,
        receipt_filename || null,
        params.id,
      ]
    );

    if (result.error) return NextResponse.json({ error: result.error }, { status: 500 });
    if (!result.data?.length) return NextResponse.json({ error: 'Eintrag nicht gefunden' }, { status: 404 });

    const entry = result.data[0];
    return NextResponse.json({
      success: true,
      message: 'Eintrag erfolgreich aktualisiert',
      entry: { ...entry, entry_date: normalizeDate(entry.entry_date) || entry.entry_date },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Journal-Eintrag löschen
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const result = await query(`DELETE FROM journal_entries WHERE id = $1 RETURNING *`, [params.id]);

    if (result.error) return NextResponse.json({ error: result.error }, { status: 500 });
    if (!result.data?.length) return NextResponse.json({ error: 'Eintrag nicht gefunden' }, { status: 404 });

    return NextResponse.json({ success: true, message: 'Eintrag erfolgreich gelöscht' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
