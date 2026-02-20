export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db-postgres';

// GET - Alle VIP-Registrierungen mit Kontakt-Daten
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const arrival = searchParams.get('arrival_time') || '';
    const search = searchParams.get('search') || '';

    let sql = `
      SELECT
        v.*,
        c.first_name, c.last_name, c.email, c.phone,
        c.has_disability, c.has_iv_card, c.special_needs,
        c.address_line1 as address, c.postal_code, c.city,
        cg.first_name as cg_first_name, cg.last_name as cg_last_name,
        cg.email as cg_email, cg.phone as cg_phone
      FROM vip_registrations v
      JOIN contacts c ON v.contact_id = c.id
      LEFT JOIN contacts cg ON v.caregiver_id = cg.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status) {
      sql += ` AND v.status = $${params.length + 1}`;
      params.push(status);
    }

    if (arrival) {
      sql += ` AND v.arrival_time = $${params.length + 1}`;
      params.push(arrival);
    }

    if (search) {
      sql += ` AND (
        c.first_name ILIKE $${params.length + 1} OR
        c.last_name ILIKE $${params.length + 1} OR
        c.email ILIKE $${params.length + 1}
      )`;
      params.push(`%${search}%`);
    }

    sql += ` ORDER BY v.created_at DESC`;

    const result = await query(sql, params);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // Zaehle nach Status
    const countResult = await query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
        COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_count,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_count,
        COUNT(*) as total_count
      FROM vip_registrations
    `);

    return NextResponse.json({
      success: true,
      registrations: result.data || [],
      count: result.data?.length || 0,
      stats: countResult.data?.[0] || {},
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
