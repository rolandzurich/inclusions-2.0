/**
 * GET /api/admin-v2/email/test-connection
 * Testet die IMAP-Verbindung zu allen konfigurierten Accounts.
 */
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { testConnection } from '@/lib/email-ingestion';

export async function GET() {
  try {
    const results = await testConnection();
    
    const allOk = results.every(r => r.status === 'ok');
    
    return NextResponse.json({
      success: allOk,
      message: allOk 
        ? `Alle ${results.length} IMAP-Verbindungen erfolgreich` 
        : 'Einige Verbindungen fehlgeschlagen',
      accounts: results,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
