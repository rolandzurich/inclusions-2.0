export const dynamic = 'force-dynamic';

/**
 * CMS Single Page API
 * GET: Seite mit Sections abrufen
 * PUT: Seite aktualisieren
 * DELETE: Seite löschen
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db-postgres';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Seite laden (per ID oder Slug)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const { data: pageData, error: pageError } = await query(
      isUUID
        ? 'SELECT * FROM cms_pages WHERE id = $1'
        : 'SELECT * FROM cms_pages WHERE slug = $1',
      [id]
    );

    if (pageError) {
      return NextResponse.json({ error: pageError }, { status: 500 });
    }

    if (!pageData || pageData.length === 0) {
      return NextResponse.json({ error: 'Seite nicht gefunden' }, { status: 404 });
    }

    const page = pageData[0];

    // Sections laden
    const { data: sections, error: sectionsError } = await query(
      'SELECT * FROM cms_sections WHERE page_id = $1 ORDER BY sort_order ASC',
      [page.id]
    );

    if (sectionsError) {
      return NextResponse.json({ error: sectionsError }, { status: 500 });
    }

    return NextResponse.json({
      page: { ...page, sections: sections || [] },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { title, slug, description, og_image, status, sort_order, is_homepage, metadata } = body;

    // Wenn is_homepage, andere Homepage entfernen
    if (is_homepage) {
      await query('UPDATE cms_pages SET is_homepage = FALSE WHERE is_homepage = TRUE AND id != $1', [id]);
    }

    // Slug-Duplikat prüfen (wenn geändert)
    if (slug) {
      const { data: existing } = await query(
        'SELECT id FROM cms_pages WHERE slug = $1 AND id != $2',
        [slug, id]
      );
      if (existing && existing.length > 0) {
        return NextResponse.json(
          { error: `Slug "${slug}" ist bereits vergeben` },
          { status: 409 }
        );
      }
    }

    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (title !== undefined) { fields.push(`title = $${paramIndex++}`); values.push(title); }
    if (slug !== undefined) { fields.push(`slug = $${paramIndex++}`); values.push(slug); }
    if (description !== undefined) { fields.push(`description = $${paramIndex++}`); values.push(description); }
    if (og_image !== undefined) { fields.push(`og_image = $${paramIndex++}`); values.push(og_image); }
    if (status !== undefined) { fields.push(`status = $${paramIndex++}`); values.push(status); }
    if (sort_order !== undefined) { fields.push(`sort_order = $${paramIndex++}`); values.push(sort_order); }
    if (is_homepage !== undefined) { fields.push(`is_homepage = $${paramIndex++}`); values.push(is_homepage); }
    if (metadata !== undefined) { fields.push(`metadata = $${paramIndex++}`); values.push(JSON.stringify(metadata)); }

    if (fields.length === 0) {
      return NextResponse.json({ error: 'Keine Felder zum Aktualisieren' }, { status: 400 });
    }

    values.push(id);
    const { data, error } = await query(
      `UPDATE cms_pages SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Seite nicht gefunden' }, { status: 404 });
    }

    return NextResponse.json({ page: data[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const { data, error } = await query(
      'DELETE FROM cms_pages WHERE id = $1 RETURNING id, title',
      [id]
    );

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Seite nicht gefunden' }, { status: 404 });
    }

    return NextResponse.json({ deleted: data[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
