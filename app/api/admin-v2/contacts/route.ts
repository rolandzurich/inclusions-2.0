export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db-postgres';
import {
  createContactLocal,
  listContactsLocal,
} from '@/lib/crm-local-store';

const ALLOW_LOCAL_FALLBACK =
  process.env.NODE_ENV !== 'production' &&
  process.env.CRM_LOCAL_FALLBACK === 'true';

// GET - Alle Kontakte abrufen
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const tag = searchParams.get('tag') || '';

    let sql = `
      SELECT 
        c.*,
        co.name as company_name,
        b.first_name || ' ' || b.last_name as betreuer_name
      FROM contacts c
      LEFT JOIN companies co ON c.company_id = co.id
      LEFT JOIN contacts b ON c.betreuer_id = b.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (search) {
      sql += ` AND (
        c.first_name ILIKE $${params.length + 1} OR 
        c.last_name ILIKE $${params.length + 1} OR 
        c.email ILIKE $${params.length + 1}
      )`;
      params.push(`%${search}%`);
    }

    if (tag) {
      sql += ` AND $${params.length + 1} = ANY(c.tags)`;
      params.push(tag);
    }

    sql += ` ORDER BY c.created_at DESC`;

    const result = await query(sql, params);

    if (result.error) {
      if (ALLOW_LOCAL_FALLBACK) {
        const contacts = await listContactsLocal({ search });
        return NextResponse.json({
          success: true,
          contacts,
          count: contacts.length,
          source: 'local-fallback',
        });
      }
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
      company_id,
      company_name,
      address_line1,
      address_line2,
      postal_code,
      city,
      country = 'CH',
      notes,
      tags,
      categories,
      vip_type,
      betreuer_id,
      party_count,
      party_history,
      last_party_date,
      source_list,
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

    // betreuer_id validieren
    let resolvedBetreuer: string | null = betreuer_id || null;
    if (resolvedBetreuer) {
      const b = await query(`SELECT id FROM contacts WHERE id = $1`, [resolvedBetreuer]);
      if (!b.data?.length) resolvedBetreuer = null;
    }

    const sql = `
      INSERT INTO contacts (
        first_name, last_name, email, phone, company_id,
        address_line1, address_line2, postal_code, city, country,
        notes, tags, categories, vip_type, betreuer_id,
        party_count, party_history, last_party_date,
        source, source_list
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20
      )
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
      country,
      notes || null,
      tags || null,
      categories || null,
      vip_type || null,
      resolvedBetreuer,
      party_count || 0,
      party_history ? JSON.stringify(party_history) : '[]',
      last_party_date || null,
      'manual',
      source_list || null,
    ]);

    if (result.error) {
      if (ALLOW_LOCAL_FALLBACK) {
        const localContact = await createContactLocal({
          first_name,
          last_name,
          email: email || null,
          phone: phone || null,
          company_id: resolvedCompanyId,
          address_line1: address_line1 || null,
          address_line2: address_line2 || null,
          postal_code: postal_code || null,
          city: city || null,
          country,
          notes: notes || null,
          tags: tags || null,
          categories: categories || [],
          source: 'manual',
        });
        return NextResponse.json({
          success: true,
          message: 'Kontakt erfolgreich erstellt',
          contact: localContact,
          source: 'local-fallback',
        });
      }
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
