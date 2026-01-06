import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Rate Limiting (optional, wenn Supabase verfügbar)
    let ipAddress = 'unknown';
    try {
      const { getClientIP, checkRateLimit } = await import('@/lib/supabase');
      ipAddress = getClientIP(request);
      const rateLimit = await checkRateLimit(ipAddress, '/api/contact', 10, 60);
      
      if (!rateLimit.allowed) {
        return NextResponse.json(
          { success: false, message: 'Zu viele Anfragen. Bitte versuche es später erneut.' },
          { status: 429 }
        );
      }
    } catch (rateLimitError) {
      // Rate Limiting nicht verfügbar, weiter ohne
      console.log('Rate limiting nicht verfügbar');
    }

    const body = await request.json();

    // Spam-Schutz: Honeypot
    if (body.honeypot && body.honeypot !== '') {
      // Bot erkannt, aber trotzdem Erfolg zurückgeben (kein Feedback geben)
      return NextResponse.json({ success: true });
    }

    // Validierung
    if (!body.name || !body.email) {
      return NextResponse.json(
        { success: false, message: 'Name und E-Mail sind erforderlich.' },
        { status: 400 }
      );
    }

    // E-Mail-Validierung
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { success: false, message: 'Ungültige E-Mail-Adresse.' },
        { status: 400 }
      );
    }

    // UTM-Parameter aus URL extrahieren
    const url = new URL(request.url);
    const sourceUrl = body.source_url || url.searchParams.get('source_url') || 'unknown';
    const utmSource = body.utm_source || url.searchParams.get('utm_source') || null;
    const utmMedium = body.utm_medium || url.searchParams.get('utm_medium') || null;
    const utmCampaign = body.utm_campaign || url.searchParams.get('utm_campaign') || null;

    // In Datenbank speichern - zuerst Supabase, dann direkter DB-Zugriff
    let saved = false;
    
    try {
      const { supabaseAdmin } = await import('@/lib/supabase');
      
      if (supabaseAdmin) {
        const { data, error } = await supabaseAdmin
          .from('contact_requests')
          .insert({
            name: body.name.trim(),
            email: body.email.trim().toLowerCase(),
            phone: body.phone?.trim() || null,
            message: body.message?.trim() || null,
            booking_type: body.booking_type || body.type || null,
            booking_item: body.booking_item || null,
            event_date: body.event_date || null,
            event_location: body.event_location || null,
            event_type: body.event_type || null,
            source_url: sourceUrl,
            utm_source: utmSource,
            utm_medium: utmMedium,
            utm_campaign: utmCampaign,
            honeypot: body.honeypot || null,
            ip_address: ipAddress,
          })
          .select()
          .single();

        if (!error && data) {
          saved = true;
          console.log('✅ Contact request gespeichert via Supabase:', data.id);
        }
      }
    } catch (supabaseError) {
      console.warn('Supabase nicht verfügbar, versuche direkten DB-Zugriff');
    }

    // Fallback: Direkter Datenbankzugriff
    if (!saved) {
      try {
        const { insertDb } = await import('@/lib/db-direct');
        console.log('📝 Versuche Contact-Request zu speichern via direkter DB...');
        const { data, error } = await insertDb('contact_requests', {
          name: body.name.trim(),
          email: body.email.trim().toLowerCase(),
          phone: body.phone?.trim() || null,
          message: body.message?.trim() || null,
          booking_type: body.booking_type || body.type || null,
          booking_item: body.booking_item || null,
          event_date: body.event_date || null,
          event_location: body.event_location || null,
          event_type: body.event_type || null,
          source_url: sourceUrl || null,
          utm_source: utmSource || null,
          utm_medium: utmMedium || null,
          utm_campaign: utmCampaign || null,
          honeypot: body.honeypot || null,
          ip_address: ipAddress || null,
        });

        if (!error && data) {
          saved = true;
          console.log('✅ Contact request gespeichert via direkter DB:', data.id);
        } else {
          console.error('❌ Fehler beim Speichern:', error);
        }
      } catch (dbError) {
        console.error('❌ Direkter DB-Zugriff fehlgeschlagen:', dbError);
      }
    }

    // E-Mails senden (async, nicht blockierend) - nur wenn gespeichert
    if (saved) {
      try {
        const { sendContactConfirmation, sendContactNotification } = await import('@/lib/resend');
        Promise.all([
          sendContactConfirmation(body.email, body.name).catch(err => 
            console.error('Error sending confirmation email:', err)
          ),
          sendContactNotification({
            name: body.name,
            email: body.email,
            phone: body.phone,
            message: body.message,
            bookingType: body.booking_type || body.type,
            bookingItem: body.booking_item,
          }).catch(err => 
            console.error('Error sending notification email:', err)
          ),
        ]);
      } catch (emailError) {
        console.error('E-Mail-Versand fehlgeschlagen:', emailError);
      }
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Deine Anfrage wurde erfolgreich gesendet. Wir melden uns bald bei dir.' 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing contact request:', error);
    return NextResponse.json(
      { success: false, message: 'Fehler beim Verarbeiten der Anfrage.' },
      { status: 500 }
    );
  }
}

