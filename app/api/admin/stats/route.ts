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
    // TODO: Auth-Check implementieren
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Lese alle Daten aus JSON-Dateien
    const [contactRequests, newsletterSubscribers, vipRegistrations] = await Promise.all([
      readJsonFile('contact_requests.json'),
      readJsonFile('newsletter_subscribers.json'),
      readJsonFile('vip_registrations.json'),
    ]);

    // Sortiere nach Datum und hole die neuesten 5 Booking-Anfragen
    const sortedRequests = contactRequests
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);

    // Zähle neue (ungesehene) Einträge
    const newContactRequests = contactRequests.filter((r: any) => !r.viewed_at).length;
    const newVIPRegistrations = vipRegistrations.filter((r: any) => !r.viewed_at).length;
    const newNewsletterSubscribers = newsletterSubscribers.filter((r: any) => !r.viewed_at).length;

    return NextResponse.json({
      contactRequests: contactRequests.length,
      newsletterSubscribers: newsletterSubscribers.length,
      vipRegistrations: vipRegistrations.length,
      recentContactRequests: sortedRequests,
      newContactRequests,
      newVIPRegistrations,
      newNewsletterSubscribers,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Statistiken.' },
      { status: 500 }
    );
  }
}

