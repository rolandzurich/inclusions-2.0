-- ============================================
-- ROLLBACK 002: Schema-Konsolidierung rückgängig machen
-- ============================================
-- Benennt Spalten zurück auf die Original-Namen.
-- Alles idempotent (nur wenn die neuen Namen existieren).

-- ==========================================
-- 1. PROJECTS: title → name, client_id → company_id, budget_chf + metadata entfernen
-- ==========================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'title')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'name')
  THEN
    ALTER TABLE projects RENAME COLUMN title TO name;
    RAISE NOTICE 'ROLLBACK projects: title → name';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'client_id')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'company_id')
  THEN
    ALTER TABLE projects RENAME COLUMN client_id TO company_id;
    RAISE NOTICE 'ROLLBACK projects: client_id → company_id';
  END IF;
END $$;

-- budget_chf und metadata entfernen (Daten gehen verloren!)
ALTER TABLE projects DROP COLUMN IF EXISTS budget_chf;
ALTER TABLE projects DROP COLUMN IF EXISTS metadata;

-- Status-Constraint zurücksetzen
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_v2;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'projects' AND constraint_name = 'projects_status_check'
  ) THEN
    ALTER TABLE projects ADD CONSTRAINT projects_status_check
      CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled'));
    RAISE NOTICE 'ROLLBACK projects: Status-Constraint zurückgesetzt';
  END IF;
END $$;

-- ==========================================
-- 2. EVENT_RSVPS: user_email → guest_email, user_name → guest_name
-- ==========================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'event_rsvps' AND column_name = 'user_email')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'event_rsvps' AND column_name = 'guest_email')
  THEN
    ALTER TABLE event_rsvps RENAME COLUMN user_email TO guest_email;
    RAISE NOTICE 'ROLLBACK event_rsvps: user_email → guest_email';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'event_rsvps' AND column_name = 'user_name')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'event_rsvps' AND column_name = 'guest_name')
  THEN
    ALTER TABLE event_rsvps RENAME COLUMN user_name TO guest_name;
    RAISE NOTICE 'ROLLBACK event_rsvps: user_name → guest_name';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'event_rsvps' AND column_name = 'user_phone')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'event_rsvps' AND column_name = 'guest_phone')
  THEN
    ALTER TABLE event_rsvps RENAME COLUMN user_phone TO guest_phone;
    RAISE NOTICE 'ROLLBACK event_rsvps: user_phone → guest_phone';
  END IF;
END $$;

-- RSVP Status-Constraint zurücksetzen
ALTER TABLE event_rsvps DROP CONSTRAINT IF EXISTS event_rsvps_status_v2;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'event_rsvps' AND constraint_name = 'event_rsvps_status_check'
  ) THEN
    ALTER TABLE event_rsvps ADD CONSTRAINT event_rsvps_status_check
      CHECK (status IN ('pending', 'confirmed', 'cancelled', 'no_show'));
    RAISE NOTICE 'ROLLBACK event_rsvps: Status-Constraint zurückgesetzt';
  END IF;
END $$;

-- ==========================================
-- 3. CONTACTS: UNIQUE Constraint entfernen
-- ==========================================

ALTER TABLE contacts DROP CONSTRAINT IF EXISTS contacts_email_unique;

-- ==========================================
-- FERTIG
-- ==========================================
SELECT 'ROLLBACK 002_consolidate_schemas erfolgreich' as status;
