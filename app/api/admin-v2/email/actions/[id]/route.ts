/**
 * POST /api/admin-v2/email/actions/[id]
 * Bestätigt oder lehnt eine vorgeschlagene Aktion ab.
 * 
 * Body: { action: "approve" | "reject" }
 */
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { applyAction, rejectAction } from '@/lib/email-ai';
import { authenticateRequest } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authenticateRequest(request);
    const userEmail = user?.email || 'unknown';
    
    const body = await request.json();
    const { action } = body;
    
    if (action === 'approve') {
      const result = await applyAction(params.id, userEmail);
      if (result.success) {
        return NextResponse.json({
          success: true,
          message: 'Aktion angewendet',
          resultId: result.resultId,
        });
      } else {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
    } else if (action === 'reject') {
      const success = await rejectAction(params.id, userEmail);
      return NextResponse.json({
        success,
        message: success ? 'Aktion abgelehnt' : 'Aktion nicht gefunden',
      });
    } else {
      return NextResponse.json({ error: 'Ungültige Aktion. Verwende "approve" oder "reject".' }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
