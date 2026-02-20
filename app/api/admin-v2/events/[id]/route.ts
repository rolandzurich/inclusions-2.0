export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db-postgres';

// GET - Einzelnes Event mit RSVPs
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const eventSql = `
      SELECT 
        e.*,
        COUNT(DISTINCT r.id) as rsvp_count,
        COUNT(DISTINCT r.id) FILTER (WHERE r.status = 'yes') as confirmed_count
      FROM events_v2 e
      LEFT JOIN event_rsvps r ON e.id = r.event_id
      WHERE e.id = $1
      GROUP BY e.id
    `;

    const rsvpsSql = `
      SELECT 
        r.*,
        r.user_email as email,
        r.user_name as name
      FROM event_rsvps r
      WHERE r.event_id = $1
      ORDER BY r.created_at DESC
    `;

    const [eventResult, rsvpsResult] = await Promise.all([
      query(eventSql, [params.id]),
      query(rsvpsSql, [params.id]),
    ]);

    if (eventResult.error) {
      return NextResponse.json({ error: eventResult.error }, { status: 500 });
    }

    if (!eventResult.data || eventResult.data.length === 0) {
      return NextResponse.json(
        { error: 'Event nicht gefunden' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      event: eventResult.data[0],
      rsvps: rsvpsResult.data || [],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Event aktualisieren
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const {
      name,
      slug,
      description,
      start_at,
      end_at,
      location_name,
      location_address,
      location_city,
      location_postal_code,
      max_attendees,
      rsvp_enabled,
      rsvp_deadline,
      status,
      project_id,
      image_url,
      external_url,
      tags,
    } = body;

    if (!name || !start_at) {
      return NextResponse.json(
        { error: 'Name und Startzeit sind erforderlich' },
        { status: 400 }
      );
    }

    if (end_at && new Date(end_at) <= new Date(start_at)) {
      return NextResponse.json(
        { error: 'Endzeit muss nach Startzeit liegen' },
        { status: 400 }
      );
    }

    const sql = `
      UPDATE events_v2 SET
        name = $1,
        slug = $2,
        description = $3,
        start_at = $4,
        end_at = $5,
        location_name = $6,
        location_address = $7,
        location_city = $8,
        location_postal_code = $9,
        max_attendees = $10,
        rsvp_enabled = $11,
        rsvp_deadline = $12,
        status = $13,
        project_id = $14,
        image_url = $15,
        external_url = $16,
        tags = $17,
        updated_at = NOW()
      WHERE id = $18
      RETURNING *
    `;

    const result = await query(sql, [
      name,
      slug || null,
      description || null,
      start_at,
      end_at || null,
      location_name || null,
      location_address || null,
      location_city || null,
      location_postal_code || null,
      max_attendees || null,
      rsvp_enabled !== undefined ? rsvp_enabled : true,
      rsvp_deadline || null,
      status || 'draft',
      project_id || null,
      image_url || null,
      external_url || null,
      tags || null,
      params.id,
    ]);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    if (!result.data || result.data.length === 0) {
      return NextResponse.json(
        { error: 'Event nicht gefunden' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Event erfolgreich aktualisiert',
      event: result.data[0],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Event löschen
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const sql = `DELETE FROM events_v2 WHERE id = $1 RETURNING *`;
    const result = await query(sql, [params.id]);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    if (!result.data || result.data.length === 0) {
      return NextResponse.json(
        { error: 'Event nicht gefunden' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Event erfolgreich gelöscht',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
