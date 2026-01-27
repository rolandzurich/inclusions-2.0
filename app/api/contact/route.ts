import { NextRequest, NextResponse } from 'next/server';
import { insertContactRequest } from '@/lib/db-json';
import { sendContactConfirmation, sendContactNotification } from '@/lib/resend';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validierung
    if (!body.email || !body.name || !body.message) {
      return NextResponse.json(
        { success: false, message: 'Alle Felder sind erforderlich.' },
        { status: 400 }
      );
    }

    // Speichere in JSON
    const result = await insertContactRequest({
      name: body.name,
      email: body.email,
      phone: body.phone || null,
      subject: body.subject || 'Kontaktanfrage',
      message: body.message,
    });

    console.log('✅ Contact gespeichert:', result.data);

    // Sende Bestätigungs-E-Mail an den Benutzer
    try {
      const confirmResult = await sendContactConfirmation(body.email, body.name);
      if (confirmResult.error) {
        console.error('⚠️ Bestätigungs-E-Mail Fehler:', confirmResult.error);
      } else {
        console.log('✅ Bestätigungs-E-Mail versendet an:', body.email);
      }
    } catch (emailError) {
      console.error('❌ Bestätigungs-E-Mail Fehler:', emailError);
    }

    // Sende Benachrichtigung an info@inclusions.zone
    try {
      const notificationResult = await sendContactNotification({
        name: body.name,
        email: body.email,
        phone: body.phone,
        message: body.message,
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
      message: 'Vielen Dank für deine Nachricht! Wir haben dir eine Bestätigung per E-Mail gesendet.'
    });

  } catch (error) {
    console.error('❌ Contact Error:', error);
    return NextResponse.json(
      { success: false, message: 'Ein Fehler ist aufgetreten.' },
      { status: 500 }
    );
  }
}
