-- ============================================
-- INCLUSIONS KI-E-Mail-Hub – Datenbankschema
-- ============================================
-- Speichert eingehende E-Mails, KI-Analysen und vorgeschlagene Aktionen.

-- 1. Eingehende E-Mails
CREATE TABLE IF NOT EXISTS email_messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id      TEXT UNIQUE NOT NULL,           -- RFC Message-ID (Deduplizierung)
  account         TEXT NOT NULL,                   -- info@, reto@, roland@
  from_email      TEXT NOT NULL,
  from_name       TEXT,
  to_email        TEXT,
  cc              TEXT,
  subject         TEXT,
  body_text       TEXT,                            -- Plain-Text
  body_html       TEXT,                            -- HTML
  received_at     TIMESTAMPTZ NOT NULL,
  folder          TEXT DEFAULT 'INBOX',
  has_attachments BOOLEAN DEFAULT false,
  attachment_info JSONB,                           -- [{name, size, type}]
  
  -- KI-Analyse
  ai_status       TEXT DEFAULT 'pending'           -- pending, analyzing, analyzed, error, skipped
                   CHECK (ai_status IN ('pending','analyzing','analyzed','error','skipped')),
  ai_analysis     JSONB,                           -- Vollständiges Gemini-Ergebnis
  ai_summary      TEXT,                            -- Kurzzusammenfassung (1-2 Sätze)
  ai_classification TEXT,                          -- booking, sponsoring, partnership, media, volunteer, general, newsletter, spam, internal
  ai_urgency      TEXT DEFAULT 'normal'            -- low, normal, medium, high, critical
                   CHECK (ai_urgency IN ('low','normal','medium','high','critical')),
  ai_sentiment    TEXT,                            -- positiv, neutral, negativ
  ai_analyzed_at  TIMESTAMPTZ,
  
  -- Verarbeitung
  is_processed    BOOLEAN DEFAULT false,
  processed_at    TIMESTAMPTZ,
  is_read         BOOLEAN DEFAULT false,
  is_archived     BOOLEAN DEFAULT false,
  notes           TEXT,                            -- Manuelle Notizen
  
  -- Web-Research
  web_research    JSONB,                           -- {query, results[], researched_at}
  
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Index für schnelle Abfragen
CREATE INDEX IF NOT EXISTS idx_email_account ON email_messages(account);
CREATE INDEX IF NOT EXISTS idx_email_ai_status ON email_messages(ai_status);
CREATE INDEX IF NOT EXISTS idx_email_classification ON email_messages(ai_classification);
CREATE INDEX IF NOT EXISTS idx_email_urgency ON email_messages(ai_urgency);
CREATE INDEX IF NOT EXISTS idx_email_received ON email_messages(received_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_processed ON email_messages(is_processed);

-- 2. Vorgeschlagene Aktionen (KI erstellt, Mensch bestätigt)
CREATE TABLE IF NOT EXISTS email_actions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_id        UUID NOT NULL REFERENCES email_messages(id) ON DELETE CASCADE,
  
  action_type     TEXT NOT NULL                    -- create_contact, update_contact, create_company,
                   CHECK (action_type IN (         -- create_deal, create_project, create_event,
                     'create_contact', 'update_contact',  -- create_booking, create_vip, add_note
                     'create_company', 'update_company',
                     'create_deal', 'update_deal',
                     'create_project',
                     'create_event',
                     'create_booking',
                     'create_vip',
                     'add_note',
                     'web_research'
                   )),
  action_data     JSONB NOT NULL,                  -- Vorgeschlagene Daten für die Aktion
  
  status          TEXT DEFAULT 'suggested'
                   CHECK (status IN ('suggested','approved','rejected','applied','error')),
  
  -- Nach Anwendung: Referenz zum erstellten Objekt
  result_type     TEXT,                            -- contacts, companies, deals, projects, events_v2
  result_id       UUID,
  
  -- Research-Markierung
  is_research     BOOLEAN DEFAULT false,           -- true = basiert auf Web-Research (nicht aus E-Mail)
  research_source TEXT,                            -- URL oder Suchquery
  
  applied_at      TIMESTAMPTZ,
  applied_by      TEXT,                            -- E-Mail des Admins der bestätigt hat
  
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_actions_email ON email_actions(email_id);
CREATE INDEX IF NOT EXISTS idx_email_actions_status ON email_actions(status);
CREATE INDEX IF NOT EXISTS idx_email_actions_type ON email_actions(action_type);

-- 3. Digest-Tracking
CREATE TABLE IF NOT EXISTS email_digests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  digest_type     TEXT NOT NULL DEFAULT 'daily',   -- daily, weekly, urgent
  sent_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  recipients      TEXT[] NOT NULL,
  email_count     INTEGER DEFAULT 0,
  action_count    INTEGER DEFAULT 0,
  digest_data     JSONB,                           -- Inhalt des Digests
  resend_id       TEXT                             -- Resend Message-ID
);

CREATE INDEX IF NOT EXISTS idx_digest_sent ON email_digests(sent_at DESC);

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION update_email_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_email_messages_updated ON email_messages;
CREATE TRIGGER trg_email_messages_updated
  BEFORE UPDATE ON email_messages
  FOR EACH ROW EXECUTE FUNCTION update_email_updated_at();

DROP TRIGGER IF EXISTS trg_email_actions_updated ON email_actions;
CREATE TRIGGER trg_email_actions_updated
  BEFORE UPDATE ON email_actions
  FOR EACH ROW EXECUTE FUNCTION update_email_updated_at();
