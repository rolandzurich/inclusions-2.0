import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { join } from 'path';

export const dynamic = 'force-dynamic';

const DATA_DIR = join(process.cwd(), 'data');
const FILENAME = 'contact_requests.json';

async function readJsonFile(): Promise<any[]> {
  try {
    const data = await fs.readFile(join(DATA_DIR, FILENAME), 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeJsonFile(data: any[]) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(join(DATA_DIR, FILENAME), JSON.stringify(data, null, 2));
}

// GET: Get single contact request and mark as viewed
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await readJsonFile();
    const item = data.find((r: any) => String(r.id) === String(params.id));

    if (!item) {
      return NextResponse.json(
        { error: 'Anfrage nicht gefunden.' },
        { status: 404 }
      );
    }

    // Mark as viewed if not already viewed
    if (!item.viewed_at) {
      item.viewed_at = new Date().toISOString();
      await writeJsonFile(data);
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error('Error fetching contact request:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Anfrage.' },
      { status: 500 }
    );
  }
}

// PATCH: Update contact request (e.g., status, viewed_at)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = await readJsonFile();
    const item = data.find((r: any) => String(r.id) === String(params.id));

    if (!item) {
      return NextResponse.json(
        { error: 'Anfrage nicht gefunden.' },
        { status: 404 }
      );
    }

    // Update fields
    if (body.status !== undefined) item.status = body.status;
    if (body.viewed_at !== undefined) item.viewed_at = body.viewed_at;
    if (body.admin_notes !== undefined) item.admin_notes = body.admin_notes;

    await writeJsonFile(data);
    return NextResponse.json(item);
  } catch (error) {
    console.error('Error updating contact request:', error);
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der Anfrage.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await readJsonFile();
    const filtered = data.filter((r: any) => String(r.id) !== String(params.id));

    if (filtered.length === data.length) {
      return NextResponse.json(
        { error: 'Anfrage nicht gefunden.' },
        { status: 404 }
      );
    }

    await writeJsonFile(filtered);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting contact request:', error);
    return NextResponse.json(
      { error: 'Fehler beim Löschen der Anfrage.' },
      { status: 500 }
    );
  }
}

