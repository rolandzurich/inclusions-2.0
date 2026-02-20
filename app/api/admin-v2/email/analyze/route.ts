/**
 * POST /api/admin-v2/email/analyze
 * Startet die KI-Analyse für alle nicht-analysierten E-Mails.
 * 
 * Query-Params:
 * - limit: Max. Anzahl E-Mails (default: 20)
 */
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { analyzeUnprocessedEmails } from '@/lib/email-ai';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    
    const result = await analyzeUnprocessedEmails(limit);
    
    return NextResponse.json({
      success: true,
      message: `${result.analyzed} E-Mails analysiert, ${result.errors} Fehler`,
      ...result,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
