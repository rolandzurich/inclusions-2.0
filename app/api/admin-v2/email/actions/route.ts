/**
 * GET /api/admin-v2/email/actions
 * Holt vorgeschlagene Aktionen (optional gefiltert).
 */
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db-postgres';

function buildDemoActionsResponse() {
  return {
    actions: [
      {
        id: 'demo-action-1',
        email_id: 'demo-email-1',
        action_type: 'create_company',
        action_data: { name: 'Stiftung Beispiel', reason: 'Organisation als Partner erfassen' },
        status: 'suggested',
        is_research: false,
        email_subject: 'Partnerschaftsanfrage 2026',
        email_from: 'partners@beispiel.ch',
        email_from_name: 'Lea Sandoz',
      },
      {
        id: 'demo-action-2',
        email_id: 'demo-email-1',
        action_type: 'add_note',
        action_data: { reason: 'Follow-up Termin in 48h vorschlagen' },
        status: 'suggested',
        is_research: false,
        email_subject: 'Partnerschaftsanfrage 2026',
        email_from: 'partners@beispiel.ch',
        email_from_name: 'Lea Sandoz',
      },
    ],
    total: 2,
    demo: true,
    message: 'KI-Hub Demo-Modus aktiv (kein DB/IMAP).',
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'suggested';
    const emailId = searchParams.get('email_id');
    
    const conditions: string[] = [];
    const params: any[] = [];
    let idx = 1;
    
    if (status !== 'all') {
      conditions.push(`ea.status = $${idx++}`);
      params.push(status);
    }
    
    if (emailId) {
      conditions.push(`ea.email_id = $${idx++}`);
      params.push(emailId);
    }
    
    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    const result = await query(`
      SELECT 
        ea.*,
        em.subject as email_subject,
        em.from_email as email_from,
        em.from_name as email_from_name,
        em.ai_classification as email_classification,
        em.received_at as email_received_at
      FROM email_actions ea
      JOIN email_messages em ON ea.email_id = em.id
      ${where}
      ORDER BY ea.created_at DESC
      LIMIT 100
    `, params);
    if (result.error) {
      if (process.env.KI_HUB_DEMO === 'true') {
        return NextResponse.json(buildDemoActionsResponse());
      }
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    
    return NextResponse.json({
      actions: result.data || [],
      total: (result.data || []).length,
    });
  } catch (err: any) {
    if (process.env.KI_HUB_DEMO === 'true') {
      return NextResponse.json(buildDemoActionsResponse());
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
