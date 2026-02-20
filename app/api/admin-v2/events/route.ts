export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db-postgres';

// GET - Alle Events
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from') || '';
    const to = searchParams.get('to') || '';
    const status = searchParams.get('status') || '';

    let sql = `
      SELECT 
        e.*,
        COUNT(DISTINCT r.id) as rsvp_count,
        COUNT(DISTINCT r.id) FILTER (WHERE r.status = 'yes') as confirmed_count
      FROM events_v2 e
      LEFT JOIN event_rsvps r ON e.id = r.event_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (from) {
      sql += ` AND e.start_at >= $${params.length + 1}`;
      params.push(from);
    }

    if (to) {
      sql += ` AND e.start_at <= $${params.length + 1}`;
      params.push(to);
    }

    if (status) {
      sql += ` AND e.status = $${params.length + 1}`;
      params.push(status);
    }

    sql += ` GROUP BY e.id ORDER BY e.start_at ASC`;

    const result = await query(sql, params);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      events: result.data || [],
      count: result.data?.length || 0,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Neues Event
export async function POST(request: Request) {
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
      rsvp_enabled = true,
      rsvp_deadline,
      status = 'draft',
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
      INSERT INTO events_v2 (
        name, slug, description, start_at, end_at, location_name,
        location_address, location_city, location_postal_code,
        max_attendees, rsvp_enabled, rsvp_deadline, status,
        project_id, image_url, external_url, tags
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
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
      rsvp_enabled,
      rsvp_deadline || null,
      status,
      project_id || null,
      image_url || null,
      external_url || null,
      tags || null,
    ]);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Event erfolgreich erstellt',
      event: result.data?.[0],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
