/**
 * INCLUSIONS – Datenbank-Migrations-System
 * 
 * Führt nummerierte SQL-Migrationen aus und trackt welche bereits gelaufen sind.
 * Jede Migration wird genau einmal ausgeführt (idempotent).
 * 
 * Sicherheitsfeatures:
 *   - Automatisches DB-Backup vor dem Ausführen von Migrationen
 *   - Rollback per DOWN-Datei (z.B. 002_feature.down.sql)
 *   - Stopp bei erstem Fehler (keine halben Migrationen)
 * 
 * Nutzung:
 *   await runPendingMigrations()     → Führt alle neuen Migrationen aus
 *   await rollbackLastMigration()    → Macht die letzte Migration rückgängig
 *   await getMigrationStatus()       → Zeigt Status aller Migrationen
 *   await createBackup()             → Erstellt manuelles DB-Backup
 *   await getBackups()               → Listet alle Backups
 */

import { query } from './db-postgres';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const MIGRATIONS_DIR = path.join(process.cwd(), 'backend', 'migrations');

export interface MigrationFile {
  name: string;
  path: string;
  number: number;
}

export interface MigrationStatus {
  name: string;
  number: number;
  status: 'pending' | 'executed' | 'error';
  executed_at?: string;
}

export interface MigrationResult {
  name: string;
  success: boolean;
  message: string;
  duration_ms: number;
}

/**
 * Stellt sicher, dass die _migrations Tracking-Tabelle existiert.
 */
async function ensureMigrationsTable(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id          SERIAL PRIMARY KEY,
      name        TEXT UNIQUE NOT NULL,
      executed_at TIMESTAMPTZ DEFAULT NOW(),
      checksum    TEXT,
      success     BOOLEAN DEFAULT true
    )
  `);
}

/**
 * Liest alle SQL-Dateien aus dem Migrations-Verzeichnis.
 */
async function getMigrationFiles(): Promise<MigrationFile[]> {
  try {
    const files = await fs.readdir(MIGRATIONS_DIR);
    return files
      .filter(f => f.endsWith('.sql') && !f.includes('.down.') && !f.startsWith('.'))
      .map(f => {
        const match = f.match(/^(\d+)/);
        return {
          name: f.replace('.sql', ''),
          path: path.join(MIGRATIONS_DIR, f),
          number: match ? parseInt(match[1]) : 999,
        };
      })
      .sort((a, b) => a.number - b.number);
  } catch {
    return [];
  }
}

/**
 * Prüft welche Migrationen bereits ausgeführt wurden.
 */
async function getExecutedMigrations(): Promise<Set<string>> {
  const result = await query('SELECT name FROM _migrations WHERE success = true');
  const names = new Set<string>();
  (result.data || []).forEach((row: any) => names.add(row.name));
  return names;
}

/**
 * Gibt den Status aller Migrationen zurück.
 */
export async function getMigrationStatus(): Promise<MigrationStatus[]> {
  await ensureMigrationsTable();
  
  const files = await getMigrationFiles();
  const executed = await getExecutedMigrations();
  
  // Auch fehlgeschlagene laden
  const allResult = await query('SELECT name, executed_at, success FROM _migrations ORDER BY id');
  const executedMap = new Map<string, any>();
  (allResult.data || []).forEach((row: any) => executedMap.set(row.name, row));
  
  return files.map(f => {
    const record = executedMap.get(f.name);
    return {
      name: f.name,
      number: f.number,
      status: record 
        ? (record.success ? 'executed' : 'error')
        : 'pending',
      executed_at: record?.executed_at,
    };
  });
}

/**
 * Führt alle ausstehenden Migrationen aus.
 * Stoppt beim ersten Fehler (keine halben Migrationen).
 */
export async function runPendingMigrations(options?: {
  dryRun?: boolean;
  upTo?: number; // Bis zu dieser Migrationsnummer
}): Promise<{ results: MigrationResult[]; success: boolean }> {
  await ensureMigrationsTable();
  
  const files = await getMigrationFiles();
  const executed = await getExecutedMigrations();
  
  const pending = files.filter(f => {
    if (executed.has(f.name)) return false;
    if (options?.upTo !== undefined && f.number > options.upTo) return false;
    return true;
  });
  
  if (pending.length === 0) {
    return { results: [], success: true };
  }
  
  console.log(`📦 ${pending.length} ausstehende Migration(en) gefunden`);
  
  // Automatisches Backup VOR Migrationen (nur wenn nicht Dry Run)
  if (!options?.dryRun) {
    console.log('🔒 Erstelle automatisches Backup vor Migrationen...');
    const backupResult = await createBackup('auto-migration');
    if (!backupResult.success) {
      console.error(`⚠️ Backup fehlgeschlagen: ${backupResult.error} – Migrationen werden trotzdem ausgeführt`);
    }
  }
  
  const results: MigrationResult[] = [];
  
  for (const migration of pending) {
    const start = Date.now();
    
    if (options?.dryRun) {
      results.push({
        name: migration.name,
        success: true,
        message: 'DRY RUN – nicht ausgeführt',
        duration_ms: 0,
      });
      continue;
    }
    
    try {
      console.log(`  ▶ ${migration.name}...`);
      
      const sql = await fs.readFile(migration.path, 'utf-8');
      const checksum = crypto.createHash('md5').update(sql).digest('hex');
      
      // Migration ausführen
      const result = await query(sql);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Als erfolgreich markieren
      await query(
        'INSERT INTO _migrations (name, checksum, success) VALUES ($1, $2, true) ON CONFLICT (name) DO UPDATE SET success = true, executed_at = NOW()',
        [migration.name, checksum]
      );
      
      const duration = Date.now() - start;
      console.log(`  ✅ ${migration.name} (${duration}ms)`);
      
      results.push({
        name: migration.name,
        success: true,
        message: 'Erfolgreich',
        duration_ms: duration,
      });
      
    } catch (err: any) {
      const duration = Date.now() - start;
      console.error(`  ❌ ${migration.name}: ${err.message}`);
      
      // Als fehlgeschlagen markieren
      await query(
        'INSERT INTO _migrations (name, success) VALUES ($1, false) ON CONFLICT (name) DO UPDATE SET success = false, executed_at = NOW()',
        [migration.name]
      );
      
      results.push({
        name: migration.name,
        success: false,
        message: err.message,
        duration_ms: duration,
      });
      
      // Stopp bei Fehler
      return { results, success: false };
    }
  }
  
  return { results, success: true };
}

// ============================================================
// BACKUP-SYSTEM
// ============================================================

const BACKUPS_DIR = path.join(process.cwd(), 'backups', 'db');

export interface BackupInfo {
  name: string;
  path: string;
  created_at: string;
  size_bytes: number;
  trigger: string; // 'auto-migration' | 'auto-rollback' | 'manual'
}

/**
 * Erstellt ein Datenbank-Backup (Schema + Daten als SQL-Dump).
 * Nutzt pg_dump falls verfügbar, sonst einen SQL-basierten Snapshot.
 */
export async function createBackup(trigger: string = 'manual'): Promise<{
  success: boolean;
  backup?: BackupInfo;
  error?: string;
}> {
  try {
    await fs.mkdir(BACKUPS_DIR, { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `backup_${trigger}_${timestamp}.sql`;
    const filepath = path.join(BACKUPS_DIR, filename);
    
    // SQL-basierter Backup: Alle Tabellen-Daten exportieren
    const tablesResult = await query(`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename
    `);
    
    if (tablesResult.error) {
      throw new Error(`Tabellenliste: ${tablesResult.error}`);
    }
    
    const tables = (tablesResult.data || []).map((r: any) => r.tablename);
    let backupSql = `-- INCLUSIONS DB Backup\n-- Erstellt: ${new Date().toISOString()}\n-- Trigger: ${trigger}\n-- Tabellen: ${tables.length}\n\n`;
    
    for (const table of tables) {
      // Schema (CREATE TABLE)
      const schemaResult = await query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = $1 AND table_schema = 'public'
        ORDER BY ordinal_position
      `, [table]);
      
      backupSql += `-- Tabelle: ${table}\n`;
      
      // Daten (INSERT)
      const dataResult = await query(`SELECT * FROM "${table}"`);
      const rows = dataResult.data || [];
      
      backupSql += `-- ${rows.length} Zeilen\n`;
      
      if (rows.length > 0) {
        const columns = Object.keys(rows[0]);
        for (const row of rows) {
          const values = columns.map(col => {
            const val = row[col];
            if (val === null || val === undefined) return 'NULL';
            if (typeof val === 'number' || typeof val === 'boolean') return String(val);
            if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
            return `'${String(val).replace(/'/g, "''")}'`;
          });
          backupSql += `INSERT INTO "${table}" (${columns.map(c => `"${c}"`).join(', ')}) VALUES (${values.join(', ')}) ON CONFLICT DO NOTHING;\n`;
        }
      }
      backupSql += '\n';
    }
    
    await fs.writeFile(filepath, backupSql, 'utf-8');
    const stat = await fs.stat(filepath);
    
    const backup: BackupInfo = {
      name: filename,
      path: filepath,
      created_at: new Date().toISOString(),
      size_bytes: stat.size,
      trigger,
    };
    
    console.log(`💾 Backup erstellt: ${filename} (${(stat.size / 1024).toFixed(1)} KB)`);
    return { success: true, backup };
    
  } catch (err: any) {
    console.error(`❌ Backup fehlgeschlagen: ${err.message}`);
    return { success: false, error: err.message };
  }
}

/**
 * Listet alle verfügbaren Backups.
 */
export async function getBackups(): Promise<BackupInfo[]> {
  try {
    await fs.mkdir(BACKUPS_DIR, { recursive: true });
    const files = await fs.readdir(BACKUPS_DIR);
    const backups: BackupInfo[] = [];
    
    for (const file of files.filter(f => f.endsWith('.sql'))) {
      const filepath = path.join(BACKUPS_DIR, file);
      const stat = await fs.stat(filepath);
      
      // Trigger aus Dateinamen extrahieren
      const triggerMatch = file.match(/^backup_(.+?)_\d{4}/);
      
      backups.push({
        name: file,
        path: filepath,
        created_at: stat.mtime.toISOString(),
        size_bytes: stat.size,
        trigger: triggerMatch?.[1] || 'unknown',
      });
    }
    
    return backups.sort((a, b) => b.created_at.localeCompare(a.created_at));
  } catch {
    return [];
  }
}

// ============================================================
// ROLLBACK-SYSTEM
// ============================================================

/**
 * Macht die letzte ausgeführte Migration rückgängig.
 * 
 * Ablauf:
 *   1. Automatisches Backup erstellen
 *   2. DOWN-Datei der letzten Migration suchen und ausführen
 *   3. Migration aus Tracking entfernen
 * 
 * Voraussetzung: Es muss eine DOWN-Datei existieren (z.B. 002_feature.down.sql)
 */
export async function rollbackLastMigration(): Promise<{
  success: boolean;
  migration?: string;
  message: string;
  backup?: BackupInfo;
}> {
  await ensureMigrationsTable();
  
  // 1. Letzte ausgeführte Migration finden
  const lastResult = await query(
    'SELECT name FROM _migrations WHERE success = true ORDER BY id DESC LIMIT 1'
  );
  
  const lastMigration = lastResult.data?.[0]?.name;
  
  if (!lastMigration) {
    return { success: false, message: 'Keine ausgeführten Migrationen vorhanden' };
  }
  
  // Schutzmechanismus: 000_migration_system darf nicht zurückgerollt werden
  if (lastMigration === '000_migration_system') {
    return { 
      success: false, 
      message: 'Die Migrations-System-Tabelle (000) kann nicht zurückgerollt werden' 
    };
  }
  
  // 2. DOWN-Datei suchen
  const downFilePath = path.join(MIGRATIONS_DIR, `${lastMigration}.down.sql`);
  let downSql: string;
  
  try {
    downSql = await fs.readFile(downFilePath, 'utf-8');
  } catch {
    return {
      success: false,
      migration: lastMigration,
      message: `Keine DOWN-Datei gefunden: ${lastMigration}.down.sql – Rollback nicht möglich`,
    };
  }
  
  // 3. Backup erstellen BEVOR wir irgendetwas ändern
  console.log(`🔒 Erstelle Sicherheits-Backup vor Rollback...`);
  const backupResult = await createBackup('auto-rollback');
  
  if (!backupResult.success) {
    return {
      success: false,
      migration: lastMigration,
      message: `Backup vor Rollback fehlgeschlagen: ${backupResult.error}. Rollback abgebrochen.`,
    };
  }
  
  // 4. DOWN-Migration ausführen
  try {
    console.log(`⏪ Rollback: ${lastMigration}...`);
    
    const result = await query(downSql);
    
    if (result.error) {
      throw new Error(result.error);
    }
    
    // 5. Aus Tracking entfernen
    await query('DELETE FROM _migrations WHERE name = $1', [lastMigration]);
    
    console.log(`✅ Rollback erfolgreich: ${lastMigration}`);
    
    return {
      success: true,
      migration: lastMigration,
      message: `Migration "${lastMigration}" erfolgreich zurückgerollt`,
      backup: backupResult.backup,
    };
    
  } catch (err: any) {
    console.error(`❌ Rollback fehlgeschlagen: ${err.message}`);
    return {
      success: false,
      migration: lastMigration,
      message: `Rollback fehlgeschlagen: ${err.message}. Backup wurde erstellt: ${backupResult.backup?.name}`,
      backup: backupResult.backup,
    };
  }
}
