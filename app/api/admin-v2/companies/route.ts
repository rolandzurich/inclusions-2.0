export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db-postgres';
import {
  createCompanyLocal,
  listCompaniesLocal,
} from '@/lib/crm-local-store';

const ALLOW_LOCAL_FALLBACK =
  process.env.NODE_ENV !== 'production' &&
  process.env.CRM_LOCAL_FALLBACK === 'true';

// GET - Alle Unternehmen
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    let sql = `
      SELECT 
        c.*,
        COUNT(DISTINCT co.id) as contact_count,
        COALESCE(
          json_agg(
            json_build_object(
              'id', co.id,
              'first_name', co.first_name,
              'last_name', co.last_name,
              'email', co.email,
              'phone', co.phone,
              'tags', co.tags
            )
          ) FILTER (WHERE co.id IS NOT NULL), '[]'
        ) as contacts
      FROM companies c
      LEFT JOIN contacts co ON co.company_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (search) {
      sql += ` AND (
        c.name ILIKE $${params.length + 1} OR 
        c.uid ILIKE $${params.length + 1} OR 
        c.city ILIKE $${params.length + 1}
      )`;
      params.push(`%${search}%`);
    }

    sql += ` GROUP BY c.id ORDER BY c.created_at DESC`;

    const result = await query(sql, params);

    if (result.error) {
      if (ALLOW_LOCAL_FALLBACK) {
        const companies = await listCompaniesLocal(search);
        return NextResponse.json({
          success: true,
          companies,
          count: companies.length,
          source: 'local-fallback',
        });
      }
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      companies: result.data || [],
      count: result.data?.length || 0,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Neues Unternehmen
export async function POST(request: Request) {
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
      country = 'CH',
      notes,
      tags,
      company_type,
      is_insieme,
      insieme_region,
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Firmenname ist erforderlich' },
        { status: 400 }
      );
    }

    // Schweizer UID validieren (Format: CHE-XXX.XXX.XXX)
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
      INSERT INTO companies (
        name, legal_name, uid, vat_number, email, phone, website,
        address_line1, address_line2, postal_code, city, country,
        notes, tags, company_type, is_insieme, insieme_region
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
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
      country,
      notes || null,
      tags || null,
      company_type || 'other',
      is_insieme || false,
      insieme_region || null,
    ]);

    if (result.error) {
      if (ALLOW_LOCAL_FALLBACK) {
        const localCompany = await createCompanyLocal({
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
        });
        return NextResponse.json({
          success: true,
          message: 'Unternehmen erfolgreich erstellt',
          company: localCompany,
          source: 'local-fallback',
        });
      }
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Unternehmen erfolgreich erstellt',
      company: result.data?.[0],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
