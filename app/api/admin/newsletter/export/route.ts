import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET: Export newsletter subscribers as CSV for Mailchimp import
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Migrate to PostgreSQL via lib/db-postgres
    return NextResponse.json(
      { error: 'Service nicht verfügbar. Newsletter-Export-Migration ausstehend.' },
      { status: 503 }
    );
  } catch (error) {
    console.error('Error exporting newsletter subscribers:', error);
    return NextResponse.json(
      { error: 'Fehler beim Exportieren der Abonnenten.' },
      { status: 500 }
    );
  }
}
