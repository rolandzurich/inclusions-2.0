import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Rate Limiting (optional, wenn Supabase verfügbar)
    let ipAddress = 'unknown';
    try {
      const { getClientIP, checkRateLimit } = await import('@/lib/supabase');
      ipAddress = getClientIP(request);
      const rateLimit = await checkRateLimit(ipAddress, '/api/vip', 10, 60);
      
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

    // UTM-Parameter
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
          .from('vip_registrations')
          .insert({
            name: body.name.trim(),
            email: body.email.trim().toLowerCase(),
            phone: body.phone?.trim() || null,
            event_date: body.event_date || null,
            event_location: body.event_location || null,
            event_type: body.event_type || null,
            message: body.message?.trim() || null,
            company: body.company?.trim() || null,
            number_of_guests: body.number_of_guests || null,
            special_requirements: body.special_requirements?.trim() || null,
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
          console.log('✅ VIP registration gespeichert via Supabase:', data.id);
          
          // Google Sheets Export (async, nicht blockierend)
          import('@/lib/google-sheets').then(({ addVIPRegistrationToSheet }) => {
            addVIPRegistrationToSheet({
              id: data.id,
              created_at: data.created_at || new Date().toISOString(),
              name: data.name,
              email: data.email,
              phone: data.phone,
              event_date: data.event_date,
              event_location: data.event_location,
              event_type: data.event_type,
              message: data.message,
              company: data.company,
              number_of_guests: data.number_of_guests,
              special_requirements: data.special_requirements,
              source_url: data.source_url,
              utm_source: data.utm_source,
              utm_medium: data.utm_medium,
              utm_campaign: data.utm_campaign,
              ip_address: data.ip_address,
              status: data.status,
            }).catch(err => 
              console.error('Error exporting to Google Sheets:', err)
            );
          });
        }
      }
    } catch (supabaseError) {
      console.warn('Supabase nicht verfügbar, versuche direkten DB-Zugriff');
    }

    // Fallback: Direkter Datenbankzugriff
    if (!saved) {
      try {
        const { insertDb } = await import('@/lib/db-direct');
        console.log('📝 Versuche VIP-Registration zu speichern via direkter DB...');
        const { data, error } = await insertDb('vip_registrations', {
          name: body.name.trim(),
          email: body.email.trim().toLowerCase(),
          phone: body.phone?.trim() || null,
          event_date: body.event_date || null,
          event_location: body.event_location || null,
          event_type: body.event_type || null,
          message: body.message?.trim() || null,
          company: body.company?.trim() || null,
          number_of_guests: body.number_of_guests || null,
          special_requirements: body.special_requirements?.trim() || null,
          source_url: sourceUrl || null,
          utm_source: utmSource || null,
          utm_medium: utmMedium || null,
          utm_campaign: utmCampaign || null,
          honeypot: body.honeypot || null,
          ip_address: ipAddress || null,
        });

        if (!error && data) {
          saved = true;
          console.log('✅ VIP registration gespeichert via direkter DB:', data.id);
          
          // Google Sheets Export (async, nicht blockierend)
          import('@/lib/google-sheets').then(({ addVIPRegistrationToSheet }) => {
            addVIPRegistrationToSheet({
              id: data.id,
              created_at: data.created_at || new Date().toISOString(),
              name: data.name,
              email: data.email,
              phone: data.phone,
              event_date: data.event_date,
              event_location: data.event_location,
              event_type: data.event_type,
              message: data.message,
              company: data.company,
              number_of_guests: data.number_of_guests,
              special_requirements: data.special_requirements,
              source_url: data.source_url,
              utm_source: data.utm_source,
              utm_medium: data.utm_medium,
              utm_campaign: data.utm_campaign,
              ip_address: data.ip_address,
              status: data.status || 'new',
            }).catch(err => 
              console.error('Error exporting to Google Sheets:', err)
            );
          });
        } else {
          console.error('❌ Fehler beim Speichern:', error);
        }
      } catch (dbError) {
        console.error('❌ Direkter DB-Zugriff fehlgeschlagen:', dbError);
      }
    }

    // E-Mails senden (immer, auch wenn Speichern fehlgeschlagen ist)
    try {
      const { sendVIPConfirmation, sendVIPNotification, resend, resendApiKey } = await import('@/lib/resend');
      
      console.log('📧 E-Mail-Versand wird vorbereitet...');
      console.log('📧 RESEND_API_KEY vorhanden:', !!resendApiKey);
      console.log('📧 Resend-Instanz vorhanden:', !!resend);
      console.log('📧 Empfänger E-Mail:', body.email);
      console.log('📧 Name:', body.name);
      
      if (!resend) {
        console.error('❌ Resend nicht konfiguriert - RESEND_API_KEY fehlt');
        console.error('❌ Bitte setze RESEND_API_KEY in den Umgebungsvariablen');
      } else {
        console.log('📧 Versuche VIP-E-Mails zu senden...');
        console.log('📧 Bestätigung an:', body.email);
        console.log('📧 Benachrichtigung an: info@inclusions.zone, roland.luthi@gmail.com');
        
        // E-Mails einzeln senden für besseres Error-Handling
        console.log('📧 Starte Versand der Bestätigungs-E-Mail...');
        const confirmationResult = await sendVIPConfirmation(body.email, body.name, body.event_date, body.event_location);
        
        if (confirmationResult?.error) {
          console.error('❌ Bestätigungs-E-Mail Fehler:', confirmationResult.error);
          console.error('❌ Fehler-Details:', JSON.stringify(confirmationResult, null, 2));
        } else {
          console.log('✅ Bestätigungs-E-Mail erfolgreich gesendet');
          if (confirmationResult?.id) {
            console.log('   E-Mail-ID:', confirmationResult.id);
          }
          if (confirmationResult?.data) {
            console.log('   E-Mail-Daten:', JSON.stringify(confirmationResult.data, null, 2));
          }
        }
        
        console.log('📧 Starte Versand der Benachrichtigungs-E-Mail...');
        const notificationResult = await sendVIPNotification({
          name: body.name,
          email: body.email,
          phone: body.phone,
          eventDate: body.event_date,
          eventLocation: body.event_location,
          eventType: body.event_type,
          message: body.message,
          company: body.company,
          numberOfGuests: body.number_of_guests,
          specialRequirements: body.special_requirements,
          sourceUrl: sourceUrl,
          utmSource: utmSource || undefined,
          utmMedium: utmMedium || undefined,
          utmCampaign: utmCampaign || undefined,
        });
        
        if (notificationResult?.error) {
          console.error('❌ Benachrichtigungs-E-Mail Fehler:', notificationResult.error);
          console.error('❌ Fehler-Details:', JSON.stringify(notificationResult, null, 2));
        } else {
          console.log('✅ Benachrichtigungs-E-Mail erfolgreich gesendet');
          if (notificationResult?.id) {
            console.log('   E-Mail-ID:', notificationResult.id);
          }
          if (notificationResult?.data) {
            console.log('   E-Mail-Daten:', JSON.stringify(notificationResult.data, null, 2));
          }
        }
      }
    } catch (emailError) {
      console.error('❌ E-Mail-Versand fehlgeschlagen:', emailError);
      if (emailError instanceof Error) {
        console.error('❌ Fehler-Details:', emailError.message);
        console.error('❌ Stack:', emailError.stack);
      }
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Deine VIP-Anmeldung wurde erfolgreich gesendet. Wir melden uns bald bei dir.' 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing VIP registration:', error);
    return NextResponse.json(
      { success: false, message: 'Fehler beim Verarbeiten der Anmeldung.' },
      { status: 500 }
    );
  }
}

