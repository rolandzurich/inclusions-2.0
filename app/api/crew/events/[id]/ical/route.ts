/**
 * GET /api/crew/events/:id/ical → iCalendar (.ics) Download für ein Event
 */
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db-postgres';

function formatICalDate(dateStr: string): string {
  const d = new Date(dateStr);
  // Zu UTC-Format: 20260219T180000Z
  const iso = d.toISOString(); // 2026-02-19T18:00:00.000Z
  return iso.replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function escapeICalText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await query(
      `SELECT * FROM events_v2 WHERE id = $1`,
      [params.id]
    );

    if (!result.data?.length) {
      return NextResponse.json({ error: 'Event nicht gefunden' }, { status: 404 });
    }

    const event = result.data[0];
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://inclusions.zone';

    // Fallback: End = Start + 2 Stunden
    const startAt = event.start_at;
    const endAt = event.end_at || new Date(new Date(startAt).getTime() + 2 * 60 * 60 * 1000).toISOString();

    let location = '';
    if (event.location_name) location = event.location_name;
    if (event.location_address) location += (location ? ', ' : '') + event.location_address;
    if (event.location_city) location += (location ? ', ' : '') + event.location_city;

    const description = event.description
      ? escapeICalText(event.description)
      : 'Inclusions Event';

    const ical = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Inclusions//Crew Calendar//DE',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${event.id}@inclusions.zone`,
      `DTSTART:${formatICalDate(startAt)}`,
      `DTEND:${formatICalDate(endAt)}`,
      `DTSTAMP:${formatICalDate(new Date().toISOString())}`,
      `SUMMARY:${escapeICalText(event.name)}`,
      `DESCRIPTION:${description}`,
      location ? `LOCATION:${escapeICalText(location)}` : '',
      `URL:${siteUrl}/crew`,
      `ORGANIZER;CN=Inclusions:mailto:info@inclusions.zone`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].filter(Boolean).join('\r\n');

    const filename = `inclusions-${event.name.replace(/[^a-zA-Z0-9äöüÄÖÜ ]/g, '').replace(/\s+/g, '-').toLowerCase()}.ics`;

    return new NextResponse(ical, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
