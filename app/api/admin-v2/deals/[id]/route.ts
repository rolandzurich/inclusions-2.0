export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db-postgres';

async function resolveDealRelation(
  contact_id?: string | null,
  company_id?: string | null
): Promise<{
  error: string | null;
  contactId: string | null;
  companyId: string | null;
}> {
  const contactId = contact_id?.trim() || null;
  let companyId = company_id?.trim() || null;

  if (!contactId && !companyId) {
    return {
      error: 'Ein Deal braucht mindestens einen Kontakt oder ein Unternehmen',
      contactId: null,
      companyId: null,
    };
  }

  if (contactId) {
    const contactResult = await query(
      `SELECT id, company_id FROM contacts WHERE id = $1 LIMIT 1`,
      [contactId]
    );
    if (contactResult.error) {
      return { error: contactResult.error, contactId: null, companyId: null };
    }
    if (!contactResult.data || contactResult.data.length === 0) {
      return { error: 'Kontakt nicht gefunden', contactId: null, companyId: null };
    }

    const contactCompanyId: string | null = contactResult.data[0].company_id || null;
    if (contactCompanyId) {
      if (companyId && companyId !== contactCompanyId) {
        return {
          error: 'Kontakt gehört zu einem anderen Unternehmen als im Deal ausgewählt',
          contactId: null,
          companyId: null,
        };
      }
      if (!companyId) companyId = contactCompanyId;
    }
  }

  if (companyId) {
    const companyResult = await query(
      `SELECT id FROM companies WHERE id = $1 LIMIT 1`,
      [companyId]
    );
    if (companyResult.error) {
      return { error: companyResult.error, contactId: null, companyId: null };
    }
    if (!companyResult.data || companyResult.data.length === 0) {
      return { error: 'Unternehmen nicht gefunden', contactId: null, companyId: null };
    }
  }

  return { error: null, contactId, companyId };
}

// GET - Einzelner Deal
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const sql = `
      SELECT 
        d.*,
        CONCAT(co.first_name, ' ', co.last_name) as contact_name,
        comp.name as company_name
      FROM deals d
      LEFT JOIN contacts co ON d.contact_id = co.id
      LEFT JOIN companies comp ON d.company_id = comp.id
      WHERE d.id = $1
    `;

    const result = await query(sql, [params.id]);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    if (!result.data || result.data.length === 0) {
      return NextResponse.json(
        { error: 'Deal nicht gefunden' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      deal: result.data[0],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Deal aktualisieren
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      contact_id,
      company_id,
      amount_chf,
      status,
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

    const relation = await resolveDealRelation(contact_id, company_id);
    if (relation.error) {
      return NextResponse.json({ error: relation.error }, { status: 400 });
    }

    const sql = `
      UPDATE deals SET
        title = $1,
        description = $2,
        contact_id = $3,
        company_id = $4,
        amount_chf = $5,
        status = $6,
        expected_close_date = $7,
        notes = $8,
        updated_at = NOW()
      WHERE id = $9
      RETURNING *
    `;

    const result = await query(sql, [
      title,
      description || null,
      relation.contactId,
      relation.companyId,
      amount_chf || 0,
      status || 'lead',
      expected_close_date || null,
      notes || null,
      params.id,
    ]);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    if (!result.data || result.data.length === 0) {
      return NextResponse.json(
        { error: 'Deal nicht gefunden' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Deal erfolgreich aktualisiert',
      deal: result.data[0],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Deal löschen
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const sql = `DELETE FROM deals WHERE id = $1 RETURNING *`;
    const result = await query(sql, [params.id]);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    if (!result.data || result.data.length === 0) {
      return NextResponse.json(
        { error: 'Deal nicht gefunden' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Deal erfolgreich gelöscht',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
