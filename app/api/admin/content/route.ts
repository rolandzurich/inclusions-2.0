import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // TODO: Auth-Check
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Migrate to PostgreSQL via lib/db-postgres
    return NextResponse.json([]);
  } catch (error) {
    console.error('Error fetching content blocks:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Content-Blocks.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { key, title, body_markdown, image_url, published } = body;

    if (!key || !title) {
      return NextResponse.json(
        { error: 'Key und Title sind erforderlich.' },
        { status: 400 }
      );
    }

    // TODO: Migrate to PostgreSQL via lib/db-postgres
    return NextResponse.json(
      { error: 'Service nicht verfügbar. Content-Migration ausstehend.' },
      { status: 503 }
    );
  } catch (error) {
    console.error('Error saving content block:', error);
    return NextResponse.json(
      { error: 'Fehler beim Speichern des Content-Blocks.' },
      { status: 500 }
    );
  }
}

