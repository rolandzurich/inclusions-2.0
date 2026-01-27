/**
 * SQLite Datenbank-Verbindung
 * Einfache lokale Datenbank für Formulardaten
 */

import Database from 'better-sqlite3';
import { join } from 'path';

let db: Database.Database | null = null;

/**
 * Holt oder erstellt die SQLite-Datenbankverbindung
 */
export function getDb(): Database.Database {
  if (!db) {
    const dbPath = process.env.SQLITE_DB_PATH || join(process.cwd(), 'data', 'inclusions.db');
    console.log('📂 Verbinde mit SQLite:', dbPath);
    
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL'); // Bessere Performance
    
    console.log('✅ SQLite-Verbindung hergestellt');
  }
  
  return db;
}

/**
 * Führt eine SQL-Query aus
 */
export function queryDb(sql: string, params: any[] = []): { data: any[] | null; error: string | null } {
  try {
    const database = getDb();
    const stmt = database.prepare(sql);
    const rows = stmt.all(...params);
    
    return { data: rows as any[], error: null };
  } catch (error: any) {
    console.error('❌ SQLite Query Fehler:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Fügt einen neuen Datensatz ein
 */
export function insertDb(table: string, data: Record<string, any>): { data: any | null; error: string | null } {
  try {
    const database = getDb();
    const columns = Object.keys(data);
    const placeholders = columns.map(() => '?').join(', ');
    const values = columns.map(col => data[col]);
    
    const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;
    const stmt = database.prepare(sql);
    const result = stmt.run(...values);
    
    // Hole den eingefügten Datensatz zurück
    const inserted = database.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(result.lastInsertRowid);
    
    console.log(`✅ Datensatz in ${table} gespeichert, ID:`, result.lastInsertRowid);
    return { data: inserted as any, error: null };
  } catch (error: any) {
    console.error('❌ SQLite Insert Fehler:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Schließt die Datenbankverbindung
 */
export function closeDb() {
  if (db) {
    db.close();
    db = null;
    console.log('🔒 SQLite-Verbindung geschlossen');
  }
}
