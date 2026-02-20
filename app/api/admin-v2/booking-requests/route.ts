export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db-postgres';

// GET - Alle Booking-Anfragen
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const bookingType = searchParams.get('booking_type') || '';
    const search = searchParams.get('search') || '';

    let sql = `
      SELECT
        b.*,
        c.first_name, c.last_name, c.email, c.phone
      FROM booking_requests b
      JOIN contacts c ON b.contact_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status) {
      sql += ` AND b.status = $${params.length + 1}`;
      params.push(status);
    }

    if (bookingType) {
      sql += ` AND b.booking_type = $${params.length + 1}`;
      params.push(bookingType);
    }

    if (search) {
      sql += ` AND (
        c.first_name ILIKE $${params.length + 1} OR
        c.last_name ILIKE $${params.length + 1} OR
        c.email ILIKE $${params.length + 1} OR
        b.booking_item ILIKE $${params.length + 1}
      )`;
      params.push(`%${search}%`);
    }

    sql += ` ORDER BY b.created_at DESC`;

    const result = await query(sql, params);

    const countResult = await query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'new') as new_count,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_count,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_count,
        COUNT(*) as total_count
      FROM booking_requests
    `);

    return NextResponse.json({
      success: true,
      requests: result.data || [],
      count: result.data?.length || 0,
      stats: countResult.data?.[0] || {},
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
