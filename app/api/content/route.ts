import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET: Öffentlicher Zugriff auf published Content Blocks
export async function GET(request: NextRequest) {
  try {
    const { supabase } = await import('@/lib/supabase');
    if (!supabase) {
      return NextResponse.json(
        { error: 'Service nicht verfügbar.' },
        { status: 503 }
      );
    }

    const url = new URL(request.url);
    const key = url.searchParams.get('key');

    if (key) {
      // Einzelner Block
      const { data, error } = await supabase
        .from('content_blocks')
        .select('*')
        .eq('key', key)
        .eq('published', true)
        .single();

      if (error || !data) {
        return NextResponse.json(
          { error: 'Content Block nicht gefunden.' },
          { status: 404 }
        );
      }

      return NextResponse.json(data);
    } else {
      // Alle published Blocks
      const { data, error } = await supabase
        .from('content_blocks')
        .select('*')
        .eq('published', true)
        .order('order_index', { ascending: true });

      if (error) {
        return NextResponse.json(
          { error: 'Fehler beim Laden der Content Blocks.' },
          { status: 500 }
        );
      }

      return NextResponse.json({ blocks: data });
    }
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

    const { supabaseAdmin } = await import('@/lib/supabase');
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase nicht verfügbar.' },
        { status: 503 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('content_blocks')
      .upsert({
        key: body.key,
        title: body.title || null,
        body_markdown: body.body_markdown || null,
        body_html: body.body_html || null,
        image_url: body.image_url || null,
        published: body.published !== undefined ? body.published : true,
        order_index: body.order_index || 0,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Fehler beim Speichern des Content Blocks.' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error saving content:', error);
    return NextResponse.json(
      { error: 'Fehler beim Speichern der Inhalte.' },
      { status: 500 }
    );
  }
}

