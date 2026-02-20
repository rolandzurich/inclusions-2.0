export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db-postgres';

// GET - Alle Kontakte abrufen
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const category = searchParams.get('category') || '';

    let sql = `
      SELECT 
        c.*,
        co.name as company_name
      FROM contacts c
      LEFT JOIN companies co ON c.company_id = co.id
      WHERE 1=1
    `;
    const params: any[] = [];

    // Suche
    if (search) {
      sql += ` AND (
        c.first_name ILIKE $${params.length + 1} OR 
        c.last_name ILIKE $${params.length + 1} OR 
        c.email ILIKE $${params.length + 1}
      )`;
      params.push(`%${search}%`);
    }

    // Filter nach Rolle
    if (role) {
      sql += ` AND c.role = $${params.length + 1}`;
      params.push(role);
    }

    // Filter nach Kategorie
    if (category) {
      sql += ` AND $${params.length + 1} = ANY(c.categories)`;
      params.push(category);
    }

    sql += ` ORDER BY c.created_at DESC`;

    const result = await query(sql, params);

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      contacts: result.data || [],
      count: result.data?.length || 0,
    });
  } catch (error: any) {
    console.error('GET /api/admin-v2/contacts error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// POST - Neuen Kontakt erstellen
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      first_name,
      last_name,
      email,
      phone,
      role,
      company_id,
      address_line1,
      address_line2,
      postal_code,
      city,
      country = 'CH',
      notes,
      tags,
    } = body;

    // Validierung
    if (!first_name || !last_name) {
      return NextResponse.json(
        { error: 'Vorname und Nachname sind erforderlich' },
        { status: 400 }
      );
    }

    // E-Mail validieren (optional aber wenn vorhanden)
    if (email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return NextResponse.json(
        { error: 'Ungültige E-Mail-Adresse' },
        { status: 400 }
      );
    }

    // Schweizer PLZ validieren (4 Ziffern)
    if (postal_code && !postal_code.match(/^\d{4}$/)) {
      return NextResponse.json(
        { error: 'Ungültige Postleitzahl (muss 4 Ziffern sein)' },
        { status: 400 }
      );
    }

    const sql = `
      INSERT INTO contacts (
        first_name, last_name, email, phone, role, company_id,
        address_line1, address_line2, postal_code, city, country,
        notes, tags, source
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `;

    const result = await query(sql, [
      first_name,
      last_name,
      email || null,
      phone || null,
      role || null,
      company_id || null,
      address_line1 || null,
      address_line2 || null,
      postal_code || null,
      city || null,
      country,
      notes || null,
      tags || null,
      'manual',
    ]);

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Kontakt erfolgreich erstellt',
      contact: result.data?.[0],
    });
  } catch (error: any) {
    console.error('POST /api/admin-v2/contacts error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
