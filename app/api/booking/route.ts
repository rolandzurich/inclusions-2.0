import { NextRequest, NextResponse } from 'next/server';
import { insertContactRequest } from '@/lib/db-json';
import { sendBookingConfirmation, sendContactNotification } from '@/lib/resend';
import { upsertContact } from '@/lib/crm-helpers';
import { query } from '@/lib/db-postgres';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.email || !body.name) {
      return NextResponse.json(
        { success: false, message: 'Name und E-Mail sind erforderlich.' },
        { status: 400 }
      );
    }

    const bookingData = {
      name: body.name,
      email: body.email,
      phone: body.phone || null,
      subject: `DJ Booking: ${body.bookingItem || 'Anfrage'}`,
      message: body.message || `Buchungsanfrage für: ${body.bookingItem || 'DJ'}`,
      booking_type: body.bookingType || 'DJ',
      booking_item: body.bookingItem || null,
      event_date: body.eventDate || null,
      event_location: body.eventLocation || null,
      event_type: body.eventType || null,
    };

    // === 1. JSON-Fallback (bestehend) ===
    try {
      await insertContactRequest(bookingData);
      console.log('✅ Booking in JSON gespeichert');
    } catch (jsonErr) {
      console.warn('⚠️ JSON-Speicherung fehlgeschlagen:', jsonErr);
    }

    // === 2. PostgreSQL CRM (NEU) ===
    try {
      const nameParts = body.name.trim().split(' ');
      const contactId = await upsertContact({
        first_name: nameParts[0] || body.name,
        last_name: nameParts.slice(1).join(' ') || '',
        email: body.email,
        phone: body.phone || null,
        categories: ['booking'],
        source: 'booking_form',
      });

      await query(`
        INSERT INTO booking_requests (
          contact_id, booking_type, booking_item,
          event_date, event_location, event_type,
          message, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'new')
      `, [
        contactId,
        body.bookingType || body.booking_type || null,
        body.bookingItem || body.booking_item || null,
        body.eventDate || body.event_date || null,
        body.eventLocation || body.event_location || null,
        body.eventType || body.event_type || null,
        body.message || null,
      ]);

      console.log('✅ Booking in PostgreSQL/CRM gespeichert');
    } catch (pgErr) {
      console.error('⚠️ PostgreSQL-Speicherung fehlgeschlagen:', pgErr);
    }

    // E-Mail-Versand (unverändert)
    try {
      const confirmResult = await sendBookingConfirmation(
        body.email, body.name, body.bookingItem, body.eventDate, body.eventLocation
      );
      if (confirmResult.error) console.error('⚠️ Booking-Bestätigung Fehler:', confirmResult.error);
      else console.log('✅ Booking-Bestätigung versendet an:', body.email);
    } catch (emailError) {
      console.error('❌ Booking-Bestätigung Fehler:', emailError);
    }

    try {
      const notificationResult = await sendContactNotification({
        name: body.name, email: body.email, phone: body.phone, message: body.message,
        bookingItem: body.bookingItem, eventDate: body.eventDate,
        eventLocation: body.eventLocation, eventType: body.eventType,
        sourceUrl: body.sourceUrl, utmSource: body.utmSource,
        utmMedium: body.utmMedium, utmCampaign: body.utmCampaign,
      });
      if (notificationResult.error) console.error('⚠️ Booking-Benachrichtigung Fehler:', notificationResult.error);
      else console.log('✅ Booking-Benachrichtigung versendet');
    } catch (emailError) {
      console.error('❌ Booking-Benachrichtigung Fehler:', emailError);
    }    return NextResponse.json({
      success: true,
      message: 'Vielen Dank für deine Buchungsanfrage! Wir haben dir eine Bestätigung per E-Mail gesendet.'
    });  } catch (error) {
    console.error('❌ Booking Error:', error);
    return NextResponse.json(
      { success: false, message: 'Ein Fehler ist aufgetreten.' },
      { status: 500 }
    );
  }
}