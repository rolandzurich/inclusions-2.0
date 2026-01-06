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
          .from('contact_requests')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          return NextResponse.json(data);
        }
        console.warn('Supabase query failed, trying direct DB access:', error);
      }
    } catch (supabaseError) {
      console.warn('Supabase not available, trying direct DB access');
    }

    // Fallback: Direkter Datenbankzugriff für lokale Entwicklung
    try {
      const { queryDb } = await import('@/lib/db-direct');
      const { data, error } = await queryDb(
        'SELECT * FROM contact_requests ORDER BY created_at DESC'
      );

      if (error) {
        console.error('Direct DB error:', error);
        return NextResponse.json(
          { error: 'Fehler beim Laden der Anfragen.', details: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json(data || []);
    } catch (dbError) {
      console.error('Database access error:', dbError);
      return NextResponse.json(
        { error: 'Datenbank nicht erreichbar', details: dbError instanceof Error ? dbError.message : String(dbError) },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Error fetching contact requests:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Anfragen.' },
      { status: 500 }
    );
  }
}

