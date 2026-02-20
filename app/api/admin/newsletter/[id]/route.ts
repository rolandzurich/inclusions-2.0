import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { join } from 'path';

export const dynamic = 'force-dynamic';

const DATA_DIR = join(process.cwd(), 'data');
const FILENAME = 'newsletter_subscribers.json';

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
        { error: 'Abonnent nicht gefunden.' },
        { status: 404 }
      );
    }

    await writeJsonFile(filtered);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting newsletter subscriber:', error);
    return NextResponse.json(
      { error: 'Fehler beim Löschen des Abonnenten.' },
      { status: 500 }
    );
  }
}

