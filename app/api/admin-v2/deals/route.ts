export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db-postgres';

// GET - Alle Deals
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';

    let sql = `
      SELECT 
        d.*,
        CONCAT(co.first_name, ' ', co.last_name) as contact_name,
        comp.name as company_name
      FROM deals d
      LEFT JOIN contacts co ON d.contact_id = co.id
      LEFT JOIN companies comp ON d.company_id = comp.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status) {
      sql += ` AND d.status = $${params.length + 1}`;
      params.push(status);
    }

    if (search) {
      sql += ` AND (
        d.title ILIKE $${params.length + 1} OR 
        co.first_name ILIKE $${params.length + 1} OR 
        co.last_name ILIKE $${params.length + 1} OR
        comp.name ILIKE $${params.length + 1}
      )`;
      params.push(`%${search}%`);
    }

    sql += ` ORDER BY d.expected_close_date ASC NULLS LAST, d.created_at DESC`;

    const result = await query(sql, params);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      deals: result.data || [],
      count: result.data?.length || 0,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Neuer Deal
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      contact_id,
      company_id,
      amount_chf,
      status = 'lead',
      expected_close_date,
      notes,
    } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Titel ist erforderlich' },
        { status: 400 }
      );
    }

    if (amount_chf && (isNaN(amount_chf) || amount_chf < 0)) {
      return NextResponse.json(
        { error: 'Ungültiger Betrag' },
        { status: 400 }
      );
    }

    const sql = `
      INSERT INTO deals (
        title, description, contact_id, company_id, amount_chf,
        status, expected_close_date, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const result = await query(sql, [
      title,
      description || null,
      contact_id || null,
      company_id || null,
      amount_chf || 0,
      status,
      expected_close_date || null,
      notes || null,
    ]);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Deal erfolgreich erstellt',
      deal: result.data?.[0],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
