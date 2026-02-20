/**
 * POST /api/crew/events/:id/rsvp → RSVP für ein Event (Crew-Member)
 * GET  /api/crew/events/:id/rsvp → Eigene RSVP + Event-Details
 */
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db-postgres';

// GET – Eigene RSVP und Event-RSVPs anzeigen
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userEmail = request.headers.get('x-user-email') || '';

    // Event mit RSVP-Zusammenfassung
    const eventResult = await query(`
      SELECT 
        e.*,
        COUNT(DISTINCT r.id) as rsvp_count,
        COUNT(DISTINCT r.id) FILTER (WHERE r.status = 'yes') as confirmed_count
      FROM events_v2 e
      LEFT JOIN event_rsvps r ON e.id = r.event_id
      WHERE e.id = $1
      GROUP BY e.id
    `, [params.id]);

    if (!eventResult.data?.length) {
      return NextResponse.json({ error: 'Event nicht gefunden' }, { status: 404 });
    }

    // Eigene RSVP
    const myRsvp = await query(
      `SELECT * FROM event_rsvps WHERE event_id = $1 AND user_email = $2`,
      [params.id, userEmail]
    );

    // Alle RSVPs (nur Namen + Status, keine E-Mails für Privacy)
    const allRsvps = await query(
      `SELECT user_name, status, created_at 
       FROM event_rsvps 
       WHERE event_id = $1 AND status IN ('yes', 'maybe', 'no')
       ORDER BY 
         CASE status WHEN 'yes' THEN 0 WHEN 'maybe' THEN 1 WHEN 'no' THEN 2 END,
         created_at ASC`,
      [params.id]
    );

    const rsvps = allRsvps.data || [];

    return NextResponse.json({
      success: true,
      event: eventResult.data[0],
      my_rsvp: myRsvp.data?.[0] || null,
      confirmed: rsvps.filter((r: any) => r.status === 'yes'),
      maybe: rsvps.filter((r: any) => r.status === 'maybe'),
      declined: rsvps.filter((r: any) => r.status === 'no'),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST – RSVP abgeben/aktualisieren
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userEmail = request.headers.get('x-user-email') || '';
    const userName = request.headers.get('x-user-name') || '';
    const body = await request.json();
    const { status } = body; // 'yes' | 'no' | 'maybe'

    if (!['yes', 'no', 'maybe'].includes(status)) {
      return NextResponse.json(
        { error: 'Status muss yes, no oder maybe sein' },
        { status: 400 }
      );
    }

    if (!userEmail) {
      return NextResponse.json(
        { error: 'User nicht identifiziert' },
        { status: 401 }
      );
    }

    // Upsert: Bestehende RSVP aktualisieren oder neue erstellen
    const result = await query(`
      INSERT INTO event_rsvps (event_id, user_email, user_name, status)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (event_id, user_email) 
      DO UPDATE SET status = EXCLUDED.status, user_name = EXCLUDED.user_name
      RETURNING *
    `, [params.id, userEmail, userName || userEmail.split('@')[0], status]);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    const statusLabel = status === 'yes' ? 'Zugesagt' : status === 'no' ? 'Abgesagt' : 'Vielleicht';

    return NextResponse.json({
      success: true,
      message: `${statusLabel}!`,
      rsvp: result.data?.[0],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
