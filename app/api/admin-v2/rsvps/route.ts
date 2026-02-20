export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db-postgres';

// GET - RSVPs für ein Event
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event-ID ist erforderlich' },
        { status: 400 }
      );
    }

    const sql = `
      SELECT 
        r.*,
        r.user_email as email,
        r.user_name as name
      FROM event_rsvps r
      WHERE r.event_id = $1
      ORDER BY r.created_at DESC
    `;

    const result = await query(sql, [eventId]);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      rsvps: result.data || [],
      count: result.data?.length || 0,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Zusage/Absage erstellen oder aktualisieren
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { event_id, user_email, user_name, status = 'yes', notes } = body;

    if (!event_id || !user_email) {
      return NextResponse.json(
        { error: 'Event-ID und E-Mail sind erforderlich' },
        { status: 400 }
      );
    }

    // Prüfe ob Event existiert und nicht voll ist
    const eventCheck = await query(
      `
      SELECT 
        e.id,
        e.max_attendees,
        COUNT(r.id) FILTER (WHERE r.status IN ('yes', 'confirmed')) as confirmed_count
      FROM events_v2 e
      LEFT JOIN event_rsvps r ON e.id = r.event_id
      WHERE e.id = $1
      GROUP BY e.id
      `,
      [event_id]
    );

    if (!eventCheck.data || eventCheck.data.length === 0) {
      return NextResponse.json(
        { error: 'Event nicht gefunden' },
        { status: 404 }
      );
    }

    const event = eventCheck.data[0];
    if (
      status === 'yes' &&
      event.max_attendees &&
      event.confirmed_count >= event.max_attendees
    ) {
      return NextResponse.json(
        { error: 'Event ist bereits ausgebucht' },
        { status: 400 }
      );
    }

    // Prüfe ob RSVP bereits existiert
    const existingRsvp = await query(
      `SELECT id FROM event_rsvps WHERE event_id = $1 AND user_email = $2`,
      [event_id, user_email]
    );

    let result;
    if (existingRsvp.data && existingRsvp.data.length > 0) {
      // Update existierendes RSVP
      result = await query(
        `
        UPDATE event_rsvps SET
          status = $1,
          user_name = $2,
          notes = $3,
          updated_at = NOW()
        WHERE event_id = $4 AND user_email = $5
        RETURNING *
        `,
        [status, user_name || null, notes || null, event_id, user_email]
      );
    } else {
      // Neues RSVP erstellen
      result = await query(
        `
        INSERT INTO event_rsvps (event_id, user_email, user_name, status, notes)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
        `,
        [event_id, user_email, user_name || null, status, notes || null]
      );
    }

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    const message =
      status === 'yes'
        ? 'Zusage erfolgreich gespeichert'
        : status === 'no'
        ? 'Absage erfolgreich gespeichert'
        : 'RSVP erfolgreich gespeichert';

    return NextResponse.json({
      success: true,
      message,
      rsvp: result.data?.[0],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
