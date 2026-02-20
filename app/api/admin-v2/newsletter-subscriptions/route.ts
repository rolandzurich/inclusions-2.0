export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db-postgres';

// GET - Alle Newsletter-Subscriptions
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';

    let sql = `
      SELECT
        n.*,
        c.first_name, c.last_name, c.email, c.phone,
        c.has_disability
      FROM newsletter_subscriptions n
      JOIN contacts c ON n.contact_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status) {
      sql += ` AND n.status = $${params.length + 1}`;
      params.push(status);
    }

    if (search) {
      sql += ` AND (
        c.first_name ILIKE $${params.length + 1} OR
        c.last_name ILIKE $${params.length + 1} OR
        c.email ILIKE $${params.length + 1}
      )`;
      params.push(`%${search}%`);
    }

    sql += ` ORDER BY n.created_at DESC`;

    const result = await query(sql, params);

    const countResult = await query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_count,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
        COUNT(*) FILTER (WHERE status = 'unsubscribed') as unsubscribed_count,
        COUNT(*) as total_count
      FROM newsletter_subscriptions
    `);

    return NextResponse.json({
      success: true,
      subscriptions: result.data || [],
      count: result.data?.length || 0,
      stats: countResult.data?.[0] || {},
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
