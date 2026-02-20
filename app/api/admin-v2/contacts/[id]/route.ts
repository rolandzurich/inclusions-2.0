export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db-postgres';

// GET - Einzelnen Kontakt abrufen
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const sql = `
      SELECT 
        c.*,
        co.name as company_name
      FROM contacts c
      LEFT JOIN companies co ON c.company_id = co.id
      WHERE c.id = $1
    `;

    const result = await query(sql, [params.id]);

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    if (!result.data || result.data.length === 0) {
      return NextResponse.json(
        { error: 'Kontakt nicht gefunden' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      contact: result.data[0],
    });
  } catch (error: any) {
    console.error('GET /api/admin-v2/contacts/[id] error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Kontakt aktualisieren
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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
      country,
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

    // E-Mail validieren
    if (email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return NextResponse.json(
        { error: 'Ungültige E-Mail-Adresse' },
        { status: 400 }
      );
    }

    // Schweizer PLZ validieren
    if (postal_code && !postal_code.match(/^\d{4}$/)) {
      return NextResponse.json(
        { error: 'Ungültige Postleitzahl (muss 4 Ziffern sein)' },
        { status: 400 }
      );
    }

    const sql = `
      UPDATE contacts SET
        first_name = $1,
        last_name = $2,
        email = $3,
        phone = $4,
        role = $5,
        company_id = $6,
        address_line1 = $7,
        address_line2 = $8,
        postal_code = $9,
        city = $10,
        country = $11,
        notes = $12,
        tags = $13,
        updated_at = NOW()
      WHERE id = $14
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
      country || 'CH',
      notes || null,
      tags || null,
      params.id,
    ]);

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    if (!result.data || result.data.length === 0) {
      return NextResponse.json(
        { error: 'Kontakt nicht gefunden' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Kontakt erfolgreich aktualisiert',
      contact: result.data[0],
    });
  } catch (error: any) {
    console.error('PUT /api/admin-v2/contacts/[id] error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Kontakt löschen
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const sql = `DELETE FROM contacts WHERE id = $1 RETURNING *`;
    const result = await query(sql, [params.id]);

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    if (!result.data || result.data.length === 0) {
      return NextResponse.json(
        { error: 'Kontakt nicht gefunden' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Kontakt erfolgreich gelöscht',
    });
  } catch (error: any) {
    console.error('DELETE /api/admin-v2/contacts/[id] error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
