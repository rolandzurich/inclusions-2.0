export const dynamic = 'force-dynamic';

/**
 * CMS Single Section API
 * GET: Section abrufen
 * PUT: Section aktualisieren
 * DELETE: Section löschen
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db-postgres';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await query(
      'SELECT * FROM cms_sections WHERE id = $1',
      [params.id]
    );

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Section nicht gefunden' }, { status: 404 });
    }

    return NextResponse.json({ section: data[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { section_type, title, content, sort_order, is_visible, css_classes } = body;

    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (section_type !== undefined) { fields.push(`section_type = $${paramIndex++}`); values.push(section_type); }
    if (title !== undefined) { fields.push(`title = $${paramIndex++}`); values.push(title); }
    if (content !== undefined) { fields.push(`content = $${paramIndex++}`); values.push(JSON.stringify(content)); }
    if (sort_order !== undefined) { fields.push(`sort_order = $${paramIndex++}`); values.push(sort_order); }
    if (is_visible !== undefined) { fields.push(`is_visible = $${paramIndex++}`); values.push(is_visible); }
    if (css_classes !== undefined) { fields.push(`css_classes = $${paramIndex++}`); values.push(css_classes); }

    if (fields.length === 0) {
      return NextResponse.json({ error: 'Keine Felder zum Aktualisieren' }, { status: 400 });
    }

    values.push(params.id);
    const { data, error } = await query(
      `UPDATE cms_sections SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Section nicht gefunden' }, { status: 404 });
    }

    return NextResponse.json({ section: data[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await query(
      'DELETE FROM cms_sections WHERE id = $1 RETURNING id, section_type, title',
      [params.id]
    );

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Section nicht gefunden' }, { status: 404 });
    }

    return NextResponse.json({ deleted: data[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
