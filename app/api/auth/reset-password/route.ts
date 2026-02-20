/**
 * POST /api/auth/reset-password
 * 
 * Setzt ein neues Passwort mit gültigem Reset-Token.
 * Loggt den User danach automatisch ein.
 * 
 * Body: { token: string, password: string }
 */
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db-postgres';
import { hashPassword, createToken, setAuthCookie } from '@/lib/auth';
import type { UserRole } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token und Passwort sind erforderlich.' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Passwort muss mindestens 8 Zeichen lang sein.' },
        { status: 400 }
      );
    }

    // User mit Token suchen
    const result = await query(
      `SELECT id, email, name, role, status, invite_expires_at
       FROM users
       WHERE invite_token = $1`,
      [token]
    );

    if (!result.data || result.data.length === 0) {
      return NextResponse.json(
        { error: 'Ungültiger oder abgelaufener Link. Bitte fordere einen neuen an.' },
        { status: 400 }
      );
    }

    const user = result.data[0];

    // Ablauf prüfen
    if (user.invite_expires_at && new Date(user.invite_expires_at) < new Date()) {
      // Token aufräumen
      await query(
        `UPDATE users SET invite_token = NULL, invite_expires_at = NULL WHERE id = $1`,
        [user.id]
      );
      return NextResponse.json(
        { error: 'Der Link ist abgelaufen. Bitte fordere einen neuen an.' },
        { status: 400 }
      );
    }

    // Passwort setzen + Token aufräumen + ggf. Account aktivieren
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

    // Direkt einloggen
    const authToken = await createToken({
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
      name: user.name,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Passwort geändert! Du bist jetzt eingeloggt.',
      user: {
        email: user.email,
        role: user.role,
        name: user.name,
      },
    });

    setAuthCookie(response, authToken);
    return response;
  } catch (err: any) {
    console.error('Reset-Password Fehler:', err);
    return NextResponse.json(
      { error: 'Fehler beim Zurücksetzen.' },
      { status: 500 }
    );
  }
}
