export const dynamic = 'force-dynamic';

/**
 * CMS Schema Init API
 * POST: Erstellt die CMS-Tabellen in PostgreSQL
 * GET: Prüft ob CMS-Tabellen existieren
 */

import { NextResponse } from 'next/server';
import { query } from '@/lib/db-postgres';

const SCHEMA_STEPS = [
  {
    label: 'UUID Extension',
    sql: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`,
  },
  {
    label: 'cms_pages Tabelle',
    sql: `CREATE TABLE IF NOT EXISTS cms_pages (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      description TEXT,
      og_image TEXT,
      status TEXT NOT NULL DEFAULT 'draft',
      sort_order INT NOT NULL DEFAULT 0,
      is_homepage BOOLEAN DEFAULT FALSE,
      metadata JSONB DEFAULT '{}'
    )`,
  },
  {
    label: 'cms_sections Tabelle',
    sql: `CREATE TABLE IF NOT EXISTS cms_sections (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      page_id UUID NOT NULL REFERENCES cms_pages(id) ON DELETE CASCADE,
      section_type TEXT NOT NULL,
      title TEXT,
      content JSONB NOT NULL DEFAULT '{}',
      sort_order INT NOT NULL DEFAULT 0,
      is_visible BOOLEAN NOT NULL DEFAULT TRUE,
      css_classes TEXT
    )`,
  },
  {
    label: 'Index: cms_pages slug',
    sql: `CREATE INDEX IF NOT EXISTS idx_cms_pages_slug ON cms_pages(slug)`,
  },
  {
    label: 'Index: cms_pages status',
    sql: `CREATE INDEX IF NOT EXISTS idx_cms_pages_status ON cms_pages(status)`,
  },
  {
    label: 'Index: cms_sections page_id',
    sql: `CREATE INDEX IF NOT EXISTS idx_cms_sections_page_id ON cms_sections(page_id)`,
  },
  {
    label: 'Index: cms_sections sort_order',
    sql: `CREATE INDEX IF NOT EXISTS idx_cms_sections_sort_order ON cms_sections(page_id, sort_order)`,
  },
];

export async function GET() {
  try {
    const { data: pagesCheck } = await query(
      `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'cms_pages') as exists`
    );
    const { data: sectionsCheck } = await query(
      `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'cms_sections') as exists`
    );

    const pagesExist = pagesCheck?.[0]?.exists || false;
    const sectionsExist = sectionsCheck?.[0]?.exists || false;

    let pageCount = 0;
    let sectionCount = 0;
    if (pagesExist) {
      const { data: pc } = await query('SELECT COUNT(*) as count FROM cms_pages');
      pageCount = parseInt(pc?.[0]?.count || '0');
    }
    if (sectionsExist) {
      const { data: sc } = await query('SELECT COUNT(*) as count FROM cms_sections');
      sectionCount = parseInt(sc?.[0]?.count || '0');
    }

    return NextResponse.json({
      ready: pagesExist && sectionsExist,
      tables: { cms_pages: pagesExist, cms_sections: sectionsExist },
      counts: { pages: pageCount, sections: sectionCount },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST() {
  const results: { label: string; success: boolean; error?: string }[] = [];

  for (const step of SCHEMA_STEPS) {
    const { error } = await query(step.sql);
    if (error && !error.includes('already exists')) {
      results.push({ label: step.label, success: false, error });
    } else {
      results.push({ label: step.label, success: true });
    }
  }

  const allSuccess = results.every((r) => r.success);

  return NextResponse.json({
    success: allSuccess,
    results,
  });
}
