export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db-postgres';

// GET - Einzelne Task
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const sql = `
      SELECT 
        t.*,
        p.title as project_title
      FROM project_tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE t.id = $1
    `;

    const result = await query(sql, [params.id]);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    if (!result.data || result.data.length === 0) {
      return NextResponse.json(
        { error: 'Task nicht gefunden' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      task: result.data[0],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Task aktualisieren
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
      priority,
      due_date,
      assigned_to,
      estimated_hours,
      actual_hours,
      notes,
    } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Titel ist erforderlich' },
        { status: 400 }
      );
    }

    const validStatuses = ['todo', 'in_progress', 'review', 'completed', 'blocked'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Ungültiger Status' },
        { status: 400 }
      );
    }

    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (priority && !validPriorities.includes(priority)) {
      return NextResponse.json(
        { error: 'Ungültige Priorität' },
        { status: 400 }
      );
    }

    const sql = `
      UPDATE project_tasks SET
        title = $1,
        description = $2,
        status = $3,
        priority = $4,
        due_date = $5,
        assigned_to = $6,
        estimated_hours = $7,
        actual_hours = $8,
        notes = $9,
        updated_at = NOW()
      WHERE id = $10
      RETURNING *
    `;

    const result = await query(sql, [
      title,
      description || null,
      status || 'todo',
      priority || 'medium',
      due_date || null,
      assigned_to || null,
      estimated_hours || null,
      actual_hours || null,
      notes || null,
      params.id,
    ]);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    if (!result.data || result.data.length === 0) {
      return NextResponse.json(
        { error: 'Task nicht gefunden' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Task erfolgreich aktualisiert',
      task: result.data[0],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Task löschen
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const sql = `DELETE FROM project_tasks WHERE id = $1 RETURNING *`;
    const result = await query(sql, [params.id]);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    if (!result.data || result.data.length === 0) {
      return NextResponse.json(
        { error: 'Task nicht gefunden' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Task erfolgreich gelöscht',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
