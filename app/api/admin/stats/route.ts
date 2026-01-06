import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // TODO: Auth-Check implementieren
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Stats parallel abrufen
    const [contactRequests, newsletterSubscribers, vipRegistrations, recentRequests] = await Promise.all([
      supabaseAdmin.from('contact_requests').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('newsletter_subscribers').select('id', { count: 'exact', head: true }).eq('status', 'confirmed'),
      supabaseAdmin.from('vip_registrations').select('id', { count: 'exact', head: true }),
      supabaseAdmin
        .from('contact_requests')
        .select('id, created_at, name, email, booking_item')
        .order('created_at', { ascending: false })
        .limit(5),
    ]);

    return NextResponse.json({
      contactRequests: contactRequests.count || 0,
      newsletterSubscribers: newsletterSubscribers.count || 0,
      vipRegistrations: vipRegistrations.count || 0,
      recentContactRequests: recentRequests.data || [],
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Statistiken.' },
      { status: 500 }
    );
  }
}

