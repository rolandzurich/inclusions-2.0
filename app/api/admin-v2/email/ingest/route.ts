/**
 * POST /api/admin-v2/email/ingest
 * Ruft E-Mails von allen IMAP-Accounts ab und speichert sie.
 * 
 * Query-Params:
 * - days: Anzahl Tage zurück (default: 7)
 * - account: Nur diesen Account abrufen (optional)
 */
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { ingestAllAccounts, ingestSingleAccount } from '@/lib/email-ingestion';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');
    const account = searchParams.get('account');
    
    if (account) {
      const result = await ingestSingleAccount(account, days);
      return NextResponse.json({
        success: true,
        message: `${result.saved} neue E-Mails von ${account}`,
        results: [result],
      });
    }
    
    const results = await ingestAllAccounts(days);
    const totalNew = results.reduce((sum, r) => sum + r.saved, 0);
    const hasErrors = results.some(r => r.error);
    
    return NextResponse.json({
      success: !hasErrors,
      message: `${totalNew} neue E-Mails von ${results.length} Accounts`,
      results,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
