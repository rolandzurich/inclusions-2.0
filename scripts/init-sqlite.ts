/**
 * Initialisiert die SQLite-Datenbank mit allen Tabellen
 */

import Database from 'better-sqlite3';
import { join } from 'path';
import { mkdirSync, existsSync } from 'fs';

const dbDir = join(process.cwd(), 'data');
const dbPath = join(dbDir, 'inclusions.db');

// Erstelle data-Verzeichnis falls nicht vorhanden
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true });
  console.log('✅ data/ Verzeichnis erstellt');
}

console.log('📂 Erstelle SQLite-Datenbank:', dbPath);

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Newsletter Subscribers
db.exec(`
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  has_disability INTEGER DEFAULT 0,
  interests TEXT,
  opt_in_token TEXT,
  opt_in_confirmed_at TEXT,
  opt_in_expires_at TEXT,
  source_url TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  status TEXT DEFAULT 'pending',
  unsubscribed_at TEXT,
  honeypot TEXT,
  ip_address TEXT,
  admin_notes TEXT,
  mailchimp_synced_at TEXT,
  mailchimp_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_status ON newsletter_subscribers(status);
`);

console.log('✅ Tabelle newsletter_subscribers erstellt');

// Contact Requests
db.exec(`
CREATE TABLE IF NOT EXISTS contact_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  booking_type TEXT,
  booking_item TEXT,
  event_date TEXT,
  event_location TEXT,
  event_type TEXT,
  source_url TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  status TEXT DEFAULT 'new',
  viewed_at TEXT,
  honeypot TEXT,
  ip_address TEXT,
  admin_notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_contact_email ON contact_requests(email);
CREATE INDEX IF NOT EXISTS idx_contact_status ON contact_requests(status);
`);

console.log('✅ Tabelle contact_requests erstellt');

// VIP Registrations
db.exec(`
CREATE TABLE IF NOT EXISTS vip_registrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  event_date TEXT,
  event_location TEXT,
  event_type TEXT,
  message TEXT,
  company TEXT,
  number_of_guests INTEGER,
  special_requirements TEXT,
  source_url TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  status TEXT DEFAULT 'new',
  viewed_at TEXT,
  honeypot TEXT,
  ip_address TEXT,
  admin_notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_vip_email ON vip_registrations(email);
CREATE INDEX IF NOT EXISTS idx_vip_status ON vip_registrations(status);
`);

console.log('✅ Tabelle vip_registrations erstellt');

db.close();
console.log('🎉 SQLite-Datenbank erfolgreich initialisiert!');
console.log('📍 Datenbankpfad:', dbPath);
