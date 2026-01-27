import { NextRequest, NextResponse } from 'next/server';
import { insertVipRegistration } from '@/lib/db-json';
import { sendVIPConfirmation, sendVIPNotification } from '@/lib/resend';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validierung
    if (!body.email || !body.first_name || !body.last_name) {
      return NextResponse.json(
        { success: false, message: 'Name und E-Mail sind erforderlich.' },
        { status: 400 }
      );
    }

    // Speichere in JSON
    const result = await insertVipRegistration({
      first_name: body.first_name,
      last_name: body.last_name,
      email: body.email,
      phone: body.phone || null,
      company: body.company || null,
      guests: body.guests || 1,
    });

    console.log('✅ VIP gespeichert:', result.data);

    const fullName = `${body.first_name} ${body.last_name}`;

    // Sende Bestätigungs-E-Mail an den Benutzer
    try {
      const confirmResult = await sendVIPConfirmation(
        body.email,
        fullName,
        body.event_date,
        body.event_location
      );
      if (confirmResult.error) {
        console.error('⚠️ VIP-Bestätigungs-E-Mail Fehler:', confirmResult.error);
      } else {
        console.log('✅ VIP-Bestätigungs-E-Mail versendet an:', body.email);
      }
    } catch (emailError) {
      console.error('❌ VIP-Bestätigungs-E-Mail Fehler:', emailError);
    }

    // Sende Benachrichtigung an info@inclusions.zone
    try {
      const notificationResult = await sendVIPNotification({
        name: fullName,
        email: body.email,
        phone: body.phone,
        company: body.company,
        numberOfGuests: body.guests,
        eventDate: body.event_date,
        eventLocation: body.event_location,
        eventType: body.event_type,
        message: body.message,
        specialRequirements: body.special_requirements,
        sourceUrl: body.sourceUrl,
        utmSource: body.utmSource,
        utmMedium: body.utmMedium,
        utmCampaign: body.utmCampaign,
      });
      if (notificationResult.error) {
        console.error('⚠️ VIP-Benachrichtigungs-E-Mail Fehler:', notificationResult.error);
      } else {
        console.log('✅ VIP-Benachrichtigung versendet an info@inclusions.zone');
      }
    } catch (emailError) {
      console.error('❌ VIP-Benachrichtigungs-E-Mail Fehler:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Vielen Dank für deine VIP-Anmeldung! Wir haben dir eine Bestätigung per E-Mail gesendet.'
    });

  } catch (error) {
    console.error('❌ VIP Error:', error);
    return NextResponse.json(
      { success: false, message: 'Ein Fehler ist aufgetreten.' },
      { status: 500 }
    );
  }
}
