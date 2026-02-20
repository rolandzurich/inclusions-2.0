import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET: Öffentlicher Zugriff auf published Content Blocks
// TODO: Migrate to PostgreSQL via lib/db-postgres
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(
      { error: 'Service nicht verfügbar. Content-Migration ausstehend.' },
      { status: 503 }
    );
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Inhalte.' },
      { status: 500 }
    );
  }
}

// POST/PUT/DELETE: Nur für Admin (wird später mit Auth geschützt)
// Für jetzt: Service Role Key Check
export async function POST(request: NextRequest) {
  try {
    // TODO: Auth-Check implementieren
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    if (!body.key) {
      return NextResponse.json(
        { error: 'Key ist erforderlich.' },
        { status: 400 }
      );
    }

    // TODO: Migrate to PostgreSQL via lib/db-postgres
    return NextResponse.json(
      { error: 'Service nicht verfügbar. Content-Migration ausstehend.' },
      { status: 503 }
    );
  } catch (error) {
    console.error('Error saving content:', error);
    return NextResponse.json(
      { error: 'Fehler beim Speichern der Inhalte.' },
      { status: 500 }
    );
  }
}

