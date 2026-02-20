export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db-postgres';

// GET - Einzelnes Unternehmen
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const sql = `
      SELECT 
        c.*,
        COUNT(DISTINCT co.id) as contact_count
      FROM companies c
      LEFT JOIN contacts co ON co.company_id = c.id
      WHERE c.id = $1
      GROUP BY c.id
    `;

    const result = await query(sql, [params.id]);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    if (!result.data || result.data.length === 0) {
      return NextResponse.json(
        { error: 'Unternehmen nicht gefunden' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      company: result.data[0],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Unternehmen aktualisieren
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const {
      name,
      legal_name,
      uid,
      vat_number,
      email,
      phone,
      website,
      address_line1,
      address_line2,
      postal_code,
      city,
      country,
      notes,
      tags,
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Firmenname ist erforderlich' },
        { status: 400 }
      );
    }

    // UID validieren
    if (uid && !uid.match(/^CHE-\d{3}\.\d{3}\.\d{3}$/)) {
      return NextResponse.json(
        { error: 'Ungültige UID (Format: CHE-XXX.XXX.XXX)' },
        { status: 400 }
      );
    }

    // PLZ validieren
    if (postal_code && !postal_code.match(/^\d{4}$/)) {
      return NextResponse.json(
        { error: 'Ungültige Postleitzahl (muss 4 Ziffern sein)' },
        { status: 400 }
      );
    }

    const sql = `
      UPDATE companies SET
        name = $1,
        legal_name = $2,
        uid = $3,
        vat_number = $4,
        email = $5,
        phone = $6,
        website = $7,
        address_line1 = $8,
        address_line2 = $9,
        postal_code = $10,
        city = $11,
        country = $12,
        notes = $13,
        tags = $14,
        updated_at = NOW()
      WHERE id = $15
      RETURNING *
    `;

    const result = await query(sql, [
      name,
      legal_name || null,
      uid || null,
      vat_number || null,
      email || null,
      phone || null,
      website || null,
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
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    if (!result.data || result.data.length === 0) {
      return NextResponse.json(
        { error: 'Unternehmen nicht gefunden' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Unternehmen erfolgreich aktualisiert',
      company: result.data[0],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Unternehmen löschen
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const sql = `DELETE FROM companies WHERE id = $1 RETURNING *`;
    const result = await query(sql, [params.id]);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    if (!result.data || result.data.length === 0) {
      return NextResponse.json(
        { error: 'Unternehmen nicht gefunden' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Unternehmen erfolgreich gelöscht',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
