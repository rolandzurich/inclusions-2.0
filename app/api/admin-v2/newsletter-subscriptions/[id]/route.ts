export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db-postgres';

// PUT - Status aktualisieren
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status } = body;

    const sql = `
      UPDATE newsletter_subscriptions SET
        status = COALESCE($1, status),
        updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;

    const result = await query(sql, [status || null, params.id]);

    if (!result.data || result.data.length === 0) {
      return NextResponse.json({ error: 'Nicht gefunden' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription aktualisiert',
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
      `DELETE FROM newsletter_subscriptions WHERE id = $1 RETURNING *`,
      [params.id]
    );

    if (!result.data || result.data.length === 0) {
      return NextResponse.json({ error: 'Nicht gefunden' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Subscription gelöscht' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
