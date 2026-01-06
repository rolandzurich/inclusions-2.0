-- ============================================
-- Seed Data für Initial Setup
-- ============================================

-- Beispiel Content Blocks
INSERT INTO content_blocks (key, title, body_markdown, published) VALUES
    ('hero-title', 'Hero Titel', '# Willkommen bei Inclusions', true),
    ('hero-subtitle', 'Hero Untertitel', 'Eine Community für alle', true),
    ('about-text', 'Über Uns Text', 'Inclusions ist eine inklusive Community...', true)
ON CONFLICT (key) DO NOTHING;

-- Hinweis: Admin User wird über Supabase Auth erstellt
-- Siehe Dokumentation für Setup-Anleitung

