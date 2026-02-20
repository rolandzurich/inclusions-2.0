-- ============================================
-- Migration 006: Buchhaltung erweitern für Ausgaben-Import
-- Neue Felder: Bezahlt von, Spesen-Status, Lieferant, Originalwährung, Quittungs-Link
-- ============================================

-- Lieferant / Partner
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS supplier TEXT;

-- Wer hat bezahlt
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS paid_by TEXT;

-- Als Spesen beglichen (ja/nein)
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS is_reimbursed BOOLEAN DEFAULT false;

-- Originalwährung (falls nicht CHF)
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS original_currency TEXT DEFAULT 'CHF';

-- Originalbetrag in Fremdwährung
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS original_amount DECIMAL(12, 2);

-- Link zur Quittung (z.B. Google Drive URL)
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS receipt_url TEXT;

-- Dateiname der Quittung
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS receipt_filename TEXT;

-- Index für Lieferant
CREATE INDEX IF NOT EXISTS idx_journal_entries_supplier ON journal_entries(supplier);

-- Index für bezahlt von
CREATE INDEX IF NOT EXISTS idx_journal_entries_paid_by ON journal_entries(paid_by);

-- Index für Spesen-Status
CREATE INDEX IF NOT EXISTS idx_journal_entries_is_reimbursed ON journal_entries(is_reimbursed);
