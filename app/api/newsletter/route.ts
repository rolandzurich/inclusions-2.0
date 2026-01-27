import { NextRequest, NextResponse } from 'next/server';
import { insertNewsletterSubscriber } from '@/lib/db-json';
import { sendNewsletterWelcome, sendNewsletterNotification } from '@/lib/resend';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validierung
    if (!body.email) {
      return NextResponse.json(
        { success: false, message: 'E-Mail ist erforderlich.' },
        { status: 400 }
      );
    }

    // Speichere in JSON
    const result = await insertNewsletterSubscriber({
      email: body.email.toLowerCase().trim(),
      first_name: body.first_name || null,
      last_name: body.last_name || null,
      interests: body.interests || [],
      age_group: body.age_group || null,
      has_disability: body.has_disability || false,
      disability_type: body.disability_type || null,
      accessibility_needs: body.accessibility_needs || null,
    });

    console.log('✅ Newsletter gespeichert:', result.data);

    // Sende Willkommens-E-Mail an den Benutzer
    try {
      const welcomeResult = await sendNewsletterWelcome(
        body.email,
        body.first_name || 'Liebe/r'
      );
      if (welcomeResult.error) {
        console.error('⚠️ Willkommens-E-Mail Fehler:', welcomeResult.error);
      } else {
        console.log('✅ Willkommens-E-Mail versendet an:', body.email);
      }
    } catch (emailError) {
      console.error('❌ Willkommens-E-Mail Fehler:', emailError);
    }

    // Sende Benachrichtigung an info@inclusions.zone
    try {
      const notificationResult = await sendNewsletterNotification({
        email: body.email,
        firstName: body.first_name,
        lastName: body.last_name,
        hasDisability: body.has_disability,
        interests: body.interests,
        sourceUrl: body.sourceUrl,
        utmSource: body.utmSource,
        utmMedium: body.utmMedium,
        utmCampaign: body.utmCampaign,
      });
      if (notificationResult.error) {
        console.error('⚠️ Benachrichtigungs-E-Mail Fehler:', notificationResult.error);
      } else {
        console.log('✅ Benachrichtigung versendet an info@inclusions.zone');
      }
    } catch (emailError) {
      console.error('❌ Benachrichtigungs-E-Mail Fehler:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Vielen Dank für deine Anmeldung! Wir haben dir eine Bestätigung per E-Mail gesendet.'
    });

  } catch (error) {
    console.error('❌ Newsletter Error:', error);
    return NextResponse.json(
      { success: false, message: 'Ein Fehler ist aufgetreten.' },
      { status: 500 }
    );
  }
}
