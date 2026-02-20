import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { join } from 'path';

export const dynamic = 'force-dynamic';

async function readJsonFile(filename: string): Promise<any[]> {
  try {
    const dataDir = join(process.cwd(), 'data');
    const data = await fs.readFile(join(dataDir, filename), 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    // TODO: Auth-Check
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Lese aus JSON-Datei
    const data = await readJsonFile('newsletter_subscribers.json');
    
    // Sortiere nach Datum (neueste zuerst)
    const sortedData = data.sort((a: any, b: any) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    
    return NextResponse.json(sortedData);
  } catch (error) {
    console.error('Error fetching newsletter subscribers:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Newsletter-Anmeldungen.' },
      { status: 500 }
    );
  }
}

