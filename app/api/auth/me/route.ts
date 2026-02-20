export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';

/**
 * GET /api/auth/me
 * 
 * Gibt den aktuellen Benutzer zurück (aus dem JWT-Cookie).
 * Wird vom Admin-Frontend benutzt um den Login-Status zu prüfen.
 */
export async function GET(request: NextRequest) {
  const user = await authenticateRequest(request);

  if (!user) {
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    );
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      email: user.email,
      role: user.role,
      name: user.name,
    },
  });
}
