/**
 * GET /api/admin-v2/email/actions
 * Holt vorgeschlagene Aktionen (optional gefiltert).
 */
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db-postgres';

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
    
    return NextResponse.json({
      actions: result.data || [],
      total: (result.data || []).length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
