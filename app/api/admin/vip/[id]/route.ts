import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET: Get single VIP registration and mark as viewed
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const { supabaseAdmin } = await import('@/lib/supabase');
      if (!supabaseAdmin) {
        throw new Error('Supabase nicht verfügbar');
      }
      
      // Get the VIP registration
      const { data, error } = await supabaseAdmin
        .from('vip_registrations')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) {
        console.error('Database error:', error);
        return NextResponse.json(
          { error: 'Fehler beim Laden der VIP-Anmeldung.' },
          { status: 500 }
        );
      }

      // Mark as viewed if not already viewed
      if (data && !data.viewed_at) {
        await supabaseAdmin
          .from('vip_registrations')
          .update({ viewed_at: new Date().toISOString() })
          .eq('id', params.id);
      }

      return NextResponse.json(data);
    } catch (supabaseError) {
      return NextResponse.json(
        { error: 'Supabase nicht verfügbar.' },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Error fetching VIP registration:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der VIP-Anmeldung.' },
      { status: 500 }
    );
  }
}

// PATCH: Update VIP registration (e.g., status, viewed_at)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    try {
      const { supabaseAdmin } = await import('@/lib/supabase');
      if (!supabaseAdmin) {
        throw new Error('Supabase nicht verfügbar');
      }
      
      const updateData: any = {};
      if (body.status !== undefined) updateData.status = body.status;
      if (body.viewed_at !== undefined) updateData.viewed_at = body.viewed_at;
      if (body.admin_notes !== undefined) updateData.admin_notes = body.admin_notes;

      const { data, error } = await supabaseAdmin
        .from('vip_registrations')
        .update(updateData)
        .eq('id', params.id)
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        return NextResponse.json(
          { error: 'Fehler beim Aktualisieren der VIP-Anmeldung.' },
          { status: 500 }
        );
      }

      return NextResponse.json(data);
    } catch (supabaseError) {
      return NextResponse.json(
        { error: 'Supabase nicht verfügbar.' },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Error updating VIP registration:', error);
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der VIP-Anmeldung.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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
        .from('vip_registrations')
        .delete()
        .eq('id', params.id);

      if (error) {
        console.error('Database error:', error);
        return NextResponse.json(
          { error: 'Fehler beim Löschen der VIP-Anmeldung.' },
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
    console.error('Error deleting VIP registration:', error);
    return NextResponse.json(
      { error: 'Fehler beim Löschen der VIP-Anmeldung.' },
      { status: 500 }
    );
  }
}

