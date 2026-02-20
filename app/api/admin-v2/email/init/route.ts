/**
 * POST /api/admin-v2/email/init
 * Erstellt die E-Mail-Hub Datenbanktabellen.
 */
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db-postgres';
import fs from 'fs/promises';
import path from 'path';

export async function POST() {
  try {
    const schemaPath = path.join(process.cwd(), 'backend', 'schema_email_hub.sql');
    const sql = await fs.readFile(schemaPath, 'utf-8');
    
    // SQL in einzelne Statements aufteilen und ausführen
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    const results: string[] = [];
    for (const stmt of statements) {
      try {
        await query(stmt);
        // Extrahiere den Tabellen-/Indexnamen
        const match = stmt.match(/(?:TABLE|INDEX|TRIGGER|FUNCTION)\s+(?:IF\s+(?:NOT\s+)?EXISTS\s+)?(\S+)/i);
        if (match) results.push(`✅ ${match[1]}`);
      } catch (err: any) {
        results.push(`⚠️ ${err.message.substring(0, 100)}`);
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'E-Mail-Hub Schema erstellt',
      details: results,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
