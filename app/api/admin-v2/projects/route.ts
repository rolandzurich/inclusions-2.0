export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db-postgres';

// GET - Alle Projekte
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';

    let sql = `
      SELECT 
        p.*,
        comp.name as client_name,
        COUNT(DISTINCT t.id) as task_count,
        COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'completed') as completed_task_count
      FROM projects p
      LEFT JOIN companies comp ON p.client_id = comp.id
      LEFT JOIN project_tasks t ON p.id = t.project_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status) {
      sql += ` AND p.status = $${params.length + 1}`;
      params.push(status);
    }

    if (search) {
      sql += ` AND (
        p.title ILIKE $${params.length + 1} OR 
        p.description ILIKE $${params.length + 1} OR
        comp.name ILIKE $${params.length + 1}
      )`;
      params.push(`%${search}%`);
    }

    sql += ` GROUP BY p.id, comp.name ORDER BY p.created_at DESC`;

    const result = await query(sql, params);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      projects: result.data || [],
      count: result.data?.length || 0,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Neues Projekt
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      status = 'planning',
      start_date,
      end_date,
      budget_chf,
      client_id,
      tags,
      metadata,
    } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Titel ist erforderlich' },
        { status: 400 }
      );
    }

    // Validiere Datum-Logik
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

    const sql = `
      INSERT INTO projects (
        title, description, status, start_date, end_date, budget_chf,
        client_id, tags, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const result = await query(sql, [
      title,
      description || null,
      status,
      start_date || null,
      end_date || null,
      budget_chf || null,
      client_id || null,
      tags || null,
      metadata || null,
    ]);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Projekt erfolgreich erstellt',
      project: result.data?.[0],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
