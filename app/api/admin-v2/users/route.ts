/**
 * GET  /api/admin-v2/users → Alle User auflisten
 * POST /api/admin-v2/users → Neuen User einladen
 */
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db-postgres';
import { hashPassword } from '@/lib/auth';
import crypto from 'crypto';

// GET – Alle User
export async function GET() {
  try {
    const result = await query(
      `SELECT id, email, name, role, status, created_at, updated_at, last_login_at,
              invited_by, invite_token IS NOT NULL as has_invite
       FROM users
       ORDER BY created_at DESC`
    );

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      users: result.data || [],
      count: result.data?.length || 0,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST – Neuen User einladen
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, role = 'crew', password } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'E-Mail ist erforderlich' },
        { status: 400 }
      );
    }

    if (!['admin', 'crew'].includes(role)) {
      return NextResponse.json(
        { error: 'Ungültige Rolle. Erlaubt: admin, crew' },
        { status: 400 }
      );
    }

    // Prüfen ob User bereits existiert
    const existing = await query(
      `SELECT id FROM users WHERE email = $1`,
      [email.toLowerCase().trim()]
    );

    if (existing.data && existing.data.length > 0) {
      return NextResponse.json(
        { error: 'Ein User mit dieser E-Mail existiert bereits' },
        { status: 409 }
      );
    }

    // Passwort: Entweder vom Admin gesetzt oder Einladungs-Token generieren
    let passwordHash: string;
    let inviteToken: string | null = null;
    let inviteExpires: string | null = null;
    let status = 'active';

    if (password) {
      // Admin setzt direkt ein Passwort → User ist sofort aktiv
      if (password.length < 8) {
        return NextResponse.json(
          { error: 'Passwort muss mindestens 8 Zeichen lang sein' },
          { status: 400 }
        );
      }
      passwordHash = await hashPassword(password);
    } else {
      // Kein Passwort → Einladung mit Token
      inviteToken = crypto.randomBytes(32).toString('hex');
      inviteExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 Tage
      passwordHash = '$INVITE_PENDING$'; // Placeholder
      status = 'pending';
    }

    // Einladenden Admin aus Header holen (von Middleware gesetzt)
    const invitedBy = request.headers.get('x-user-id');

    const result = await query(
      `INSERT INTO users (email, name, password_hash, role, status, invited_by, invite_token, invite_expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, email, name, role, status, created_at`,
      [
        email.toLowerCase().trim(),
        name || null,
        passwordHash,
        role,
        status,
        invitedBy && invitedBy !== 'unknown' && invitedBy !== 'env-fallback' ? invitedBy : null,
        inviteToken,
        inviteExpires,
      ]
    );

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: password ? 'User erstellt und aktiviert' : 'User eingeladen (Einladungslink generiert)',
      user: result.data?.[0],
      invite_token: inviteToken, // Für Admin zum Kopieren/Versenden
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
