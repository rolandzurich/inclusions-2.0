import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // TODO: Auth-Check
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Versuche zuerst Supabase, dann direkten DB-Zugriff
    try {
      const { supabaseAdmin } = await import('@/lib/supabase');
      
      if (supabaseAdmin) {
        const { data, error } = await supabaseAdmin
          .from('newsletter_subscribers')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          return NextResponse.json(data);
        }
      }
    } catch (supabaseError) {
      console.warn('Supabase not available, trying direct DB access');
    }

    // Fallback: Direkter Datenbankzugriff
    try {
      const { queryDb } = await import('@/lib/db-direct');
      const { data, error } = await queryDb(
        'SELECT * FROM newsletter_subscribers ORDER BY created_at DESC'
      );

      if (error) {
        return NextResponse.json(
          { error: 'Fehler beim Laden der Newsletter-Anmeldungen.', details: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json(data || []);
    } catch (dbError) {
      return NextResponse.json(
        { error: 'Datenbank nicht erreichbar' },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Error fetching newsletter subscribers:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Newsletter-Anmeldungen.' },
      { status: 500 }
    );
  }
}

