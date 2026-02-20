export const dynamic = 'force-dynamic';

/**
 * CMS Sections Reorder API
 * PUT: Section-Reihenfolge aktualisieren
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db-postgres';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { section_ids } = body;

    if (!Array.isArray(section_ids) || section_ids.length === 0) {
      return NextResponse.json(
        { error: 'section_ids Array ist erforderlich' },
        { status: 400 }
      );
    }

    // Jede Section bekommt ihre neue Reihenfolge
    const results = [];
    for (let i = 0; i < section_ids.length; i++) {
      const { error } = await query(
        'UPDATE cms_sections SET sort_order = $1 WHERE id = $2',
        [i, section_ids[i]]
      );
      if (error) {
        results.push({ id: section_ids[i], success: false, error });
      } else {
        results.push({ id: section_ids[i], success: true, sort_order: i });
      }
    }

    return NextResponse.json({
      success: results.every((r) => r.success),
      results,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
