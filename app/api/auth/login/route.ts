/**
 * POST /api/auth/login
 * 
 * Authentifiziert User gegen die users-Tabelle (bcrypt).
 * Fallback auf .env ADMIN_PASSWORD wenn users-Tabelle leer.
 * 
 * Body: { email: string, password: string }
 * Response: { success: true, user: { email, role, name } }
 * Cookie: inclusions_admin_token (JWT, httpOnly)
 */
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import {
  createToken,
  getUserByEmail,
  verifyPassword,
  updateLastLogin,
  setAuthCookie,
  validatePassword,
  getUserRole,
} from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'E-Mail und Passwort sind erforderlich.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // === Strategie 1: User in DB suchen ===
    const dbUser = await getUserByEmail(normalizedEmail);

    if (dbUser) {
      // User gefunden → Status prüfen
      if (dbUser.status === 'disabled') {
        return NextResponse.json(
          { error: 'Dein Account ist deaktiviert. Kontaktiere einen Admin.' },
          { status: 403 }
        );
      }

      if (dbUser.status === 'pending') {
        return NextResponse.json(
          { error: 'Dein Account wurde noch nicht aktiviert.' },
          { status: 403 }
        );
      }

      // Passwort prüfen (bcrypt)
      // Placeholder-Hash abfangen (noch nicht initialisiert)
      let passwordValid = false;
      if (dbUser.password_hash === '$PLACEHOLDER_HASH$') {
        // Fallback auf .env-Passwort während Migration
        passwordValid = validatePassword(password);
      } else {
        passwordValid = await verifyPassword(password, dbUser.password_hash);
      }

      if (!passwordValid) {
        return NextResponse.json(
          { error: 'Ungültige Anmeldedaten.' },
          { status: 401 }
        );
      }

      // Login erfolgreich → Token erstellen
      const token = await createToken({
        id: dbUser.id,
        email: dbUser.email,
        role: dbUser.role,
        name: dbUser.name,
      });

      // Last Login aktualisieren
      await updateLastLogin(dbUser.id);

      const response = NextResponse.json({
        success: true,
        user: {
          email: dbUser.email,
          role: dbUser.role,
          name: dbUser.name,
        },
      });

      setAuthCookie(response, token);
      return response;
    }

    // === Strategie 2: Fallback auf .env (Abwärtskompatibilität) ===
    // Nur für den Fall, dass die users-Tabelle noch nicht existiert
    const role = getUserRole(normalizedEmail);
    if (role === 'admin' && validatePassword(password)) {
      const token = await createToken({
        id: 'env-fallback',
        email: normalizedEmail,
        role: 'admin',
      });

      const response = NextResponse.json({
        success: true,
        user: {
          email: normalizedEmail,
          role: 'admin',
        },
      });

      setAuthCookie(response, token);
      return response;
    }

    // Nichts passt
    return NextResponse.json(
      { error: 'Ungültige Anmeldedaten.' },
      { status: 401 }
    );
  } catch (error: any) {
    console.error('Login-Fehler:', error);
    return NextResponse.json(
      { error: 'Anmeldung fehlgeschlagen.' },
      { status: 500 }
    );
  }
}
