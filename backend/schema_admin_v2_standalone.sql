-- ============================================
-- INCLUSIONS V2 – CRM, Projektmanagement, Kalender, Buchhaltung
-- Standalone-Schema für direkten PostgreSQL-Einsatz (Schweizer Server)
-- Schweizer Standards: CHF, ISO-Datum (YYYY-MM-DD), Europe/Zurich
-- ============================================
-- Verwendung: psql -U inclusions_user -d inclusions_db -f schema_admin_v2_standalone.sql

SET timezone = 'Europe/Zurich';

-- UUID Extension (falls nicht vorhanden)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Trigger-Funktion für updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- CRM: Unternehmen
-- ============================================
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    name TEXT NOT NULL,
    legal_name TEXT,
    uid TEXT,                    -- CHE-XXX.XXX.XXX
    vat_number TEXT,
    email TEXT,
    phone TEXT,
    website TEXT,
    address_line1 TEXT,
    address_line2 TEXT,
    postal_code TEXT,
    city TEXT,
    country TEXT DEFAULT 'CH',
    notes TEXT,
    tags TEXT[]
);

CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);
CREATE INDEX IF NOT EXISTS idx_companies_uid ON companies(uid);
CREATE INDEX IF NOT EXISTS idx_companies_created_at ON companies(created_at DESC);

-- ============================================
-- CRM: Kontakte
-- ============================================
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    role TEXT,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    address_line1 TEXT,
    address_line2 TEXT,
    postal_code TEXT,
    city TEXT,
    country TEXT DEFAULT 'CH',
    notes TEXT,
    tags TEXT[],
    source TEXT DEFAULT 'manual'
);

CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_company_id ON contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_tags ON contacts USING GIN(tags);

-- ============================================
-- CRM: Deals
-- ============================================
CREATE TABLE IF NOT EXISTS deals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    amount_chf DECIMAL(12, 2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'lead' CHECK (status IN (
        'lead', 'qualified', 'proposal', 'negotiation', 'won', 'lost'
    )),
    stage_order INTEGER DEFAULT 0,
    expected_close_date DATE,
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_deals_contact_id ON deals(contact_id);
CREATE INDEX IF NOT EXISTS idx_deals_company_id ON deals(company_id);
CREATE INDEX IF NOT EXISTS idx_deals_status ON deals(status);
CREATE INDEX IF NOT EXISTS idx_deals_expected_close_date ON deals(expected_close_date);

-- ============================================
-- Projektmanagement: Projekte
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    name TEXT NOT NULL,
    description TEXT,
    slug TEXT UNIQUE,
    status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN (
        'planning', 'active', 'on_hold', 'completed', 'cancelled'
    )),
    start_date DATE,
    end_date DATE,
    owner_id UUID,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    notes TEXT,
    tags TEXT[]
);

CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_start_date ON projects(start_date);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);

-- ============================================
-- Projektmanagement: Aufgaben
-- ============================================
CREATE TABLE IF NOT EXISTS project_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN (
        'todo', 'in_progress', 'review', 'done', 'cancelled'
    )),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    due_date DATE,
    assigned_to_id UUID,
    order_index INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_project_tasks_project_id ON project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_status ON project_tasks(status);
CREATE INDEX IF NOT EXISTS idx_project_tasks_due_date ON project_tasks(due_date);

-- ============================================
-- Kalender: Events
-- ============================================
CREATE TABLE IF NOT EXISTS events_v2 (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    description TEXT,
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ,
    location_name TEXT,
    location_address TEXT,
    location_city TEXT,
    location_postal_code TEXT,
    max_attendees INTEGER,
    rsvp_enabled BOOLEAN DEFAULT true,
    rsvp_deadline TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
        'draft', 'published', 'cancelled', 'past'
    )),
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    image_url TEXT,
    external_url TEXT,
    tags TEXT[]
);

CREATE INDEX IF NOT EXISTS idx_events_v2_start_at ON events_v2(start_at);
CREATE INDEX IF NOT EXISTS idx_events_v2_status ON events_v2(status);
CREATE INDEX IF NOT EXISTS idx_events_v2_slug ON events_v2(slug);

-- ============================================
-- Kalender: RSVPs
-- ============================================
CREATE TABLE IF NOT EXISTS event_rsvps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    event_id UUID NOT NULL REFERENCES events_v2(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    guest_name TEXT,
    guest_email TEXT NOT NULL,
    guest_phone TEXT,
    number_of_guests INTEGER DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'confirmed', 'cancelled', 'no_show'
    )),
    source TEXT DEFAULT 'web',
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_event_rsvps_event_id ON event_rsvps(event_id);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_contact_id ON event_rsvps(contact_id);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_status ON event_rsvps(status);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_guest_email ON event_rsvps(guest_email);

-- ============================================
-- Buchhaltung: Journal (CHF)
-- ============================================
CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    entry_date DATE NOT NULL,
    amount_chf DECIMAL(12, 2) NOT NULL,
    entry_type TEXT NOT NULL CHECK (entry_type IN ('income', 'expense', 'transfer')),
    category TEXT NOT NULL,
    subcategory TEXT,
    description TEXT NOT NULL,
    reference TEXT,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    event_id UUID REFERENCES events_v2(id) ON DELETE SET NULL,
    vat_rate DECIMAL(5, 2) DEFAULT 0,
    vat_amount_chf DECIMAL(12, 2) DEFAULT 0,
    created_by_id UUID,
    is_reconciled BOOLEAN DEFAULT false,
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_journal_entries_entry_date ON journal_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_journal_entries_entry_type ON journal_entries(entry_type);
CREATE INDEX IF NOT EXISTS idx_journal_entries_category ON journal_entries(category);

-- ============================================
-- Trigger: updated_at
-- ============================================
DROP TRIGGER IF EXISTS update_contacts_updated_at ON contacts;
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_deals_updated_at ON deals;
CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON deals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_project_tasks_updated_at ON project_tasks;
CREATE TRIGGER update_project_tasks_updated_at BEFORE UPDATE ON project_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_events_v2_updated_at ON events_v2;
CREATE TRIGGER update_events_v2_updated_at BEFORE UPDATE ON events_v2
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_event_rsvps_updated_at ON event_rsvps;
CREATE TRIGGER update_event_rsvps_updated_at BEFORE UPDATE ON event_rsvps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_journal_entries_updated_at ON journal_entries;
CREATE TRIGGER update_journal_entries_updated_at BEFORE UPDATE ON journal_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
