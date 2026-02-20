/**
 * POST /api/auth/check-email
 * 
 * Prüft den Status einer E-Mail-Adresse.
 * Gibt zurück ob der User existiert und ob er pending/active ist.
 * 
 * Body: { email: string }
 * Response: { exists: boolean, status: 'active'|'pending'|'disabled'|'unknown', name?: string }
 */
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db-postgres';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'E-Mail ist erforderlich.' },
        { status: 400 }
      );
    }

    const result = await query(
      `SELECT name, status FROM users WHERE email = $1`,
      [email.toLowerCase().trim()]
    );

    if (!result.data || result.data.length === 0) {
      return NextResponse.json({
        exists: false,
        status: 'unknown',
      });
    }

    return NextResponse.json({
      exists: true,
      status: result.data[0].status,
      name: result.data[0].name,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
