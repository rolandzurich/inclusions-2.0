-- ============================================
-- ROLLBACK 000: Migrations-System entfernen
-- ============================================
-- ACHTUNG: Entfernt die Tracking-Tabelle!
-- Nur ausführen, wenn das gesamte System zurückgesetzt werden soll.

DROP TABLE IF EXISTS _migrations;
