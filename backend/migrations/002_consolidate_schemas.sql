-- ============================================
-- Migration 002: Schema-Konsolidierung
-- ============================================
-- Behebt alle Inkonsistenzen zwischen DB-Schema und API-Code.
-- Sicher: Alle Änderungen sind idempotent (IF NOT EXISTS / IF EXISTS).

-- ==========================================
-- 1. PROJECTS: name → title, company_id → client_id, + budget_chf, + metadata
-- ==========================================

-- Spalte "name" → "title" umbenennen (falls "name" existiert und "title" nicht)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'name')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'title')
  THEN
    ALTER TABLE projects RENAME COLUMN name TO title;
    RAISE NOTICE 'projects: name → title umbenannt';
  END IF;
END $$;

-- Spalte "company_id" → "client_id" umbenennen
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'company_id')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'client_id')
  THEN
    ALTER TABLE projects RENAME COLUMN company_id TO client_id;
    RAISE NOTICE 'projects: company_id → client_id umbenannt';
  END IF;
END $$;

-- budget_chf hinzufügen falls nicht vorhanden
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'budget_chf')
  THEN
    ALTER TABLE projects ADD COLUMN budget_chf DECIMAL(12, 2);
    RAISE NOTICE 'projects: budget_chf hinzugefügt';
  END IF;
END $$;

-- metadata (JSONB) hinzufügen falls nicht vorhanden
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'metadata')
  THEN
    ALTER TABLE projects ADD COLUMN metadata JSONB;
    RAISE NOTICE 'projects: metadata hinzugefügt';
  END IF;
END $$;

-- Status-Check erweitern: 'draft' hinzufügen (DROP + RE-CREATE Constraint)
DO $$
BEGIN
  -- Alte Constraint entfernen (falls vorhanden)
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'projects' AND constraint_type = 'CHECK' 
    AND constraint_name LIKE '%status%'
  ) THEN
    -- Constraint-Name dynamisch finden und droppen
    EXECUTE (
      SELECT 'ALTER TABLE projects DROP CONSTRAINT ' || constraint_name
      FROM information_schema.table_constraints 
      WHERE table_name = 'projects' AND constraint_type = 'CHECK'
      AND constraint_name LIKE '%status%'
      LIMIT 1
    );
    RAISE NOTICE 'projects: alte Status-Constraint entfernt';
  END IF;
END $$;

-- Neue Status-Constraint mit allen gültigen Werten
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'projects' AND constraint_name = 'projects_status_v2'
  ) THEN
    ALTER TABLE projects ADD CONSTRAINT projects_status_v2
      CHECK (status IN ('draft', 'planned', 'planning', 'active', 'on_hold', 'completed', 'cancelled'));
    RAISE NOTICE 'projects: Status-Constraint aktualisiert';
  END IF;
END $$;

-- ==========================================
-- 2. EVENT_RSVPS: guest_email → user_email, guest_name → user_name
-- ==========================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'event_rsvps' AND column_name = 'guest_email')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'event_rsvps' AND column_name = 'user_email')
  THEN
    ALTER TABLE event_rsvps RENAME COLUMN guest_email TO user_email;
    RAISE NOTICE 'event_rsvps: guest_email → user_email umbenannt';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'event_rsvps' AND column_name = 'guest_name')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'event_rsvps' AND column_name = 'user_name')
  THEN
    ALTER TABLE event_rsvps RENAME COLUMN guest_name TO user_name;
    RAISE NOTICE 'event_rsvps: guest_name → user_name umbenannt';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'event_rsvps' AND column_name = 'guest_phone')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'event_rsvps' AND column_name = 'user_phone')
  THEN
    ALTER TABLE event_rsvps RENAME COLUMN guest_phone TO user_phone;
    RAISE NOTICE 'event_rsvps: guest_phone → user_phone umbenannt';
  END IF;
END $$;

-- RSVP Status: Schema erlaubt nur pending/confirmed/cancelled/no_show
-- API nutzt yes/no/maybe → wir erweitern die erlaubten Werte
ALTER TABLE event_rsvps DROP CONSTRAINT IF EXISTS event_rsvps_status_check;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'event_rsvps' AND constraint_name = 'event_rsvps_status_v2'
  ) THEN
    ALTER TABLE event_rsvps ADD CONSTRAINT event_rsvps_status_v2
      CHECK (status IN ('pending', 'confirmed', 'cancelled', 'no_show', 'yes', 'no', 'maybe'));
    RAISE NOTICE 'event_rsvps: Status-Constraint erweitert';
  END IF;
END $$;

-- ==========================================
-- 3. EVENTS_V2: max_attendees sicherstellen (API nutzt korrekt max_attendees)
-- ==========================================
-- Keine Änderung nötig – Schema hat max_attendees, API wurde bereits in Phase 1 gefixt.
-- Nur RSVP-API nutzt noch fälschlich "max_capacity" → wird im Code gefixt.

-- ==========================================
-- 4. CONTACTS: email UNIQUE Constraint sicherstellen
-- ==========================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'contacts_email_unique' AND conrelid = 'contacts'::regclass
  ) THEN
    -- Nur hinzufügen wenn keine Duplikate existieren
    IF (SELECT COUNT(email) - COUNT(DISTINCT email) FROM contacts WHERE email IS NOT NULL) = 0 THEN
      ALTER TABLE contacts ADD CONSTRAINT contacts_email_unique UNIQUE (email);
      RAISE NOTICE 'contacts: UNIQUE Constraint auf email hinzugefügt';
    ELSE
      RAISE NOTICE 'contacts: Duplikate gefunden, UNIQUE Constraint nicht möglich';
    END IF;
  END IF;
END $$;

-- ==========================================
-- FERTIG
-- ==========================================
SELECT 'Migration 002_consolidate_schemas erfolgreich' as status;
