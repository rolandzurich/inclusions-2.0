// Diese Route wird durch /api/contact ersetzt
// Booking-Anfragen werden jetzt über /api/contact verarbeitet
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // Weiterleitung zur neuen Contact-API
  const contactResponse = await fetch(new URL('/api/contact', request.url), {
    method: 'POST',
    headers: request.headers,
    body: JSON.stringify(await request.json()),
  });

  return contactResponse;
}


