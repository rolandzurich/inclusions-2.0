export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db-postgres';

// GET - Alle Tasks (mit optionalem project_id Filter)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    const status = searchParams.get('status') || '';
    const priority = searchParams.get('priority') || '';

    let sql = `
      SELECT 
        t.*,
        p.title as project_title
      FROM project_tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (projectId) {
      sql += ` AND t.project_id = $${params.length + 1}`;
      params.push(projectId);
    }

    if (status) {
      sql += ` AND t.status = $${params.length + 1}`;
      params.push(status);
    }

    if (priority) {
      sql += ` AND t.priority = $${params.length + 1}`;
      params.push(priority);
    }

    sql += ` ORDER BY 
      CASE t.priority
        WHEN 'urgent' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        WHEN 'low' THEN 4
      END,
      t.due_date ASC NULLS LAST,
      t.created_at DESC
    `;

    const result = await query(sql, params);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      tasks: result.data || [],
      count: result.data?.length || 0,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Neue Task
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      project_id,
      title,
      description,
      status = 'todo',
      priority = 'medium',
      due_date,
      assigned_to,
      estimated_hours,
      actual_hours,
      notes,
    } = body;

    if (!project_id || !title) {
      return NextResponse.json(
        { error: 'Projekt-ID und Titel sind erforderlich' },
        { status: 400 }
      );
    }

    // Validiere Status
    const validStatuses = ['todo', 'in_progress', 'review', 'completed', 'blocked'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Ungültiger Status' },
        { status: 400 }
      );
    }

    // Validiere Priority
    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (!validPriorities.includes(priority)) {
      return NextResponse.json(
        { error: 'Ungültige Priorität' },
        { status: 400 }
      );
    }

    const sql = `
      INSERT INTO project_tasks (
        project_id, title, description, status, priority, due_date,
        assigned_to, estimated_hours, actual_hours, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const result = await query(sql, [
      project_id,
      title,
      description || null,
      status,
      priority,
      due_date || null,
      assigned_to || null,
      estimated_hours || null,
      actual_hours || null,
      notes || null,
    ]);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Task erfolgreich erstellt',
      task: result.data?.[0],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
