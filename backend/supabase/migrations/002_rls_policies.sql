-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS auf allen Tabellen
ALTER TABLE contact_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vip_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Contact Requests
-- ============================================

-- Öffentlich: INSERT erlaubt (für Formulare)
CREATE POLICY "Public can insert contact requests"
    ON contact_requests
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Öffentlich: KEIN SELECT (Sicherheit)
CREATE POLICY "No public select on contact requests"
    ON contact_requests
    FOR SELECT
    TO anon
    USING (false);

-- Admin: Vollzugriff (via Service Role Key)
-- Service Role hat automatisch Bypass, daher keine Policy nötig

-- ============================================
-- Newsletter Subscribers
-- ============================================

-- Öffentlich: INSERT erlaubt
CREATE POLICY "Public can insert newsletter subscribers"
    ON newsletter_subscribers
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Öffentlich: SELECT nur für Opt-In Token Check
CREATE POLICY "Public can select by opt-in token"
    ON newsletter_subscribers
    FOR SELECT
    TO anon
    USING (
        opt_in_token IS NOT NULL 
        AND opt_in_confirmed_at IS NULL
        AND opt_in_expires_at > NOW()
    );

-- Öffentlich: UPDATE nur für Opt-In Bestätigung
CREATE POLICY "Public can update opt-in confirmation"
    ON newsletter_subscribers
    FOR UPDATE
    TO anon
    USING (
        opt_in_token IS NOT NULL 
        AND opt_in_confirmed_at IS NULL
        AND opt_in_expires_at > NOW()
    )
    WITH CHECK (
        opt_in_confirmed_at IS NOT NULL
        AND status = 'confirmed'
    );

-- Öffentlich: KEIN SELECT auf alle Daten
CREATE POLICY "No public select on newsletter subscribers"
    ON newsletter_subscribers
    FOR SELECT
    TO anon
    USING (false);

-- ============================================
-- VIP Registrations
-- ============================================

-- Öffentlich: INSERT erlaubt
CREATE POLICY "Public can insert vip registrations"
    ON vip_registrations
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Öffentlich: KEIN SELECT
CREATE POLICY "No public select on vip registrations"
    ON vip_registrations
    FOR SELECT
    TO anon
    USING (false);

-- ============================================
-- Content Blocks (Mini-CMS)
-- ============================================

-- Öffentlich: SELECT nur für published Blocks
CREATE POLICY "Public can select published content blocks"
    ON content_blocks
    FOR SELECT
    TO anon, authenticated
    USING (published = true);

-- ============================================
-- Admin Notes
-- ============================================

-- Öffentlich: KEIN Zugriff
CREATE POLICY "No public access to admin notes"
    ON admin_notes
    FOR ALL
    TO anon
    USING (false);

-- ============================================
-- Rate Limits
-- ============================================

-- Öffentlich: INSERT und SELECT für eigene IP
CREATE POLICY "Public can manage own rate limits"
    ON rate_limits
    FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- ============================================
-- Helper Functions für Admin-Zugriff
-- ============================================

-- Funktion um zu prüfen ob User Admin ist
-- (Wird später mit Supabase Auth erweitert)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    -- Für jetzt: Service Role Key wird verwendet
    -- Später: Auth User Check
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

