import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // TODO: Auth-Check implementieren
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Dynamisch Supabase importieren
    const { supabaseAdmin } = await import('@/lib/supabase');
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase nicht verfügbar.' },
        { status: 503 }
      );
    }

    // Stats parallel abrufen
    const [contactRequests, newsletterSubscribers, vipRegistrations, recentRequests, newContactRequests, newVIPRegistrations, newNewsletterSubscribers] = await Promise.all([
      supabaseAdmin.from('contact_requests').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('newsletter_subscribers').select('id', { count: 'exact', head: true }), // Alle zählen, nicht nur confirmed
      supabaseAdmin.from('vip_registrations').select('id', { count: 'exact', head: true }),
      supabaseAdmin
        .from('contact_requests')
        .select('id, created_at, name, email, booking_item, viewed_at')
        .order('created_at', { ascending: false })
        .limit(5),
      supabaseAdmin.from('contact_requests').select('id', { count: 'exact', head: true }).is('viewed_at', null),
      supabaseAdmin.from('vip_registrations').select('id', { count: 'exact', head: true }).is('viewed_at', null),
      supabaseAdmin.from('newsletter_subscribers').select('id', { count: 'exact', head: true }).is('viewed_at', null),
    ]);

    return NextResponse.json({
      contactRequests: contactRequests.count || 0,
      newsletterSubscribers: newsletterSubscribers.count || 0,
      vipRegistrations: vipRegistrations.count || 0,
      recentContactRequests: recentRequests.data || [],
      newContactRequests: newContactRequests.count || 0,
      newVIPRegistrations: newVIPRegistrations.count || 0,
      newNewsletterSubscribers: newNewsletterSubscribers.count || 0,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Statistiken.' },
      { status: 500 }
    );
  }
}

