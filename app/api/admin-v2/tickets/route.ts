/**
 * GET  /api/admin-v2/tickets         → Aktuelle Ticket-Verkäufe (aus Cache)
 * POST /api/admin-v2/tickets         → Daten von WooCommerce neu holen
 * POST /api/admin-v2/tickets?action=import → Manueller Import
 */
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import {
  getLatestTicketSales,
  fetchAndCacheTicketSales,
  importTicketSalesManually,
  isConfigured,
  isCacheFresh,
} from '@/lib/ticket-sales';

export async function GET() {
  try {
    const configured = isConfigured();
    const data = await getLatestTicketSales();
    const fresh = await isCacheFresh();
    
    return NextResponse.json({
      configured,
      has_data: !!data,
      cache_fresh: fresh,
      data,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    // Manueller Import (für initiale Daten oder wenn API nicht verfügbar)
    if (action === 'import') {
      const body = await request.json();
      const { categories } = body;
      
      if (!categories || !Array.isArray(categories)) {
        return NextResponse.json(
          { error: 'categories Array erforderlich' },
          { status: 400 }
        );
      }
      
      const result = await importTicketSalesManually(categories);
      return NextResponse.json(result);
    }
    
    // Standard: Von WooCommerce holen
    const result = await fetchAndCacheTicketSales();
    return NextResponse.json(result);
    
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
