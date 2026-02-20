/**
 * CMS Page Renderer
 * Rendert eine CMS-Seite basierend auf ihrem Slug
 * Lädt Sections aus der DB und zeigt sie mit den Section-Komponenten an
 */

import { query } from '@/lib/db-postgres';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { CMSPageClient } from './client';

interface Props {
  params: { slug: string };
}

// Dynamische Metadata basierend auf CMS-Seite
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params;

  const { data: pages } = await query(
    'SELECT title, description, og_image FROM cms_pages WHERE slug = $1 AND status = $2',
    [slug, 'published']
  );

  if (!pages || pages.length === 0) {
    return { title: 'Seite nicht gefunden' };
  }

  const page = pages[0];

  return {
    title: `${page.title} - INCLUSIONS`,
    description: page.description || undefined,
    openGraph: {
      title: page.title,
      description: page.description || undefined,
      images: page.og_image ? [{ url: page.og_image }] : undefined,
    },
  };
}

export default async function CMSPage({ params }: Props) {
  const { slug } = params;

  // Seite laden
  const { data: pages, error: pageError } = await query(
    'SELECT * FROM cms_pages WHERE slug = $1 AND status = $2',
    [slug, 'published']
  );

  if (pageError || !pages || pages.length === 0) {
    notFound();
  }

  const page = pages[0];

  // Sections laden
  const { data: sections } = await query(
    'SELECT * FROM cms_sections WHERE page_id = $1 AND is_visible = true ORDER BY sort_order ASC',
    [page.id]
  );

  return <CMSPageClient sections={sections || []} />;
}
