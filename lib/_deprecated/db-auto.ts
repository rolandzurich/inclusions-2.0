/**
 * Automatische Datenbank-Auswahl
 * Nutzt PostgreSQL wenn verfügbar, sonst SQLite als Fallback
 */

import { testConnection as testPostgres } from './db-postgres';
import { getDb as getSqliteDb } from './db-sqlite';

export type DbType = 'postgres' | 'sqlite';

let cachedDbType: DbType | null = null;

/**
 * Erkennt automatisch, welche Datenbank verfügbar ist
 */
export async function detectDatabase(): Promise<{
  type: DbType;
  available: boolean;
  message: string;
}> {
  // Wenn explizit SQLite gewünscht
  if (process.env.USE_SQLITE === 'true') {
    return {
      type: 'sqlite',
      available: true,
      message: 'SQLite (manuell gewählt)',
    };
  }

  // Wenn PostgreSQL konfiguriert ist, teste Verbindung
  if (process.env.DB_HOST && process.env.DB_DATABASE) {
    try {
      const result = await testPostgres();
      if (result.success) {
        cachedDbType = 'postgres';
        return {
          type: 'postgres',
          available: true,
          message: `PostgreSQL verfügbar (${result.version})`,
        };
      }
    } catch (error) {
      console.warn('⚠️ PostgreSQL nicht verfügbar, nutze SQLite als Fallback');
    }
  }

  // Fallback: SQLite
  cachedDbType = 'sqlite';
  return {
    type: 'sqlite',
    available: true,
    message: 'SQLite (Fallback)',
  };
}

/**
 * Gibt den aktuellen Datenbank-Typ zurück
 */
export function getCurrentDbType(): DbType {
  if (cachedDbType) return cachedDbType;
  
  // Quick check ohne async
  if (process.env.USE_SQLITE === 'true') return 'sqlite';
  if (process.env.DB_HOST && process.env.DB_DATABASE) return 'postgres';
  
  return 'sqlite';
}

/**
 * Query-Funktion die automatisch die richtige DB nutzt
 */
export async function query(
  sql: string,
  params?: any[]
): Promise<{ data: any[] | null; error: string | null }> {
  const dbInfo = await detectDatabase();
  
  if (dbInfo.type === 'postgres') {
    const { query: pgQuery } = await import('./db-postgres');
    return pgQuery(sql, params);
  } else {
    const { queryDb } = await import('./db-sqlite');
    return queryDb(sql, params || []);
  }
}
