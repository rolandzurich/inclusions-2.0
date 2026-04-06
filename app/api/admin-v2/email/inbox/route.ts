/**
 * GET /api/admin-v2/email/inbox
 * Holt E-Mails aus der DB mit Filtern und Paginierung.
 * 
 * Query-Params:
 * - account: Filter nach Account (info@, reto@, roland@)
 * - classification: Filter nach KI-Klassifikation
 * - urgency: Filter nach Dringlichkeit
 * - status: "unread", "unprocessed", "analyzed", "all" (default: all)
 * - search: Volltextsuche in Betreff/Absender
 * - limit: Max. Ergebnisse (default: 50)
 * - offset: Offset für Paginierung
 */
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db-postgres';

function buildDemoInboxResponse(limit: number, offset: number) {
  const emails = [
    {
      id: 'demo-email-1',
      message_id: 'demo-1',
      account: 'info@inclusions.zone',
      from_email: 'partners@beispiel.ch',
      from_name: 'Lea Sandoz',
      subject: 'Partnerschaftsanfrage 2026',
      received_at: new Date().toISOString(),
      ai_status: 'analyzed',
      ai_summary: 'Interesse an einer Partnerschaft mit konkretem Austauschvorschlag.',
      ai_classification: 'partnership',
      ai_urgency: 'high',
      ai_sentiment: 'positiv',
      is_processed: false,
      is_read: false,
      has_attachments: false,
      pending_actions: 2,
    },
    {
      id: 'demo-email-2',
      message_id: 'demo-2',
      account: 'reto@inclusions.zone',
      from_email: 'booking@agentur.ch',
      from_name: 'Max Keller',
      subject: 'DJ Booking Anfrage April',
      received_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      ai_status: 'analyzed',
      ai_summary: 'Konkrete Booking-Anfrage mit Budget und Terminfenster.',
      ai_classification: 'booking',
      ai_urgency: 'medium',
      ai_sentiment: 'neutral',
      is_processed: false,
      is_read: true,
      has_attachments: true,
      pending_actions: 1,
    },
  ];

  return {
    emails: emails.slice(offset, offset + limit),
    total: emails.length,
    stats: {
      total: emails.length,
      unread: emails.filter((e) => !e.is_read).length,
      pending_analysis: emails.filter((e) => e.ai_status === 'pending').length,
      urgent: emails.filter((e) => ['high', 'critical'].includes(e.ai_urgency)).length,
      sponsoring: emails.filter((e) => e.ai_classification === 'sponsoring').length,
      booking: emails.filter((e) => e.ai_classification === 'booking').length,
      partnership: emails.filter((e) => e.ai_classification === 'partnership').length,
      media: emails.filter((e) => e.ai_classification === 'media').length,
    },
    limit,
    offset,
    demo: true,
    message: 'KI-Hub Demo-Modus aktiv (kein DB/IMAP).',
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const account = searchParams.get('account');
    const classification = searchParams.get('classification');
    const urgency = searchParams.get('urgency');
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Query dynamisch aufbauen
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIdx = 1;
    
    if (account) {
      conditions.push(`account = $${paramIdx++}`);
      params.push(account);
    }
    
    if (classification) {
      conditions.push(`ai_classification = $${paramIdx++}`);
      params.push(classification);
    }
    
    if (urgency) {
      conditions.push(`ai_urgency = $${paramIdx++}`);
      params.push(urgency);
    }
    
    if (status === 'unread') {
      conditions.push(`is_read = false`);
    } else if (status === 'unprocessed') {
      conditions.push(`is_processed = false AND ai_status = 'analyzed'`);
    } else if (status === 'analyzed') {
      conditions.push(`ai_status = 'analyzed'`);
    } else if (status === 'pending') {
      conditions.push(`ai_status = 'pending'`);
    }
    
    if (search) {
      conditions.push(`(subject ILIKE $${paramIdx} OR from_name ILIKE $${paramIdx} OR from_email ILIKE $${paramIdx})`);
      params.push(`%${search}%`);
      paramIdx++;
    }
    
    // Archivierte standardmässig ausblenden
    conditions.push(`is_archived = false`);
    
    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    // E-Mails laden
    const emailsResult = await query(`
      SELECT 
        id, message_id, account, from_email, from_name, subject,
        received_at, ai_status, ai_summary, ai_classification, ai_urgency, ai_sentiment,
        is_processed, is_read, has_attachments,
        (SELECT COUNT(*) FROM email_actions WHERE email_id = email_messages.id AND status = 'suggested') as pending_actions
      FROM email_messages
      ${where}
      ORDER BY received_at DESC
      LIMIT $${paramIdx++} OFFSET $${paramIdx++}
    `, [...params, limit, offset]);
    if (emailsResult.error) {
      if (process.env.KI_HUB_DEMO === 'true') {
        return NextResponse.json(buildDemoInboxResponse(limit, offset));
      }
      return NextResponse.json({ error: emailsResult.error }, { status: 500 });
    }
    
    // Gesamtanzahl für Paginierung
    const countResult = await query(`
      SELECT COUNT(*) as total FROM email_messages ${where}
    `, params);
    if (countResult.error) {
      if (process.env.KI_HUB_DEMO === 'true') {
        return NextResponse.json(buildDemoInboxResponse(limit, offset));
      }
      return NextResponse.json({ error: countResult.error }, { status: 500 });
    }
    
    // Stats
    const statsResult = await query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE is_read = false) as unread,
        COUNT(*) FILTER (WHERE ai_status = 'pending') as pending_analysis,
        COUNT(*) FILTER (WHERE ai_urgency IN ('high', 'critical')) as urgent,
        COUNT(*) FILTER (WHERE ai_classification = 'sponsoring') as sponsoring,
        COUNT(*) FILTER (WHERE ai_classification = 'booking') as booking,
        COUNT(*) FILTER (WHERE ai_classification = 'partnership') as partnership,
        COUNT(*) FILTER (WHERE ai_classification = 'media') as media
      FROM email_messages
      WHERE is_archived = false
    `);
    if (statsResult.error) {
      if (process.env.KI_HUB_DEMO === 'true') {
        return NextResponse.json(buildDemoInboxResponse(limit, offset));
      }
      return NextResponse.json({ error: statsResult.error }, { status: 500 });
    }
    
    return NextResponse.json({
      emails: emailsResult.data || [],
      total: parseInt(countResult.data?.[0]?.total || '0'),
      stats: statsResult.data?.[0] || {},
      limit,
      offset,
    });
  } catch (err: any) {
    if (process.env.KI_HUB_DEMO === 'true') {
      const { searchParams } = new URL(request.url);
      const limit = parseInt(searchParams.get('limit') || '50');
      const offset = parseInt(searchParams.get('offset') || '0');
      return NextResponse.json(buildDemoInboxResponse(limit, offset));
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
