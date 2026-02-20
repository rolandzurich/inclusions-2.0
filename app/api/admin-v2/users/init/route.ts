/**
 * POST /api/admin-v2/users/init
 * 
 * Initialisiert die Users-Tabelle und setzt die Passwort-Hashes
 * für die Seed-User (Roland, Reto).
 * 
 * Nur einmal nötig nach Migration 004.
 */
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db-postgres';
import bcrypt from 'bcryptjs';

export async function POST() {
  try {
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      return NextResponse.json(
        { error: 'ADMIN_PASSWORD nicht in .env konfiguriert' },
        { status: 500 }
      );
    }

    // Hash generieren
    const hash = await bcrypt.hash(adminPassword, 12);

    // Placeholder-Hashes durch echte ersetzen
    const result = await query(
      `UPDATE users 
       SET password_hash = $1, updated_at = NOW()
       WHERE password_hash = '$PLACEHOLDER_HASH$'
       RETURNING email, name, role, status`,
      [hash]
    );

    const updated = result.data?.length || 0;

    return NextResponse.json({
      success: true,
      message: `${updated} User-Passwörter initialisiert`,
      users: result.data || [],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
