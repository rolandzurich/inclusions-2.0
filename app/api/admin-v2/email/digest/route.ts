/**
 * POST /api/admin-v2/email/digest
 * Sendet den täglichen E-Mail-Digest an Roland und Reto.
 */
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { sendDailyDigest } from '@/lib/email-digest';

export async function POST() {
  try {
    const result = await sendDailyDigest();
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.digestId 
          ? 'Digest versendet' 
          : result.error || 'Kein Digest nötig',
        digestId: result.digestId,
      });
    }
    
    return NextResponse.json({ error: result.error }, { status: 500 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
