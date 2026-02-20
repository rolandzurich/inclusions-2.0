-- ============================================
-- INCLUSIONS – Migrations-System
-- ============================================
-- Diese Tabelle trackt welche Migrationen bereits ausgeführt wurden.
-- Muss als ERSTE Migration ausgeführt werden.

CREATE TABLE IF NOT EXISTS _migrations (
  id          SERIAL PRIMARY KEY,
  name        TEXT UNIQUE NOT NULL,              -- z.B. "001_initial_crm"
  executed_at TIMESTAMPTZ DEFAULT NOW(),
  checksum    TEXT,                              -- MD5 der SQL-Datei (optional)
  success     BOOLEAN DEFAULT true
);

-- Index für schnelle Lookups
CREATE INDEX IF NOT EXISTS idx_migrations_name ON _migrations(name);
