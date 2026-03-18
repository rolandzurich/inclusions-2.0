-- Migration 005: metadata-Spalte für Journal-Einträge
-- Wird für Attachment-Daten und Dedup-Metadaten in /api/admin-v2/journal benötigt

ALTER TABLE journal_entries
ADD COLUMN IF NOT EXISTS metadata JSONB;
