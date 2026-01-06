-- ============================================
-- Initial Database Schema für Inclusions 2.0
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create required roles for Supabase
DO $$
DECLARE
  db_password TEXT;
BEGIN
  -- Get password from environment (will be set by Docker)
  db_password := current_setting('POSTGRES_PASSWORD', true);
  IF db_password IS NULL OR db_password = '' THEN
    db_password := 'your-super-secret-password-change-this';
  END IF;

  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NOLOGIN NOINHERIT;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOLOGIN NOINHERIT;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'service_role') THEN
    CREATE ROLE service_role NOLOGIN NOINHERIT BYPASSRLS;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'authenticator') THEN
    CREATE ROLE authenticator NOINHERIT;
    GRANT anon TO authenticator;
    GRANT authenticated TO authenticator;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'supabase_auth_admin') THEN
    CREATE ROLE supabase_auth_admin WITH LOGIN PASSWORD db_password;
    GRANT ALL PRIVILEGES ON DATABASE postgres TO supabase_auth_admin;
  END IF;
END
$$;

-- ============================================
-- Contact Requests (Booking, Dance Crew, etc.)
-- ============================================
CREATE TABLE contact_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Contact Information
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT,
    
    -- Booking Details (optional, für Booking-Formular)
    booking_type TEXT, -- 'dj', 'pair', 'dance-crew'
    booking_item TEXT, -- Name des gebuchten Items
    event_date DATE,
    event_location TEXT,
    event_type TEXT,
    
    -- Tracking
    source_url TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    
    -- Spam Protection
    honeypot TEXT, -- Sollte leer sein
    ip_address INET,
    
    -- Admin Notes (optional)
    admin_notes TEXT,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'completed', 'archived'))
);

-- Indexes für bessere Performance
CREATE INDEX idx_contact_requests_created_at ON contact_requests(created_at DESC);
CREATE INDEX idx_contact_requests_email ON contact_requests(email);
CREATE INDEX idx_contact_requests_status ON contact_requests(status);

-- ============================================
-- Newsletter Subscribers
-- ============================================
CREATE TABLE newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Contact Information
    email TEXT NOT NULL UNIQUE,
    first_name TEXT,
    last_name TEXT,
    
    -- Preferences
    has_disability BOOLEAN,
    interests TEXT[], -- Array von Interessen
    
    -- Double Opt-In
    opt_in_token UUID DEFAULT uuid_generate_v4(),
    opt_in_confirmed_at TIMESTAMPTZ,
    opt_in_expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
    
    -- Tracking
    source_url TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'unsubscribed')),
    unsubscribed_at TIMESTAMPTZ,
    
    -- Spam Protection
    honeypot TEXT,
    ip_address INET,
    
    -- Admin Notes
    admin_notes TEXT
);

-- Indexes
CREATE INDEX idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX idx_newsletter_subscribers_status ON newsletter_subscribers(status);
CREATE INDEX idx_newsletter_subscribers_opt_in_token ON newsletter_subscribers(opt_in_token);
CREATE INDEX idx_newsletter_subscribers_created_at ON newsletter_subscribers(created_at DESC);

-- ============================================
-- VIP / Event Registrations
-- ============================================
CREATE TABLE vip_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Contact Information
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    
    -- Event Details
    event_date DATE,
    event_location TEXT,
    event_type TEXT,
    message TEXT,
    
    -- Additional Fields (für VIP-Anmeldung)
    company TEXT,
    number_of_guests INTEGER,
    special_requirements TEXT,
    
    -- Tracking
    source_url TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    
    -- Spam Protection
    honeypot TEXT,
    ip_address INET,
    
    -- Admin Notes
    admin_notes TEXT,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'confirmed', 'cancelled', 'archived'))
);

-- Indexes
CREATE INDEX idx_vip_registrations_created_at ON vip_registrations(created_at DESC);
CREATE INDEX idx_vip_registrations_email ON vip_registrations(email);
CREATE INDEX idx_vip_registrations_status ON vip_registrations(status);

-- ============================================
-- Content Blocks (Mini-CMS)
-- ============================================
CREATE TABLE content_blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Content
    key TEXT NOT NULL UNIQUE, -- z.B. 'hero-title', 'about-text'
    title TEXT,
    body_markdown TEXT,
    body_html TEXT, -- Generiert aus Markdown
    image_url TEXT,
    
    -- Metadata
    published BOOLEAN DEFAULT true,
    order_index INTEGER DEFAULT 0
);

-- Indexes
CREATE INDEX idx_content_blocks_key ON content_blocks(key);
CREATE INDEX idx_content_blocks_published ON content_blocks(published);

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_content_blocks_updated_at 
    BEFORE UPDATE ON content_blocks 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Admin Notes (optional, für interne Notizen)
-- ============================================
CREATE TABLE admin_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Reference
    table_name TEXT NOT NULL, -- 'contact_requests', 'newsletter_subscribers', etc.
    record_id UUID NOT NULL,
    
    -- Note
    note TEXT NOT NULL,
    created_by UUID, -- Admin User ID (wenn Auth implementiert)
    
    -- Metadata
    is_archived BOOLEAN DEFAULT false
);

-- Indexes
CREATE INDEX idx_admin_notes_table_record ON admin_notes(table_name, record_id);
CREATE INDEX idx_admin_notes_created_at ON admin_notes(created_at DESC);

-- ============================================
-- Rate Limiting (für Spam-Schutz)
-- ============================================
CREATE TABLE rate_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ip_address INET NOT NULL,
    endpoint TEXT NOT NULL,
    request_count INTEGER DEFAULT 1,
    window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(ip_address, endpoint, window_start)
);

-- Index für Cleanup
CREATE INDEX idx_rate_limits_window_start ON rate_limits(window_start);

-- Cleanup-Funktion für alte Rate Limit Einträge
CREATE OR REPLACE FUNCTION cleanup_rate_limits()
RETURNS void AS $$
BEGIN
    DELETE FROM rate_limits 
    WHERE window_start < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

