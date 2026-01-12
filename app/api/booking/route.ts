// Booking-Anfragen werden über /api/contact verarbeitet
// Diese Route leitet direkt an die Contact-Logik weiter (ohne fetch, da Netlify Functions keinen internen fetch unterstützt)
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  // Importiere die Contact-Handler-Funktion direkt
  // Da wir die gleiche Logik brauchen, importieren wir den Handler
  try {
    // Rufe direkt die Contact-API-Logik auf
    const contactHandler = await import('../contact/route');
    return contactHandler.POST(request);
  } catch (error) {
    console.error('Error in booking route:', error);
    return NextResponse.json(
      { success: false, message: 'Fehler beim Verarbeiten der Anfrage.' },
      { status: 500 }
    );
  }
}


