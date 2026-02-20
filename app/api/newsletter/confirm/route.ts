import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// TODO: Migrate to PostgreSQL via lib/db-postgres
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(new URL('/newsletter?error=missing-token', request.url));
    }

    return NextResponse.redirect(new URL('/newsletter?error=service-unavailable', request.url));
  } catch (error) {
    console.error('Error confirming newsletter subscription:', error);
    return NextResponse.redirect(new URL('/newsletter?error=unknown', request.url));
  }
}

