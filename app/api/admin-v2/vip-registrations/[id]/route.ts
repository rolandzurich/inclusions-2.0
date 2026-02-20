export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db-postgres';

// GET - Einzelne VIP-Registrierung (markiert als gelesen)
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Markiere als gelesen
    await query(
      `UPDATE vip_registrations SET viewed_at = NOW() WHERE id = $1 AND viewed_at IS NULL`,
      [params.id]
    );

    const sql = `
      SELECT
        v.*,
        c.first_name, c.last_name, c.email, c.phone,
        c.has_disability, c.has_iv_card, c.special_needs,
        c.address_line1 as address, c.postal_code, c.city,
        cg.first_name as cg_first_name, cg.last_name as cg_last_name,
        cg.email as cg_email, cg.phone as cg_phone
      FROM vip_registrations v
      JOIN contacts c ON v.contact_id = c.id
      LEFT JOIN contacts cg ON v.caregiver_id = cg.id
      WHERE v.id = $1
    `;

    const result = await query(sql, [params.id]);

    if (!result.data || result.data.length === 0) {
      return NextResponse.json({ error: 'Nicht gefunden' }, { status: 404 });
    }

    return NextResponse.json({ success: true, registration: result.data[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Status/Notizen aktualisieren
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status, admin_notes } = body;

    const sql = `
      UPDATE vip_registrations SET
        status = COALESCE($1, status),
        admin_notes = COALESCE($2, admin_notes),
        updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `;

    const result = await query(sql, [status || null, admin_notes || null, params.id]);

    if (!result.data || result.data.length === 0) {
      return NextResponse.json({ error: 'Nicht gefunden' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Registrierung aktualisiert',
      registration: result.data[0],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const result = await query(
      `DELETE FROM vip_registrations WHERE id = $1 RETURNING *`,
      [params.id]
    );

    if (!result.data || result.data.length === 0) {
      return NextResponse.json({ error: 'Nicht gefunden' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Registrierung gelöscht' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
