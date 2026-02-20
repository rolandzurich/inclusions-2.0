export const dynamic = 'force-dynamic';

/**
 * CMS Sections API
 * GET: Sections einer Seite abrufen
 * POST: Neue Section erstellen
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db-postgres';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get('page_id');

    if (!pageId) {
      return NextResponse.json(
        { error: 'page_id ist erforderlich' },
        { status: 400 }
      );
    }

    const { data, error } = await query(
      'SELECT * FROM cms_sections WHERE page_id = $1 ORDER BY sort_order ASC',
      [pageId]
    );

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ sections: data || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { page_id, section_type, title, content, sort_order, is_visible, css_classes } = body;

    if (!page_id || !section_type) {
      return NextResponse.json(
        { error: 'page_id und section_type sind erforderlich' },
        { status: 400 }
      );
    }

    // Gültige Section-Typen
    const validTypes = [
      'hero', 'text', 'text_image', 'cards', 'faq', 'gallery',
      'partners', 'cta', 'quotes', 'lineup', 'custom_html',
    ];

    if (!validTypes.includes(section_type)) {
      return NextResponse.json(
        { error: `Ungültiger Section-Typ. Erlaubt: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Auto sort_order: höchste + 1
    let order = sort_order;
    if (order === undefined || order === null) {
      const { data: maxOrder } = await query(
        'SELECT COALESCE(MAX(sort_order), -1) + 1 as next_order FROM cms_sections WHERE page_id = $1',
        [page_id]
      );
      order = maxOrder?.[0]?.next_order || 0;
    }

    const { data, error } = await query(
      `INSERT INTO cms_sections (page_id, section_type, title, content, sort_order, is_visible, css_classes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        page_id,
        section_type,
        title || null,
        JSON.stringify(content || {}),
        order,
        is_visible !== false,
        css_classes || null,
      ]
    );

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ section: data?.[0] }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
