export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { executeMultiple, testConnection, listTables } from '@/lib/db-postgres';

export async function POST() {
  try {
    console.log('🚀 Starte Datenbank-Initialisierung...');

    // 1. Verbindung testen
    console.log('1️⃣ Teste Verbindung...');
    const connectionTest = await testConnection();
    if (!connectionTest.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Datenbankverbindung fehlgeschlagen: ${connectionTest.error}`,
          step: 'connection',
        },
        { status: 500 }
      );
    }
    console.log('✅ Verbindung OK:', connectionTest.version);

    // 2. Schema-Datei lesen
    console.log('2️⃣ Lese Schema-Datei...');
    const schemaPath = join(process.cwd(), 'backend', 'schema_admin_v2_standalone.sql');
    const schemaSql = await readFile(schemaPath, 'utf-8');
    console.log(`✅ Schema gelesen (${schemaSql.length} Zeichen)`);

    // 3. Schema ausführen
    console.log('3️⃣ Führe Schema aus...');
    const result = await executeMultiple(schemaSql);
    
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Schema-Ausführung fehlgeschlagen: ${result.error}`,
          step: 'schema_execution',
        },
        { status: 500 }
      );
    }
    console.log(`✅ Schema ausgeführt (${result.results.length} Statements)`);

    // 4. Tabellen auflisten
    console.log('4️⃣ Liste Tabellen auf...');
    const tablesResult = await listTables();
    if (!tablesResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Tabellen-Abfrage fehlgeschlagen: ${tablesResult.error}`,
          step: 'list_tables',
        },
        { status: 500 }
      );
    }
    console.log('✅ Tabellen gefunden:', tablesResult.tables);

    return NextResponse.json({
      success: true,
      message: 'Datenbank erfolgreich initialisiert! 🎉',
      tables: tablesResult.tables,
      executedStatements: result.results.length,
      details: {
        connection: connectionTest.version,
        tables: tablesResult.tables,
        statements: result.results,
      },
    });
  } catch (error: any) {
    console.error('❌ Initialisierungs-Fehler:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
        step: 'unknown',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Status-Check: Verbindung + Tabellen
    const connectionTest = await testConnection();
    const tablesResult = await listTables();

    return NextResponse.json({
      connection: connectionTest,
      tables: tablesResult,
      ready: connectionTest.success && tablesResult.tables.length > 0,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
