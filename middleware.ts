/**
 * Next.js Middleware – Rollen-basierte Zugriffskontrolle
 * 
 * Schützt:
 * - /admin-v2/* → Nur Rolle 'admin'
 * - /api/admin-v2/* → Nur Rolle 'admin'  
 * - /crew/* → Rolle 'admin' ODER 'crew'
 * - /api/crew/* → Rolle 'admin' ODER 'crew'
 * 
 * Frei zugänglich:
 * - /admin-v2/login, /crew/login → Login-Seiten
 * - /api/auth/* → Auth-Endpunkte
 * - Alles andere → Öffentliche Website
 */

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const COOKIE_NAME = 'inclusions_admin_token';

interface TokenPayload {
  userId: string;
  email: string;
  role: 'admin' | 'crew';
  name?: string;
}

/**
 * Verifiziert den JWT und extrahiert die Payload (inkl. Rolle).
 */
async function verifyTokenEdge(token: string): Promise<TokenPayload | null> {
  try {
    const secret = process.env.ADMIN_SESSION_SECRET;
    if (!secret || secret.length < 32) return null;

    const key = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, key, { issuer: 'inclusions-admin' });
    
    return {
      userId: (payload as any).userId || 'unknown',
      email: (payload as any).email || '',
      role: (payload as any).role || 'crew',
      name: (payload as any).name,
    };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // === Immer erlaubt: Login-Seiten, Reset-Seite und Auth-API ===
  if (
    pathname === '/admin-v2/login' ||
    pathname === '/crew/login' ||
    pathname === '/crew/reset-password' ||
    pathname.startsWith('/api/auth/')
  ) {
    return NextResponse.next();
  }

  // === Token prüfen ===
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return handleUnauthenticated(request, pathname);
  }

  const user = await verifyTokenEdge(token);

  if (!user) {
    return handleUnauthenticated(request, pathname);
  }

  // === Rollen-Check ===
  
  // Admin-Bereich: Nur Admins
  if (pathname.startsWith('/admin-v2') || pathname.startsWith('/api/admin-v2')) {
    if (user.role !== 'admin') {
      return handleForbidden(request, pathname, user.role);
    }
  }

  // Crew-Bereich: Admins und Crew
  if (pathname.startsWith('/crew') || pathname.startsWith('/api/crew')) {
    if (user.role !== 'admin' && user.role !== 'crew') {
      return handleForbidden(request, pathname, user.role);
    }
  }

  // === Authentifiziert und autorisiert → durchlassen ===
  // User-Info als REQUEST-Header für API-Routen mitgeben
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', user.userId);
  requestHeaders.set('x-user-email', user.email);
  requestHeaders.set('x-user-role', user.role);
  if (user.name) requestHeaders.set('x-user-name', user.name);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

/**
 * Nicht authentifiziert → Login-Seite oder 401.
 */
function handleUnauthenticated(request: NextRequest, pathname: string): NextResponse {
  // API: 401
  if (pathname.startsWith('/api/')) {
    return NextResponse.json(
      { error: 'Nicht authentifiziert. Bitte einloggen.' },
      { status: 401 }
    );
  }

  // Crew-Seiten → Crew-Login
  if (pathname.startsWith('/crew')) {
    const loginUrl = new URL('/crew/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin-Seiten → Admin-Login
  const loginUrl = new URL('/admin-v2/login', request.url);
  loginUrl.searchParams.set('redirect', pathname);
  return NextResponse.redirect(loginUrl);
}

/**
 * Authentifiziert aber falsche Rolle → 403.
 */
function handleForbidden(request: NextRequest, pathname: string, userRole: string): NextResponse {
  // API: 403
  if (pathname.startsWith('/api/')) {
    return NextResponse.json(
      { error: 'Keine Berechtigung. Admin-Zugang erforderlich.' },
      { status: 403 }
    );
  }

  // Crew-User versucht Admin zu öffnen → zum Crew-Bereich
  if (userRole === 'crew' && pathname.startsWith('/admin-v2')) {
    return NextResponse.redirect(new URL('/crew', request.url));
  }

  // Fallback
  return NextResponse.redirect(new URL('/', request.url));
}

/**
 * Matcher: Middleware läuft für Admin und Crew Pfade.
 */
export const config = {
  matcher: [
    '/admin-v2/:path*',
    '/api/admin-v2/:path*',
    '/crew/:path*',
    '/api/crew/:path*',
  ],
};
