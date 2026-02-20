-- =============================================================
-- CMS Schema für Inclusions
-- Seiten und Sections, editierbar über Admin-V2
-- =============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Seiten
CREATE TABLE IF NOT EXISTS cms_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    slug TEXT NOT NULL UNIQUE,          -- z.B. 'home', 'events', 'faq'
    title TEXT NOT NULL,                -- Seitentitel
    description TEXT,                   -- Meta-Description (SEO)
    og_image TEXT,                      -- Open Graph Bild
    status TEXT NOT NULL DEFAULT 'draft', -- draft | published
    sort_order INT NOT NULL DEFAULT 0,
    is_homepage BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'         -- Zusätzliche Metadaten
);

-- Sections pro Seite
CREATE TABLE IF NOT EXISTS cms_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    page_id UUID NOT NULL REFERENCES cms_pages(id) ON DELETE CASCADE,
    section_type TEXT NOT NULL,         -- hero, text, text_image, cards, faq, gallery, partners, cta, quotes, custom_html
    title TEXT,                         -- Optionaler Section-Titel
    content JSONB NOT NULL DEFAULT '{}', -- Typ-spezifischer Inhalt
    sort_order INT NOT NULL DEFAULT 0,
    is_visible BOOLEAN NOT NULL DEFAULT TRUE,
    css_classes TEXT                    -- Optionale CSS-Klassen
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cms_pages_slug ON cms_pages(slug);
CREATE INDEX IF NOT EXISTS idx_cms_pages_status ON cms_pages(status);
CREATE INDEX IF NOT EXISTS idx_cms_sections_page_id ON cms_sections(page_id);
CREATE INDEX IF NOT EXISTS idx_cms_sections_sort_order ON cms_sections(page_id, sort_order);

-- Updated-At Trigger für cms_pages
CREATE OR REPLACE FUNCTION update_cms_pages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_cms_pages_updated_at ON cms_pages;
CREATE TRIGGER trigger_cms_pages_updated_at
    BEFORE UPDATE ON cms_pages
    FOR EACH ROW
    EXECUTE FUNCTION update_cms_pages_updated_at();

-- Updated-At Trigger für cms_sections
CREATE OR REPLACE FUNCTION update_cms_sections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_cms_sections_updated_at ON cms_sections;
CREATE TRIGGER trigger_cms_sections_updated_at
    BEFORE UPDATE ON cms_sections
    FOR EACH ROW
    EXECUTE FUNCTION update_cms_sections_updated_at();
