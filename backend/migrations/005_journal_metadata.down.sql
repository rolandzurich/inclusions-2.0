-- Rollback Migration 005: metadata-Spalte entfernen
ALTER TABLE journal_entries
DROP COLUMN IF EXISTS metadata;
