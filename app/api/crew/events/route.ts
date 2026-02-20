/**
 * GET /api/crew/events → Alle veröffentlichten Events (für Crew-Kalender)
 */
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db-postgres';

export async function GET() {
  try {
    const result = await query(`
      SELECT 
        e.id, e.name, e.description, e.start_at, e.end_at,
        e.location_name, e.location_address, e.location_city,
        e.max_attendees, e.status, e.image_url,
        COUNT(DISTINCT r.id) as rsvp_count,
        COUNT(DISTINCT r.id) FILTER (WHERE r.status = 'yes') as confirmed_count
      FROM events_v2 e
      LEFT JOIN event_rsvps r ON e.id = r.event_id
      WHERE e.status IN ('published', 'draft')
      GROUP BY e.id
      ORDER BY e.start_at ASC
    `);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      events: result.data || [],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
