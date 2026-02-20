-- Rollback Migration 004: Users-Tabelle entfernen
DROP TABLE IF EXISTS users CASCADE;
