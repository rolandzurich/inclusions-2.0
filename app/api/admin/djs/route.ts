import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { DJsData } from '@/types/dj';

const djsFilePath = path.join(process.cwd(), 'data', 'djs.json');

export async function GET(request: NextRequest) {
  try {
    // TODO: Auth-Check implementieren
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const fileContents = await fs.readFile(djsFilePath, 'utf8');
    const data = JSON.parse(fileContents) as DJsData;
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading DJs data:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der DJ-Daten.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // TODO: Auth-Check implementieren
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json() as DJsData;

    // Validierung der Datenstruktur
    if (!body.djs || !Array.isArray(body.djs) || !body.pairs || !Array.isArray(body.pairs)) {
      return NextResponse.json(
        { error: 'Ungültige Datenstruktur.' },
        { status: 400 }
      );
    }

    // Speichere die aktualisierten Daten
    await fs.writeFile(djsFilePath, JSON.stringify(body, null, 2), 'utf8');
    
    return NextResponse.json({ success: true, message: 'DJ-Daten erfolgreich gespeichert.' });
  } catch (error) {
    console.error('Error saving DJs data:', error);
    return NextResponse.json(
      { error: 'Fehler beim Speichern der DJ-Daten.' },
      { status: 500 }
    );
  }
}
