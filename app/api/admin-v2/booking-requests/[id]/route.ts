export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db-postgres';

// PUT - Status/Notizen aktualisieren
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status, admin_notes } = body;

    const sql = `
      UPDATE booking_requests SET
        status = COALESCE($1, status),
        admin_notes = COALESCE($2, admin_notes),
        viewed_at = NOW(),
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
      message: 'Anfrage aktualisiert',
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
      `DELETE FROM booking_requests WHERE id = $1 RETURNING *`,
      [params.id]
    );

    if (!result.data || result.data.length === 0) {
      return NextResponse.json({ error: 'Nicht gefunden' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Anfrage gelöscht' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
