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
    const data = await readJsonFile('contact_requests.json');
    
    // Sortiere nach Datum (neueste zuerst)
    const sortedData = data.sort((a: any, b: any) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    
    // Markiere Duplikate basierend auf E-Mail
    const emailCounts = new Map<string, number>();
    sortedData.forEach((item: any) => {
      if (item.email) {
        const count = emailCounts.get(item.email.toLowerCase()) || 0;
        emailCounts.set(item.email.toLowerCase(), count + 1);
      }
    });
    
    const enrichedData = sortedData.map((item: any) => ({
      ...item,
      is_duplicate: item.email ? (emailCounts.get(item.email.toLowerCase()) || 0) > 1 : false,
    }));
    
    return NextResponse.json(enrichedData);
  } catch (error) {
    console.error('Error fetching contact requests:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Anfragen.' },
      { status: 500 }
    );
  }
}

