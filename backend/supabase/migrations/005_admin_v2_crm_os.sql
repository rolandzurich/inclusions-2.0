-- ============================================
-- INCLUSIONS V2 – CRM, Projektmanagement, Kalender, Buchhaltung
-- Schweizer Standards: CHF, ISO-Datum, Europe/Zurich
-- ============================================

-- Zeitzone für Session setzen
SET timezone = 'Europe/Zurich';

-- ============================================
-- CRM: Unternehmen (zuerst, da contacts darauf referenziert)
-- ============================================
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Firma
    name TEXT NOT NULL,
    legal_name TEXT,             -- Offizieller Name (z.B. für Rechnungen)

    -- Schweizer Identifikation
    uid TEXT,                    -- CHE-XXX.XXX.XXX
    vat_number TEXT,             -- MWST-Nummer

    -- Kontakt
    email TEXT,
    phone TEXT,
    website TEXT,

    -- Adresse
    address_line1 TEXT,
    address_line2 TEXT,
    postal_code TEXT,
    city TEXT,
    country TEXT DEFAULT 'CH',

    -- Notizen
    notes TEXT,
    tags TEXT[]
);

CREATE INDEX idx_companies_name ON companies(name);
CREATE INDEX idx_companies_uid ON companies(uid);
CREATE INDEX idx_companies_created_at ON companies(created_at DESC);

-- ============================================
-- CRM: Kontakte
-- ============================================
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Person
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    role TEXT,                    -- z.B. DJ, Partner, Sponsor

    -- Verknüpfung
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,

    -- Adresse (optional)
    address_line1 TEXT,
    address_line2 TEXT,
    postal_code TEXT,
    city TEXT,
    country TEXT DEFAULT 'CH',

    -- Notizen
    notes TEXT,
    tags TEXT[],                 -- z.B. {'vip', 'dj', 'partner'}

    -- Quelle (Migration aus bestehenden Daten)
    source TEXT DEFAULT 'manual'  -- 'manual', 'form', 'import'
);

CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_company_id ON contacts(company_id);
CREATE INDEX idx_contacts_created_at ON contacts(created_at DESC);
CREATE INDEX idx_contacts_tags ON contacts USING GIN(tags);

-- ============================================
-- CRM: Deals / Pipeline
-- ============================================
CREATE TABLE IF NOT EXISTS deals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Verknüpfung
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,

    -- Deal
    title TEXT NOT NULL,
    description TEXT,

    -- Betrag in CHF (Schweizer Standard)
    amount_chf DECIMAL(12, 2) NOT NULL DEFAULT 0,

    -- Pipeline
    status TEXT NOT NULL DEFAULT 'lead' CHECK (status IN (
        'lead', 'qualified', 'proposal', 'negotiation', 'won', 'lost'
    )),
    stage_order INTEGER DEFAULT 0,

    -- Fälligkeit (ISO-Datum: YYYY-MM-DD)
    expected_close_date DATE,

    -- Notizen
    notes TEXT
);

CREATE INDEX idx_deals_contact_id ON deals(contact_id);
CREATE INDEX idx_deals_company_id ON deals(company_id);
CREATE INDEX idx_deals_status ON deals(status);
CREATE INDEX idx_deals_expected_close_date ON deals(expected_close_date);

-- ============================================
-- Projektmanagement: Projekte
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Projekt
    name TEXT NOT NULL,
    description TEXT,
    slug TEXT UNIQUE,

    -- Status
    status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN (
        'planning', 'active', 'on_hold', 'completed', 'cancelled'
    )),

    -- Zeitraum (ISO-Datum)
    start_date DATE,
    end_date DATE,

    -- Zugewiesen
    owner_id UUID,                -- Admin/Crew User ID (später)
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,

    -- Notizen
    notes TEXT,
    tags TEXT[]
);

CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_start_date ON projects(start_date);
CREATE INDEX idx_projects_slug ON projects(slug);

-- ============================================
-- Projektmanagement: Aufgaben
-- ============================================
CREATE TABLE IF NOT EXISTS project_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Verknüpfung
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

    -- Aufgabe
    title TEXT NOT NULL,
    description TEXT,

    -- Status
    status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN (
        'todo', 'in_progress', 'review', 'done', 'cancelled'
    )),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),

    -- Fälligkeit
    due_date DATE,

    -- Zugewiesen
    assigned_to_id UUID,

    -- Reihenfolge
    order_index INTEGER DEFAULT 0
);

CREATE INDEX idx_project_tasks_project_id ON project_tasks(project_id);
CREATE INDEX idx_project_tasks_status ON project_tasks(status);
CREATE INDEX idx_project_tasks_due_date ON project_tasks(due_date);

-- ============================================
-- Kalender: Events (erweitert)
-- ============================================
CREATE TABLE IF NOT EXISTS events_v2 (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Event
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    description TEXT,

    -- Datum & Zeit (ISO 8601, Europe/Zurich)
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ,

    -- Ort
    location_name TEXT,
    location_address TEXT,
    location_city TEXT,
    location_postal_code TEXT,

    -- Kapazität & RSVP
    max_attendees INTEGER,        -- NULL = unbegrenzt
    rsvp_enabled BOOLEAN DEFAULT true,
    rsvp_deadline TIMESTAMPTZ,

    -- Status
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
        'draft', 'published', 'cancelled', 'past'
    )),

    -- Verknüpfung
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,

    -- Metadaten
    image_url TEXT,
    external_url TEXT,
    tags TEXT[]
);

CREATE INDEX idx_events_v2_start_at ON events_v2(start_at);
CREATE INDEX idx_events_v2_status ON events_v2(status);
CREATE INDEX idx_events_v2_slug ON events_v2(slug);

-- ============================================
-- Kalender: RSVPs
-- ============================================
CREATE TABLE IF NOT EXISTS event_rsvps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Verknüpfung
    event_id UUID NOT NULL REFERENCES events_v2(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,

    -- Fallback: wenn kein Contact (öffentliche Anmeldung)
    guest_name TEXT,
    guest_email TEXT NOT NULL,
    guest_phone TEXT,
    number_of_guests INTEGER DEFAULT 1,

    -- Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'confirmed', 'cancelled', 'no_show'
    )),

    -- Tracking
    source TEXT DEFAULT 'web',   -- 'web', 'admin', 'import'
    notes TEXT
);

CREATE INDEX idx_event_rsvps_event_id ON event_rsvps(event_id);
CREATE INDEX idx_event_rsvps_contact_id ON event_rsvps(contact_id);
CREATE INDEX idx_event_rsvps_status ON event_rsvps(status);
CREATE INDEX idx_event_rsvps_guest_email ON event_rsvps(guest_email);

-- ============================================
-- Buchhaltung: Journal (einfaches Einnahmen/Ausgaben-Journal)
-- Schweizer Standards: CHF, ISO-Datum
-- ============================================
CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Buchungsdatum (ISO: YYYY-MM-DD)
    entry_date DATE NOT NULL,

    -- Betrag in CHF (positiv = Einnahme, negativ = Ausgabe)
    amount_chf DECIMAL(12, 2) NOT NULL,

    -- Typ
    entry_type TEXT NOT NULL CHECK (entry_type IN ('income', 'expense', 'transfer')),

    -- Kategorien (Schweizer Standard)
    category TEXT NOT NULL,       -- z.B. 'event_einnahmen', 'sponsoring', 'miete', 'honorare'
    subcategory TEXT,            -- optional

    -- Beschreibung
    description TEXT NOT NULL,
    reference TEXT,              -- Rechnungs-Nr., Beleg-Nr.

    -- Verknüpfung
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    event_id UUID REFERENCES events_v2(id) ON DELETE SET NULL,

    -- MWST (Schweizer Sätze: 8.1%, 2.7%, 0%)
    vat_rate DECIMAL(5, 2) DEFAULT 0,  -- 0, 2.7, 8.1
    vat_amount_chf DECIMAL(12, 2) DEFAULT 0,

    -- Admin
    created_by_id UUID,
    is_reconciled BOOLEAN DEFAULT false,
    notes TEXT
);

CREATE INDEX idx_journal_entries_entry_date ON journal_entries(entry_date);
CREATE INDEX idx_journal_entries_entry_type ON journal_entries(entry_type);
CREATE INDEX idx_journal_entries_category ON journal_entries(category);
CREATE INDEX idx_journal_entries_contact_id ON journal_entries(contact_id);
CREATE INDEX idx_journal_entries_project_id ON journal_entries(project_id);

-- ============================================
-- Trigger: updated_at
-- ============================================
CREATE TRIGGER update_contacts_updated_at
    BEFORE UPDATE ON contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deals_updated_at
    BEFORE UPDATE ON deals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_tasks_updated_at
    BEFORE UPDATE ON project_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_v2_updated_at
    BEFORE UPDATE ON events_v2
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_rsvps_updated_at
    BEFORE UPDATE ON event_rsvps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journal_entries_updated_at
    BEFORE UPDATE ON journal_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RLS: Admin-V2 Tabellen (nur authentifizierte Admins)
-- ============================================
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE events_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Kein öffentlicher Zugriff (alle Zugriffe über Service Role / Admin API)
CREATE POLICY "No public access to contacts" ON contacts FOR ALL TO anon USING (false);
CREATE POLICY "No public access to companies" ON companies FOR ALL TO anon USING (false);
CREATE POLICY "No public access to deals" ON deals FOR ALL TO anon USING (false);
CREATE POLICY "No public access to projects" ON projects FOR ALL TO anon USING (false);
CREATE POLICY "No public access to project_tasks" ON project_tasks FOR ALL TO anon USING (false);
CREATE POLICY "No public access to events_v2" ON events_v2 FOR ALL TO anon USING (false);
CREATE POLICY "No public access to event_rsvps" ON event_rsvps FOR ALL TO anon USING (false);
CREATE POLICY "No public access to journal_entries" ON journal_entries FOR ALL TO anon USING (false);

-- ============================================
-- Öffentliches RSVP: INSERT auf event_rsvps (für Web-Formular)
-- ============================================
CREATE POLICY "Public can insert event rsvps"
    ON event_rsvps
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Öffentlich: SELECT auf published Events (für Kalender-Anzeige)
CREATE POLICY "Public can select published events"
    ON events_v2
    FOR SELECT
    TO anon, authenticated
    USING (status = 'published');
