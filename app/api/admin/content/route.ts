import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // TODO: Auth-Check
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Dynamisch Supabase importieren, falls verfügbar
    try {
      const { supabaseAdmin } = await import('@/lib/supabase');
      
      const { data, error } = await supabaseAdmin
        .from('content_blocks')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Database error:', error);
        return NextResponse.json(
          { error: 'Fehler beim Laden der Content-Blocks.' },
          { status: 500 }
        );
      }

      return NextResponse.json(data || []);
    } catch (supabaseError) {
      // Fallback: Leere Liste zurückgeben wenn Supabase nicht verfügbar
      return NextResponse.json([]);
    }
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

    try {
      const { supabaseAdmin } = await import('@/lib/supabase');
      
      const { data, error } = await supabaseAdmin
        .from('content_blocks')
        .upsert({
          key,
          title,
          body_markdown: body_markdown || '',
          image_url: image_url || null,
          published: published !== undefined ? published : true,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'key',
        })
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        return NextResponse.json(
          { error: 'Fehler beim Speichern des Content-Blocks.' },
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
    console.error('Error saving content block:', error);
    return NextResponse.json(
      { error: 'Fehler beim Speichern des Content-Blocks.' },
      { status: 500 }
    );
  }
}

