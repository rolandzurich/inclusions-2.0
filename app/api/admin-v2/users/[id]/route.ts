/**
 * GET    /api/admin-v2/users/:id → Einzelnen User abrufen
 * PUT    /api/admin-v2/users/:id → User aktualisieren (Rolle, Status, Name)
 * DELETE /api/admin-v2/users/:id → User löschen
 */
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db-postgres';
import { hashPassword } from '@/lib/auth';

// GET – Einzelner User
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const result = await query(
      `SELECT id, email, name, role, status, created_at, updated_at, last_login_at
       FROM users WHERE id = $1`,
      [params.id]
    );

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    if (!result.data || result.data.length === 0) {
      return NextResponse.json({ error: 'User nicht gefunden' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: result.data[0],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT – User aktualisieren
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, role, status, password } = body;

    // Aktuellen User prüfen (kann sich nicht selbst deaktivieren)
    const currentUserId = request.headers.get('x-user-id');
    if (currentUserId === params.id && status === 'disabled') {
      return NextResponse.json(
        { error: 'Du kannst dich nicht selbst deaktivieren' },
        { status: 400 }
      );
    }

    // Dynamisches Update bauen
    const updates: string[] = [];
    const values: any[] = [];
    let paramIdx = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramIdx++}`);
      values.push(name);
    }

    if (role !== undefined) {
      if (!['admin', 'crew'].includes(role)) {
        return NextResponse.json(
          { error: 'Ungültige Rolle. Erlaubt: admin, crew' },
          { status: 400 }
        );
      }
      updates.push(`role = $${paramIdx++}`);
      values.push(role);
    }

    if (status !== undefined) {
      if (!['active', 'pending', 'disabled'].includes(status)) {
        return NextResponse.json(
          { error: 'Ungültiger Status. Erlaubt: active, pending, disabled' },
          { status: 400 }
        );
      }
      updates.push(`status = $${paramIdx++}`);
      values.push(status);
    }

    if (password) {
      if (password.length < 8) {
        return NextResponse.json(
          { error: 'Passwort muss mindestens 8 Zeichen lang sein' },
          { status: 400 }
        );
      }
      const hash = await hashPassword(password);
      updates.push(`password_hash = $${paramIdx++}`);
      values.push(hash);
      // Einladungstoken löschen wenn Passwort gesetzt wird
      updates.push(`invite_token = NULL`);
      updates.push(`invite_expires_at = NULL`);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'Keine Änderungen angegeben' },
        { status: 400 }
      );
    }

    updates.push(`updated_at = NOW()`);
    values.push(params.id);

    const result = await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIdx}
       RETURNING id, email, name, role, status, updated_at`,
      values
    );

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    if (!result.data || result.data.length === 0) {
      return NextResponse.json({ error: 'User nicht gefunden' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'User aktualisiert',
      user: result.data[0],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE – User löschen
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Kann sich nicht selbst löschen
    const currentUserId = request.headers.get('x-user-id');
    if (currentUserId === params.id) {
      return NextResponse.json(
        { error: 'Du kannst dich nicht selbst löschen' },
        { status: 400 }
      );
    }

    const result = await query(
      `DELETE FROM users WHERE id = $1 RETURNING email`,
      [params.id]
    );

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    if (!result.data || result.data.length === 0) {
      return NextResponse.json({ error: 'User nicht gefunden' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `User ${result.data[0].email} gelöscht`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
