/**
 * POST /api/auth/accept-invite
 * 
 * Nimmt eine Einladung an: User setzt sein Passwort.
 * Body: { token: string, password: string }
 */
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db-postgres';
import { hashPassword, createToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token und Passwort sind erforderlich' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Passwort muss mindestens 8 Zeichen lang sein' },
        { status: 400 }
      );
    }

    // User mit diesem Token suchen
    const userResult = await query(
      `SELECT id, email, name, role, status, invite_expires_at
       FROM users
       WHERE invite_token = $1`,
      [token]
    );

    if (!userResult.data || userResult.data.length === 0) {
      return NextResponse.json(
        { error: 'Ungültiger oder abgelaufener Einladungslink' },
        { status: 400 }
      );
    }

    const user = userResult.data[0];

    // Ablauf prüfen
    if (user.invite_expires_at && new Date(user.invite_expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Die Einladung ist abgelaufen. Bitte einen Admin kontaktieren.' },
        { status: 400 }
      );
    }

    // Passwort setzen und User aktivieren
    const hash = await hashPassword(password);
    await query(
      `UPDATE users 
       SET password_hash = $1, 
           status = 'active', 
           invite_token = NULL, 
           invite_expires_at = NULL,
           updated_at = NOW()
       WHERE id = $2`,
      [hash, user.id]
    );

    // Gleich einloggen
    const authToken = await createToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Willkommen! Dein Account ist jetzt aktiv.',
      user: {
        email: user.email,
        role: user.role,
        name: user.name,
      },
    });

    setAuthCookie(response, authToken);
    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
