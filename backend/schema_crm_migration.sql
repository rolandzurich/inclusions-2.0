-- ============================================
-- CRM Migration: contacts erweitern + neue Tabellen
-- VIP-Registrierungen, Newsletter, Booking-Anfragen
-- ============================================

SET timezone = 'Europe/Zurich';
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Trigger-Funktion sicherstellen
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- contacts-Tabelle erweitern
-- ============================================
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS has_disability BOOLEAN DEFAULT FALSE;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS has_iv_card BOOLEAN DEFAULT FALSE;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS special_needs TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS categories TEXT[] DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_contacts_categories ON contacts USING GIN(categories);
CREATE INDEX IF NOT EXISTS idx_contacts_has_disability ON contacts(has_disability) WHERE has_disability = TRUE;

-- ============================================
-- VIP-Registrierungen
-- ============================================
CREATE TABLE IF NOT EXISTS vip_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    registration_type TEXT NOT NULL DEFAULT 'self' CHECK (registration_type IN ('self', 'caregiver')),
    caregiver_id UUID REFERENCES contacts(id) ON DELETE SET NULL,

    -- Event-Daten
    event_date DATE,
    event_location TEXT,

    -- Ankunft & Transport
    arrival_time TEXT CHECK (arrival_time IN ('13-17', '17-21', 'ganze-zeit')),
    tixi_taxi BOOLEAN DEFAULT FALSE,
    tixi_address TEXT,

    -- Betreuer am Event (1:1)
    needs_caregiver BOOLEAN DEFAULT FALSE,
    caregiver_name TEXT,
    caregiver_phone TEXT,

    -- Notfall-Kontakt
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,

    -- Status & Admin
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    admin_notes TEXT,
    viewed_at TIMESTAMPTZ,

    -- Rohdaten (Original-Formulardaten als Backup)
    raw_data JSONB
);

CREATE INDEX IF NOT EXISTS idx_vip_reg_contact_id ON vip_registrations(contact_id);
CREATE INDEX IF NOT EXISTS idx_vip_reg_caregiver_id ON vip_registrations(caregiver_id);
CREATE INDEX IF NOT EXISTS idx_vip_reg_status ON vip_registrations(status);
CREATE INDEX IF NOT EXISTS idx_vip_reg_event_date ON vip_registrations(event_date);
CREATE INDEX IF NOT EXISTS idx_vip_reg_created_at ON vip_registrations(created_at DESC);

DROP TRIGGER IF EXISTS update_vip_registrations_updated_at ON vip_registrations;
CREATE TRIGGER update_vip_registrations_updated_at
    BEFORE UPDATE ON vip_registrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Newsletter-Subscriptions
-- ============================================
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    interests TEXT[] DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'unsubscribed')),
    opt_in_confirmed_at TIMESTAMPTZ,

    UNIQUE(contact_id)
);

CREATE INDEX IF NOT EXISTS idx_newsletter_sub_contact_id ON newsletter_subscriptions(contact_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_sub_status ON newsletter_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_sub_created_at ON newsletter_subscriptions(created_at DESC);

DROP TRIGGER IF EXISTS update_newsletter_subscriptions_updated_at ON newsletter_subscriptions;
CREATE TRIGGER update_newsletter_subscriptions_updated_at
    BEFORE UPDATE ON newsletter_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Booking-Anfragen
-- ============================================
CREATE TABLE IF NOT EXISTS booking_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    booking_type TEXT,
    booking_item TEXT,
    event_date DATE,
    event_location TEXT,
    event_type TEXT,
    message TEXT,

    -- Status & Admin
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'completed', 'cancelled')),
    admin_notes TEXT,
    viewed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_booking_req_contact_id ON booking_requests(contact_id);
CREATE INDEX IF NOT EXISTS idx_booking_req_status ON booking_requests(status);
CREATE INDEX IF NOT EXISTS idx_booking_req_booking_type ON booking_requests(booking_type);
CREATE INDEX IF NOT EXISTS idx_booking_req_created_at ON booking_requests(created_at DESC);

DROP TRIGGER IF EXISTS update_booking_requests_updated_at ON booking_requests;
CREATE TRIGGER update_booking_requests_updated_at
    BEFORE UPDATE ON booking_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
