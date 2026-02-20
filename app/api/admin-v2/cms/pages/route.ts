export const dynamic = 'force-dynamic';

/**
 * CMS Pages API
 * GET: Alle Seiten abrufen
 * POST: Neue Seite erstellen
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db-postgres';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let sql = `
      SELECT p.*, 
        (SELECT COUNT(*) FROM cms_sections s WHERE s.page_id = p.id) as section_count
      FROM cms_pages p
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status) {
      params.push(status);
      sql += ` AND p.status = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (p.title ILIKE $${params.length} OR p.slug ILIKE $${params.length})`;
    }

    sql += ` ORDER BY p.sort_order ASC, p.title ASC`;

    const { data, error } = await query(sql, params);

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ pages: data || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, slug, description, og_image, status, sort_order, is_homepage, metadata } = body;

    if (!title || !slug) {
      return NextResponse.json(
        { error: 'Titel und Slug sind erforderlich' },
        { status: 400 }
      );
    }

    // Slug-Format prüfen
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(slug)) {
      return NextResponse.json(
        { error: 'Slug darf nur Kleinbuchstaben, Zahlen und Bindestriche enthalten' },
        { status: 400 }
      );
    }

    // Slug-Duplikat prüfen
    const { data: existing } = await query(
      'SELECT id FROM cms_pages WHERE slug = $1',
      [slug]
    );
    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: `Slug "${slug}" ist bereits vergeben` },
        { status: 409 }
      );
    }

    // Wenn is_homepage, andere Homepage entfernen
    if (is_homepage) {
      await query('UPDATE cms_pages SET is_homepage = FALSE WHERE is_homepage = TRUE');
    }

    const { data, error } = await query(
      `INSERT INTO cms_pages (title, slug, description, og_image, status, sort_order, is_homepage, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        title,
        slug,
        description || null,
        og_image || null,
        status || 'draft',
        sort_order || 0,
        is_homepage || false,
        JSON.stringify(metadata || {}),
      ]
    );

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ page: data?.[0] }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
