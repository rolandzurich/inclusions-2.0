// Direkter Datenbankzugriff für lokale Entwicklung (ohne PostgREST)
import { Pool } from 'pg';

let pool: Pool | null = null;

export function getDbPool(): Pool | null {
  if (pool) {
    return pool;
  }

  // Nur für lokale Entwicklung
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  try {
    pool = new Pool({
      host: 'localhost',
      port: 54322,
      database: 'postgres',
      user: 'supabase_admin',
      password: 'your-super-secret-password-change-this-min-32-chars',
      max: 5,
    });
    return pool;
  } catch (error) {
    console.error('Error creating DB pool:', error);
    return null;
  }
}

export async function queryDb<T = any>(
  query: string,
  params?: any[]
): Promise<{ data: T[] | null; error: Error | null }> {
  const dbPool = getDbPool();
  if (!dbPool) {
    return { data: null, error: new Error('Database pool not available') };
  }

  try {
    const result = await dbPool.query(query, params);
    return { data: result.rows, error: null };
  } catch (error) {
    console.error('Database query error:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error(String(error))
    };
  }
}

export async function insertDb(
  table: string,
  data: Record<string, any>
): Promise<{ data: any | null; error: Error | null }> {
  const dbPool = getDbPool();
  if (!dbPool) {
    return { data: null, error: new Error('Database pool not available') };
  }

  try {
    // Filtere null/undefined Werte und bereite Daten vor
    const cleanData: Record<string, any> = {};
    const keys: string[] = [];
    const values: any[] = [];
    
    for (const [key, value] of Object.entries(data)) {
      // Überspringe null/undefined Werte (werden als DEFAULT behandelt)
      if (value === null || value === undefined) {
        continue;
      }
      
      keys.push(key);
      
      // Handle Arrays für PostgreSQL (z.B. interests als TEXT[])
      if (Array.isArray(value)) {
        values.push(value);
      } else if (typeof value === 'string' && value.startsWith('[') && value.endsWith(']')) {
        // Wenn es ein JSON-String ist, parse es
        try {
          values.push(JSON.parse(value));
        } catch {
          values.push(value);
        }
      } else {
        values.push(value);
      }
    }
    
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    const columns = keys.join(', ');
    
    const query = `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`;
    console.log('📝 DB Insert Query:', query.substring(0, 100) + '...');
    console.log('📝 DB Insert Values:', values.length, 'values');
    
    const result = await dbPool.query(query, values);
    console.log('✅ DB Insert erfolgreich:', result.rows[0]?.id);
    return { data: result.rows[0], error: null };
  } catch (error) {
    console.error('❌ Database insert error:', error);
    console.error('❌ Error details:', error instanceof Error ? error.message : String(error));
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error(String(error))
    };
  }
}

