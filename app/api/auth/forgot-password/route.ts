/**
 * POST /api/auth/forgot-password
 * 
 * Sendet einen Passwort-Reset-Link per E-Mail.
 * Token ist 1 Stunde gültig.
 * 
 * Body: { email: string }
 */
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db-postgres';
import { sendEmail } from '@/lib/resend';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'E-Mail ist erforderlich.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // User suchen
    const result = await query(
      `SELECT id, email, name, status FROM users WHERE email = $1`,
      [normalizedEmail]
    );

    // Immer gleiche Antwort (verhindert E-Mail-Enumeration)
    const successResponse = {
      success: true,
      message: 'Falls ein Konto mit dieser E-Mail existiert, wurde ein Reset-Link gesendet.',
    };

    if (!result.data || result.data.length === 0) {
      return NextResponse.json(successResponse);
    }

    const user = result.data[0];

    if (user.status === 'disabled') {
      return NextResponse.json(successResponse);
    }

    // Reset-Token generieren (1 Stunde gültig)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    await query(
      `UPDATE users 
       SET invite_token = $1, invite_expires_at = $2, updated_at = NOW()
       WHERE id = $3`,
      [resetToken, expiresAt, user.id]
    );

    // Reset-Link zusammenbauen
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://inclusions.zone';
    const resetUrl = `${siteUrl}/crew/reset-password?token=${resetToken}`;

    // E-Mail senden
    await sendEmail({
      to: user.email,
      subject: 'Inclusions – Passwort zurücksetzen',
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, #3b82f6, #6366f1); color: white; font-size: 24px; font-weight: bold; line-height: 48px;">I</div>
          </div>
          <h2 style="text-align: center; color: #111; margin-bottom: 8px;">Passwort zurücksetzen</h2>
          <p style="color: #555; text-align: center;">
            Hallo ${user.name || 'Team-Mitglied'},
          </p>
          <p style="color: #555; text-align: center;">
            Klicke auf den Button, um dein Passwort zurückzusetzen.
            Der Link ist <strong>1 Stunde</strong> gültig.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetUrl}" 
               style="display: inline-block; padding: 12px 32px; background: linear-gradient(135deg, #3b82f6, #6366f1); color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
              Neues Passwort setzen
            </a>
          </div>
          <p style="color: #999; font-size: 13px; text-align: center;">
            Falls du diese Anfrage nicht gestellt hast, ignoriere diese E-Mail.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="color: #bbb; font-size: 11px; text-align: center;">
            Inclusions Crew · inclusions.zone
          </p>
        </div>
      `,
    });

    return NextResponse.json(successResponse);
  } catch (err: any) {
    console.error('Forgot-Password Fehler:', err);
    return NextResponse.json(
      { error: 'Fehler beim Senden. Bitte versuche es erneut.' },
      { status: 500 }
    );
  }
}
