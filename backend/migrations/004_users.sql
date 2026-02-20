-- Migration 004: Users-Tabelle für Multi-User-Authentifizierung
-- Ersetzt die env-basierte ADMIN_EMAILS-Logik durch eine DB-basierte User-Verwaltung

-- UUID Extension sicherstellen
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users-Tabelle
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'crew' CHECK (role IN ('admin', 'crew')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'disabled')),
  invited_by UUID REFERENCES users(id),
  invite_token TEXT UNIQUE,
  invite_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

-- Indizes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_invite_token ON users(invite_token) WHERE invite_token IS NOT NULL;

-- Seed: Bestehende Admin-Accounts anlegen
-- Passwort-Hash für 'Inclusions2026!' (bcrypt, 12 rounds)
-- Wird beim ersten Server-Start durch die Init-API gesetzt
-- Hier legen wir nur die Platzhalter an, die Init-API setzt den echten Hash
INSERT INTO users (email, name, password_hash, role, status)
VALUES 
  ('info@inclusions.zone', 'Roland', '$PLACEHOLDER_HASH$', 'admin', 'active'),
  ('reto@inclusions.zone', 'Reto', '$PLACEHOLDER_HASH$', 'admin', 'active')
ON CONFLICT (email) DO UPDATE SET
  role = EXCLUDED.role,
  status = EXCLUDED.status,
  updated_at = NOW();
