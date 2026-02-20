/**
 * PostgreSQL Database Client
 * Für Admin-V2 CRM & OS
 */

import { Pool, QueryResult } from 'pg';

let pool: Pool | null = null;

/**
 * Holt oder erstellt den PostgreSQL Connection Pool
 */
export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_DATABASE,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      max: 5,
      idleTimeoutMillis: 60000,
      connectionTimeoutMillis: 30000,
      statement_timeout: 60000,
    });

    console.log('✅ PostgreSQL Pool erstellt:', {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_DATABASE,
    });
  }

  return pool;
}

/**
 * Führt eine SQL-Query aus
 */
export async function query(
  text: string,
  params?: any[]
): Promise<{ data: any[] | null; error: string | null }> {
  try {
    const pool = getPool();
    const result: QueryResult = await pool.query(text, params);
    return { data: result.rows, error: null };
  } catch (error: any) {
    console.error('❌ PostgreSQL Query Fehler:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Führt mehrere SQL-Befehle aus (z.B. für Schema-Init)
 */
export async function executeMultiple(
  sql: string
): Promise<{ success: boolean; error: string | null; results: any[] }> {
  const pool = getPool();
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Split SQL in einzelne Statements (einfache Methode)
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    const results = [];
    
    for (const statement of statements) {
      try {
        const result = await client.query(statement);
        results.push({
          success: true,
          statement: statement.substring(0, 100) + '...',
          rowCount: result.rowCount,
        });
      } catch (error: any) {
        // Manche Fehler sind OK (z.B. "already exists")
        if (
          error.message.includes('already exists') ||
          error.message.includes('does not exist')
        ) {
          results.push({
            success: true,
            statement: statement.substring(0, 100) + '...',
            warning: error.message,
          });
        } else {
          throw error;
        }
      }
    }
    
    await client.query('COMMIT');
    
    return {
      success: true,
      error: null,
      results,
    };
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('❌ Multi-Query Fehler:', error);
    return {
      success: false,
      error: error.message,
      results: [],
    };
  } finally {
    client.release();
  }
}

/**
 * Testet die Datenbankverbindung
 */
export async function testConnection(): Promise<{
  success: boolean;
  error: string | null;
  version?: string;
}> {
  try {
    const pool = getPool();
    const result = await pool.query('SELECT version()');
    return {
      success: true,
      error: null,
      version: result.rows[0].version,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Listet alle Tabellen auf
 */
export async function listTables(): Promise<{
  success: boolean;
  tables: string[];
  error: string | null;
}> {
  try {
    const pool = getPool();
    const result = await pool.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);
    return {
      success: true,
      tables: result.rows.map(r => r.tablename),
      error: null,
    };
  } catch (error: any) {
    return {
      success: false,
      tables: [],
      error: error.message,
    };
  }
}
