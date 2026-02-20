export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db-postgres';

// GET - Einzelner Deal
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const sql = `
      SELECT 
        d.*,
        CONCAT(co.first_name, ' ', co.last_name) as contact_name,
        comp.name as company_name
      FROM deals d
      LEFT JOIN contacts co ON d.contact_id = co.id
      LEFT JOIN companies comp ON d.company_id = comp.id
      WHERE d.id = $1
    `;

    const result = await query(sql, [params.id]);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    if (!result.data || result.data.length === 0) {
      return NextResponse.json(
        { error: 'Deal nicht gefunden' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      deal: result.data[0],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Deal aktualisieren
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      contact_id,
      company_id,
      amount_chf,
      status,
      expected_close_date,
      notes,
    } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Titel ist erforderlich' },
        { status: 400 }
      );
    }

    if (amount_chf && (isNaN(amount_chf) || amount_chf < 0)) {
      return NextResponse.json(
        { error: 'Ungültiger Betrag' },
        { status: 400 }
      );
    }

    const sql = `
      UPDATE deals SET
        title = $1,
        description = $2,
        contact_id = $3,
        company_id = $4,
        amount_chf = $5,
        status = $6,
        expected_close_date = $7,
        notes = $8,
        updated_at = NOW()
      WHERE id = $9
      RETURNING *
    `;

    const result = await query(sql, [
      title,
      description || null,
      contact_id || null,
      company_id || null,
      amount_chf || 0,
      status || 'lead',
      expected_close_date || null,
      notes || null,
      params.id,
    ]);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    if (!result.data || result.data.length === 0) {
      return NextResponse.json(
        { error: 'Deal nicht gefunden' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Deal erfolgreich aktualisiert',
      deal: result.data[0],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Deal löschen
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const sql = `DELETE FROM deals WHERE id = $1 RETURNING *`;
    const result = await query(sql, [params.id]);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    if (!result.data || result.data.length === 0) {
      return NextResponse.json(
        { error: 'Deal nicht gefunden' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Deal erfolgreich gelöscht',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
