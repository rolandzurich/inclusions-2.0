import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'E-Mail und Passwort sind erforderlich.' },
        { status: 400 }
      );
    }

    // Temporäre Test-Auth für lokale Entwicklung
    // TODO: Später durch echte Supabase Auth ersetzen
    const validCredentials = {
      'info@inclusions.zone': 'Inclusions2026!',
      'admin@inclusions.zone': 'Inclusions2026!',
    };

    if (validCredentials[email as keyof typeof validCredentials] === password) {
      // Erstelle ein einfaches Token (in Produktion: JWT verwenden)
      const token = Buffer.from(`${email}:${Date.now()}`).toString('base64');

      return NextResponse.json({
        success: true,
        token,
        user: {
          email,
          id: 'temp-admin-id',
        },
      });
    }

    return NextResponse.json(
      { error: 'Ungültige Anmeldedaten.' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Fehler bei der Anmeldung.' },
      { status: 500 }
    );
  }
}


