import { NextRequest, NextResponse } from 'next/server';
import { insertNewsletterSubscriber } from '@/lib/db-json';
import { sendNewsletterWelcome, sendNewsletterNotification } from '@/lib/resend';
import { upsertContact } from '@/lib/crm-helpers';
import { query } from '@/lib/db-postgres';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.email) {
      return NextResponse.json(
        { success: false, message: 'E-Mail ist erforderlich.' },
        { status: 400 }
      );
    }

    // === 1. JSON-Fallback (bestehend) ===
    try {
      await insertNewsletterSubscriber({
        email: body.email.toLowerCase().trim(),
        first_name: body.first_name || null,
        last_name: body.last_name || null,
        interests: body.interests || [],
        age_group: body.age_group || null,
        has_disability: body.has_disability || false,
        disability_type: body.disability_type || null,
        accessibility_needs: body.accessibility_needs || null,
      });
      console.log('✅ Newsletter in JSON gespeichert');
    } catch (jsonErr) {
      console.warn('⚠️ JSON-Speicherung fehlgeschlagen:', jsonErr);
    }

    // === 2. PostgreSQL CRM (NEU) ===
    try {
      const contactId = await upsertContact({
        first_name: body.first_name || 'Newsletter',
        last_name: body.last_name || 'Abonnent',
        email: body.email,
        has_disability: body.has_disability || false,
        categories: ['newsletter'],
        source: 'newsletter_form',
      });

      await query(`
        INSERT INTO newsletter_subscriptions (contact_id, interests, status, opt_in_confirmed_at)
        VALUES ($1, $2, 'confirmed', NOW())
        ON CONFLICT (contact_id) DO UPDATE SET
          interests = EXCLUDED.interests,
          status = 'confirmed',
          opt_in_confirmed_at = NOW(),
          updated_at = NOW()
      `, [contactId, body.interests || []]);

      console.log('✅ Newsletter in PostgreSQL/CRM gespeichert');
    } catch (pgErr) {
      console.error('⚠️ PostgreSQL-Speicherung fehlgeschlagen:', pgErr);
    }

    // E-Mail-Versand (unverändert)
    try {
      const welcomeResult = await sendNewsletterWelcome(body.email, body.first_name || 'Liebe/r');
      if (welcomeResult.error) console.error('⚠️ Willkommens-E-Mail Fehler:', welcomeResult.error);
      else console.log('✅ Willkommens-E-Mail versendet an:', body.email);
    } catch (emailError) {
      console.error('❌ Willkommens-E-Mail Fehler:', emailError);
    }

    try {
      const notificationResult = await sendNewsletterNotification({
        email: body.email, firstName: body.first_name, lastName: body.last_name,
        hasDisability: body.has_disability, interests: body.interests,
        sourceUrl: body.sourceUrl, utmSource: body.utmSource,
        utmMedium: body.utmMedium, utmCampaign: body.utmCampaign,
      });
      if (notificationResult.error) console.error('⚠️ Benachrichtigung Fehler:', notificationResult.error);
      else console.log('✅ Benachrichtigung versendet');
    } catch (emailError) {
      console.error('❌ Benachrichtigung Fehler:', emailError);
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
