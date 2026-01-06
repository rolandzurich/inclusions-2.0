import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Rate Limiting (optional, wenn Supabase verfügbar)
    let ipAddress = 'unknown';
    try {
      const { getClientIP, checkRateLimit } = await import('@/lib/supabase');
      ipAddress = getClientIP(request);
      const rateLimit = await checkRateLimit(ipAddress, '/api/newsletter', 5, 60);
      
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
      return NextResponse.json({ success: true });
    }

    // Validierung
    if (!body.email) {
      return NextResponse.json(
        { success: false, message: 'E-Mail ist erforderlich.' },
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

    // Prüfen ob E-Mail bereits existiert (wenn Supabase verfügbar)
    let existing = null;
    try {
      const { supabaseAdmin } = await import('@/lib/supabase');
      if (supabaseAdmin) {
        const { data } = await supabaseAdmin
          .from('newsletter_subscribers')
          .select('id, status, opt_in_confirmed_at')
          .eq('email', body.email.toLowerCase().trim())
          .single();
        existing = data;
      }
    } catch (supabaseError) {
      // Supabase nicht verfügbar, weiter ohne Prüfung
      console.log('Supabase nicht verfügbar');
    }

    if (existing) {
      if (existing.opt_in_confirmed_at) {
        // Bereits bestätigt
        return NextResponse.json(
          { success: true, message: 'Diese E-Mail-Adresse ist bereits für den Newsletter angemeldet.' },
          { status: 200 }
        );
      } else {
        // Noch nicht bestätigt, neuen Token senden
        try {
          const { supabaseAdmin } = await import('@/lib/supabase');
          const { sendNewsletterOptIn } = await import('@/lib/resend');
          
          if (!supabaseAdmin) {
            throw new Error('Supabase nicht verfügbar');
          }
          
          const { data: updated } = await supabaseAdmin
            .from('newsletter_subscribers')
            .update({
              opt_in_token: crypto.randomUUID(),
              opt_in_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            })
            .eq('id', existing.id)
            .select()
            .single();

          if (updated) {
            await sendNewsletterOptIn(
              body.email,
              body.first_name || 'Liebe/r',
              updated.opt_in_token
            ).catch(err => console.error('Error sending opt-in email:', err));
          }

          return NextResponse.json(
            { success: true, message: 'Bitte bestätige deine E-Mail-Adresse. Wir haben dir eine E-Mail gesendet.' },
            { status: 200 }
          );
        } catch (supabaseError) {
          // Fallback wenn Supabase nicht verfügbar
          return NextResponse.json(
            { success: true, message: 'Vielen Dank für deine Anmeldung!' },
            { status: 200 }
          );
        }
      }
    }

    // UTM-Parameter
    const url = new URL(request.url);
    const sourceUrl = body.source_url || url.searchParams.get('source_url') || 'unknown';
    const utmSource = body.utm_source || url.searchParams.get('utm_source') || null;
    const utmMedium = body.utm_medium || url.searchParams.get('utm_medium') || null;
    const utmCampaign = body.utm_campaign || url.searchParams.get('utm_campaign') || null;

    // Neuen Eintrag erstellen - zuerst Supabase, dann direkter DB-Zugriff
    const optInToken = crypto.randomUUID();
    const optInExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    let saved = false;

    try {
      const { supabaseAdmin } = await import('@/lib/supabase');
      
      if (supabaseAdmin) {
        const { data, error } = await supabaseAdmin
          .from('newsletter_subscribers')
          .insert({
            email: body.email.toLowerCase().trim(),
            first_name: body.first_name || body.vorname || null,
            last_name: body.last_name || body.nachname || null,
            has_disability: body.has_disability === 'ja' || body.beeintraechtigung === 'ja',
            interests: body.interests || body.interessiert || [],
            opt_in_token: optInToken,
            opt_in_expires_at: optInExpiresAt,
            source_url: sourceUrl,
            utm_source: utmSource,
            utm_medium: utmMedium,
            utm_campaign: utmCampaign,
            honeypot: body.honeypot || null,
            ip_address: ipAddress,
            status: 'pending',
          })
          .select()
          .single();

        if (!error && data) {
          saved = true;
          console.log('✅ Newsletter subscriber gespeichert via Supabase:', data.id);
        }
      }
    } catch (supabaseError) {
      console.warn('Supabase nicht verfügbar, versuche direkten DB-Zugriff');
    }

    // Fallback: Direkter Datenbankzugriff
    if (!saved) {
      try {
        const { insertDb } = await import('@/lib/db-direct');
        const interestsArray = body.interests || body.interessiert || [];
        
        console.log('📝 Versuche Newsletter-Eintrag zu speichern via direkter DB...');
        const { data, error } = await insertDb('newsletter_subscribers', {
          email: body.email.toLowerCase().trim(),
          first_name: body.first_name || body.vorname || null,
          last_name: body.last_name || body.nachname || null,
          has_disability: body.has_disability === 'ja' || body.beeintraechtigung === 'ja' || false,
          interests: Array.isArray(interestsArray) ? interestsArray : [],
          opt_in_token: optInToken,
          opt_in_expires_at: optInExpiresAt,
          source_url: sourceUrl || null,
          utm_source: utmSource || null,
          utm_medium: utmMedium || null,
          utm_campaign: utmCampaign || null,
          honeypot: body.honeypot || null,
          ip_address: ipAddress || null,
          status: 'pending',
        });

        if (!error && data) {
          saved = true;
          console.log('✅ Newsletter subscriber gespeichert via direkter DB:', data.id);
        } else {
          console.error('❌ Fehler beim Speichern:', error);
        }
      } catch (dbError) {
        console.error('❌ Direkter DB-Zugriff fehlgeschlagen:', dbError);
      }
    }

    // Opt-In E-Mail senden (wenn gespeichert)
    if (saved) {
      try {
        const { sendNewsletterOptIn, sendNewsletterNotification } = await import('@/lib/resend');
        Promise.all([
          sendNewsletterOptIn(
            body.email,
            body.first_name || body.vorname || 'Liebe/r',
            optInToken
          ).catch(err => console.error('Error sending opt-in email:', err)),
          sendNewsletterNotification({
            email: body.email,
            firstName: body.first_name || body.vorname,
            lastName: body.last_name || body.nachname,
            hasDisability: body.has_disability === 'ja' || body.beeintraechtigung === 'ja',
            interests: body.interests || body.interessiert || [],
          }).catch(err => console.error('Error sending notification email:', err)),
        ]);
      } catch (emailError) {
        console.error('E-Mail-Versand fehlgeschlagen:', emailError);
      }
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Bitte bestätige deine E-Mail-Adresse. Wir haben dir eine E-Mail mit einem Bestätigungslink gesendet.' 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing newsletter subscription:', error);
    return NextResponse.json(
      { success: false, message: 'Fehler beim Verarbeiten der Anmeldung.' },
      { status: 500 }
    );
  }
}

