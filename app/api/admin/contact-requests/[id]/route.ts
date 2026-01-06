import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Auth-Check
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const { supabaseAdmin } = await import('@/lib/supabase');
      if (!supabaseAdmin) {
        throw new Error('Supabase nicht verfügbar');
      }
      
      const { error } = await supabaseAdmin
        .from('contact_requests')
        .delete()
        .eq('id', params.id);

      if (error) {
        console.error('Database error:', error);
        return NextResponse.json(
          { error: 'Fehler beim Löschen der Anfrage.' },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    } catch (supabaseError) {
      return NextResponse.json(
        { error: 'Supabase nicht verfügbar.' },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Error deleting contact request:', error);
    return NextResponse.json(
      { error: 'Fehler beim Löschen der Anfrage.' },
      { status: 500 }
    );
  }
}

