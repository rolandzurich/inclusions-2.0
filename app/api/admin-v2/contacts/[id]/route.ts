export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db-postgres';
import {
  deleteContactLocal,
  getContactLocal,
  updateContactLocal,
} from '@/lib/crm-local-store';

const ALLOW_LOCAL_FALLBACK =
  process.env.NODE_ENV !== 'production' &&
  process.env.CRM_LOCAL_FALLBACK === 'true';

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
      if (ALLOW_LOCAL_FALLBACK) {
        const contact = await getContactLocal(params.id);
        if (!contact) {
          return NextResponse.json(
            { error: 'Kontakt nicht gefunden' },
            { status: 404 }
          );
        }
        return NextResponse.json({
          success: true,
          contact,
          source: 'local-fallback',
        });
      }
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
      company_id,
      company_name,
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

    let resolvedCompanyId: string | null = company_id || null;

    if (!resolvedCompanyId && company_name?.trim()) {
      const normalizedCompanyName = company_name.trim();
      const existingCompany = await query(
        `SELECT id FROM companies WHERE LOWER(name) = LOWER($1) LIMIT 1`,
        [normalizedCompanyName]
      );
      if (existingCompany.error) {
        return NextResponse.json(
          { error: existingCompany.error },
          { status: 500 }
        );
      }

      if (existingCompany.data && existingCompany.data.length > 0) {
        resolvedCompanyId = existingCompany.data[0].id;
      } else {
        const createdCompany = await query(
          `INSERT INTO companies (name) VALUES ($1) RETURNING id`,
          [normalizedCompanyName]
        );
        if (createdCompany.error) {
          return NextResponse.json(
            { error: createdCompany.error },
            { status: 500 }
          );
        }
        resolvedCompanyId = createdCompany.data?.[0]?.id || null;
      }
    }

    if (resolvedCompanyId) {
      const companyResult = await query(
        `SELECT id FROM companies WHERE id = $1 LIMIT 1`,
        [resolvedCompanyId]
      );
      if (companyResult.error) {
        return NextResponse.json(
          { error: companyResult.error },
          { status: 500 }
        );
      }
      if (!companyResult.data || companyResult.data.length === 0) {
        return NextResponse.json(
          { error: 'Unternehmen nicht gefunden' },
          { status: 400 }
        );
      }
    }

    const sql = `
      UPDATE contacts SET
        first_name = $1,
        last_name = $2,
        email = $3,
        phone = $4,
        company_id = $5,
        address_line1 = $6,
        address_line2 = $7,
        postal_code = $8,
        city = $9,
        country = $10,
        notes = $11,
        tags = $12,
        updated_at = NOW()
      WHERE id = $13
      RETURNING *
    `;

    const result = await query(sql, [
      first_name,
      last_name,
      email || null,
      phone || null,
      resolvedCompanyId,
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
      if (ALLOW_LOCAL_FALLBACK) {
        const updated = await updateContactLocal(params.id, {
          first_name,
          last_name,
          email: email || null,
          phone: phone || null,
          company_id: resolvedCompanyId,
          address_line1: address_line1 || null,
          address_line2: address_line2 || null,
          postal_code: postal_code || null,
          city: city || null,
          country: country || 'CH',
          notes: notes || null,
          tags: tags || null,
        });
        if (!updated) {
          return NextResponse.json(
            { error: 'Kontakt nicht gefunden' },
            { status: 404 }
          );
        }
        return NextResponse.json({
          success: true,
          message: 'Kontakt erfolgreich aktualisiert',
          contact: updated,
          source: 'local-fallback',
        });
      }
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
      if (ALLOW_LOCAL_FALLBACK) {
        const deleted = await deleteContactLocal(params.id);
        if (!deleted) {
          return NextResponse.json(
            { error: 'Kontakt nicht gefunden' },
            { status: 404 }
          );
        }
        return NextResponse.json({
          success: true,
          message: 'Kontakt erfolgreich gelöscht',
          source: 'local-fallback',
        });
      }
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
