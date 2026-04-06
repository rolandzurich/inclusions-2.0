export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db-postgres';

async function resolveProjectRelation(
  client_id?: string | null,
  primary_contact_id?: string | null
): Promise<{
  error: string | null;
  clientId: string | null;
  primaryContactId: string | null;
}> {
  let clientId = client_id?.trim() || null;
  const primaryContactId = primary_contact_id?.trim() || null;

  if (clientId) {
    const companyResult = await query(`SELECT id FROM companies WHERE id = $1 LIMIT 1`, [clientId]);
    if (companyResult.error) {
      return { error: companyResult.error, clientId: null, primaryContactId: null };
    }
    if (!companyResult.data || companyResult.data.length === 0) {
      return { error: 'Unternehmen nicht gefunden', clientId: null, primaryContactId: null };
    }
  }

  if (primaryContactId) {
    const contactResult = await query(
      `SELECT id, company_id FROM contacts WHERE id = $1 LIMIT 1`,
      [primaryContactId]
    );
    if (contactResult.error) {
      return { error: contactResult.error, clientId: null, primaryContactId: null };
    }
    if (!contactResult.data || contactResult.data.length === 0) {
      return { error: 'Kontakt nicht gefunden', clientId: null, primaryContactId: null };
    }

    const contactCompanyId: string | null = contactResult.data[0].company_id || null;
    if (contactCompanyId) {
      if (clientId && clientId !== contactCompanyId) {
        return {
          error: 'Primärkontakt gehört zu einem anderen Unternehmen als im Projekt ausgewählt',
          clientId: null,
          primaryContactId: null,
        };
      }
      if (!clientId) clientId = contactCompanyId;
    }
  }

  return { error: null, clientId, primaryContactId };
}

// GET - Einzelnes Projekt mit Tasks
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const projectSql = `
      SELECT 
        p.*,
        comp.name as client_name,
        CONCAT(pc.first_name, ' ', pc.last_name) as primary_contact_name,
        COUNT(DISTINCT t.id) as task_count,
        COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'completed') as completed_task_count
      FROM projects p
      LEFT JOIN companies comp ON p.client_id = comp.id
      LEFT JOIN contacts pc ON pc.id::text = p.metadata->>'primary_contact_id'
      LEFT JOIN project_tasks t ON p.id = t.project_id
      WHERE p.id = $1
      GROUP BY p.id, comp.name, pc.first_name, pc.last_name
    `;

    const tasksSql = `
      SELECT t.*
      FROM project_tasks t
      WHERE t.project_id = $1
      ORDER BY 
        CASE t.priority
          WHEN 'urgent' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          WHEN 'low' THEN 4
        END,
        t.due_date ASC NULLS LAST,
        t.created_at DESC
    `;

    const [projectResult, tasksResult] = await Promise.all([
      query(projectSql, [params.id]),
      query(tasksSql, [params.id]),
    ]);

    if (projectResult.error) {
      return NextResponse.json({ error: projectResult.error }, { status: 500 });
    }

    if (!projectResult.data || projectResult.data.length === 0) {
      return NextResponse.json(
        { error: 'Projekt nicht gefunden' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      project: projectResult.data[0],
      tasks: tasksResult.data || [],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Projekt aktualisieren
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      status,
      start_date,
      end_date,
      budget_chf,
      client_id,
      primary_contact_id,
      tags,
      metadata,
    } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Titel ist erforderlich' },
        { status: 400 }
      );
    }

    if (start_date && end_date && new Date(end_date) <= new Date(start_date)) {
      return NextResponse.json(
        { error: 'Enddatum muss nach Startdatum liegen' },
        { status: 400 }
      );
    }

    if (budget_chf && (isNaN(budget_chf) || budget_chf < 0)) {
      return NextResponse.json(
        { error: 'Budget muss positiv sein' },
        { status: 400 }
      );
    }

    const relation = await resolveProjectRelation(client_id, primary_contact_id);
    if (relation.error) {
      return NextResponse.json({ error: relation.error }, { status: 400 });
    }

    const hasMetadataObject =
      metadata && typeof metadata === 'object' && !Array.isArray(metadata);
    const metadataInput: Record<string, unknown> = hasMetadataObject ? { ...metadata } : {};

    let metadataParam: string | null = null;
    if (hasMetadataObject || primary_contact_id !== undefined) {
      if (primary_contact_id !== undefined) {
        metadataInput.primary_contact_id = relation.primaryContactId;
      }
      metadataParam = JSON.stringify(metadataInput);
    }

    const sql = `
      UPDATE projects SET
        title = $1,
        description = $2,
        status = $3,
        start_date = $4,
        end_date = $5,
        budget_chf = $6,
        client_id = $7,
        tags = $8,
        metadata = CASE
          WHEN $9::jsonb IS NULL THEN metadata
          ELSE $9::jsonb
        END,
        updated_at = NOW()
      WHERE id = $10
      RETURNING *
    `;

    const result = await query(sql, [
      title,
      description || null,
      status || 'planning',
      start_date || null,
      end_date || null,
      budget_chf || null,
      relation.clientId,
      tags || null,
      metadataParam,
      params.id,
    ]);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    if (!result.data || result.data.length === 0) {
      return NextResponse.json(
        { error: 'Projekt nicht gefunden' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Projekt erfolgreich aktualisiert',
      project: result.data[0],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Projekt löschen
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const sql = `DELETE FROM projects WHERE id = $1 RETURNING *`;
    const result = await query(sql, [params.id]);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    if (!result.data || result.data.length === 0) {
      return NextResponse.json(
        { error: 'Projekt nicht gefunden' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Projekt erfolgreich gelöscht',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
