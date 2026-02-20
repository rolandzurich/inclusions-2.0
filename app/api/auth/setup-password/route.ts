/**
 * POST /api/auth/setup-password
 * 
 * Ermöglicht eingeladenen Usern (status=pending) ihr Passwort zu setzen.
 * Aktiviert den Account automatisch und loggt den User ein.
 * 
 * Body: { email: string, password: string }
 */
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db-postgres';
import { hashPassword, createToken, setAuthCookie } from '@/lib/auth';
import type { UserRole } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'E-Mail und Passwort sind erforderlich.' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Passwort muss mindestens 8 Zeichen lang sein.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // User suchen
    const result = await query(
      `SELECT id, email, name, role, status FROM users WHERE email = $1`,
      [normalizedEmail]
    );

    if (!result.data || result.data.length === 0) {
      return NextResponse.json(
        { error: 'Kein Konto mit dieser E-Mail gefunden. Bitte einen Admin kontaktieren.' },
        { status: 404 }
      );
    }

    const user = result.data[0];

    // Nur pending-User dürfen ihr Passwort setzen
    if (user.status === 'active') {
      return NextResponse.json(
        { error: 'Dein Konto ist bereits aktiv. Bitte melde dich an.' },
        { status: 400 }
      );
    }

    if (user.status === 'disabled') {
      return NextResponse.json(
        { error: 'Dein Konto ist deaktiviert. Bitte einen Admin kontaktieren.' },
        { status: 403 }
      );
    }

    // Passwort hashen und Account aktivieren
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
    const token = await createToken({
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
      name: user.name,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Passwort gesetzt! Du bist jetzt eingeloggt.',
      user: {
        email: user.email,
        role: user.role,
        name: user.name,
      },
    });

    setAuthCookie(response, token);
    return response;
  } catch (err: any) {
    console.error('Setup-Password Fehler:', err);
    return NextResponse.json(
      { error: 'Fehler beim Einrichten des Passworts.' },
      { status: 500 }
    );
  }
}
