import { NextRequest, NextResponse } from 'next/server';
import { insertVipRegistration } from '@/lib/db-json';
import { sendVIPConfirmation, sendVIPNotification } from '@/lib/resend';
import { upsertContact } from '@/lib/crm-helpers';
import { query } from '@/lib/db-postgres';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Unterstütze beide Formate: name (kombiniert) oder first_name/last_name (getrennt)
    let firstName = body.first_name;
    let lastName = body.last_name;
    
    if (!firstName && !lastName && body.name) {
      const nameParts = body.name.trim().split(' ');
      firstName = nameParts[0] || '';
      lastName = nameParts.slice(1).join(' ') || '';
    }

    // Validierung
    if (!body.email || !firstName || !lastName) {
      return NextResponse.json(
        { success: false, message: 'Name und E-Mail sind erforderlich.' },
        { status: 400 }
      );
    }

    // Parse die Nachricht für strukturierte Daten
    const message = body.message || '';
    
    const parseField = (label: string): string | null => {
      const regex = new RegExp(`${label}:\\s*(.+?)(?:\\n|$)`, 'i');
      const match = message.match(regex);
      return match ? match[1].trim() : null;
    };

    const anmeldungDurch = message.includes('(durch Betreuer:in)') ? 'betreuer' : 'selbst';
    
    // Parse Betreuer-Daten
    let betreuerData = null;
    const betreuerMatch = message.match(/Betreuer:\s*([^,]+),\s*Email:\s*([^,]+),\s*Tel:\s*(.+?)(?:\n|$)/);
    if (betreuerMatch) {
      betreuerData = {
        name: betreuerMatch[1].trim(),
        email: betreuerMatch[2].trim(),
        telefon: betreuerMatch[3].trim(),
      };
    }

    // Parse Kontaktperson
    let kontaktperson = null;
    const kontaktpersonMatch = message.match(/Kontaktperson:\s*([^,]+),\s*Tel:\s*(.+?)(?:\n|$)/);
    if (kontaktpersonMatch) {
      kontaktperson = {
        name: kontaktpersonMatch[1].trim(),
        telefon: kontaktpersonMatch[2].trim(),
      };
    }

    // Parse TIXI-Taxi
    let tixiAdresse = null;
    const tixiMatch = message.match(/TIXI-Taxi:\s*Ja,\s*Adresse:\s*(.+?)(?:\n|$)/);
    if (tixiMatch) {
      tixiAdresse = tixiMatch[1].trim();
    }

    // Parse Betreuer benötigt
    let vipBetreuer = null;
    const vipBetreuerMatch = message.match(/Betreuer benötigt:\s*Ja,\s*Name:\s*([^,]+),\s*Tel:\s*(.+?)(?:\n|$)/);
    if (vipBetreuerMatch) {
      vipBetreuer = {
        name: vipBetreuerMatch[1].trim(),
        telefon: vipBetreuerMatch[2].trim(),
      };
    }

    // Strukturierte VIP-Daten
    const vipData = {
      first_name: firstName,
      last_name: lastName,
      email: body.email,
      phone: body.phone || null,
      event_date: body.event_date || null,
      event_location: body.event_location || null,
      anmeldung_durch: anmeldungDurch,
      alter: parseField('Alter'),
      iv_ausweis: parseField('IV-Ausweis'),
      beeintraechtigung: parseField('Beeinträchtigung'),
      ankunftszeit: parseField('Ankunftszeit'),
      tixi_taxi: message.includes('TIXI-Taxi: Ja') ? 'Ja' : 'Nein',
      tixi_adresse: tixiAdresse,
      vip_braucht_betreuer: message.includes('Betreuer benötigt: Ja') ? 'Ja' : 'Nein',
      vip_betreuer_name: vipBetreuer?.name || null,
      vip_betreuer_telefon: vipBetreuer?.telefon || null,
      anmeldung_betreuer_name: betreuerData?.name || null,
      anmeldung_betreuer_email: betreuerData?.email || null,
      anmeldung_betreuer_telefon: betreuerData?.telefon || null,
      kontaktperson_name: kontaktperson?.name || null,
      kontaktperson_telefon: kontaktperson?.telefon || null,
      besondere_beduerfnisse: parseField('Besondere Bedürfnisse') || body.special_requirements || null,
      original_message: body.message,
    };

    // === 1. JSON-Fallback (bestehend) ===
    try {
      await insertVipRegistration(vipData);
      console.log('✅ VIP in JSON gespeichert');
    } catch (jsonErr) {
      console.warn('⚠️ JSON-Speicherung fehlgeschlagen:', jsonErr);
    }

    // === 2. PostgreSQL CRM (NEU) ===
    try {
      // VIP als Kontakt erstellen
      const contactId = await upsertContact({
        first_name: firstName,
        last_name: lastName,
        email: body.email,
        phone: body.phone || null,
        has_disability: vipData.beeintraechtigung === 'Ja' || true,
        has_iv_card: vipData.iv_ausweis === 'Ja',
        special_needs: vipData.besondere_beduerfnisse,
        categories: ['vip'],
        source: 'vip_form',
      });

      // Betreuer als eigenen Kontakt anlegen (falls vorhanden)
      let caregiverId = null;
      if (anmeldungDurch === 'betreuer' && betreuerData?.email) {
        const betreuerNames = betreuerData.name.split(' ');
        caregiverId = await upsertContact({
          first_name: betreuerNames[0] || betreuerData.name,
          last_name: betreuerNames.slice(1).join(' ') || '',
          email: betreuerData.email,
          phone: betreuerData.telefon || null,
          categories: ['betreuer'],
          source: 'vip_form',
        });
      }

      // Ankunftszeit normalisieren
      let arrivalTime = vipData.ankunftszeit;
      if (arrivalTime && !['13-17', '17-21', 'ganze-zeit'].includes(arrivalTime)) {
        arrivalTime = null;
      }

      // VIP-Registrierung in PostgreSQL
      await query(`
        INSERT INTO vip_registrations (
          contact_id, registration_type, caregiver_id,
          event_date, event_location, arrival_time,
          tixi_taxi, tixi_address,
          needs_caregiver, caregiver_name, caregiver_phone,
          emergency_contact_name, emergency_contact_phone,
          status, raw_data
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      `, [
        contactId,
        anmeldungDurch === 'betreuer' ? 'caregiver' : 'self',
        caregiverId,
        vipData.event_date || null,
        vipData.event_location || null,
        arrivalTime,
        vipData.tixi_taxi === 'Ja',
        vipData.tixi_adresse || null,
        vipData.vip_braucht_betreuer === 'Ja',
        vipData.vip_betreuer_name || null,
        vipData.vip_betreuer_telefon || null,
        vipData.kontaktperson_name || null,
        vipData.kontaktperson_telefon || null,
        'pending',
        JSON.stringify(vipData),
      ]);

      console.log('✅ VIP in PostgreSQL/CRM gespeichert');
    } catch (pgErr) {
      console.error('⚠️ PostgreSQL-Speicherung fehlgeschlagen:', pgErr);
      // Fehler nicht weiterwerfen – JSON ist Fallback
    }

    const fullName = `${firstName} ${lastName}`;

    // E-Mail-Versand (unverändert)
    try {
      const confirmResult = await sendVIPConfirmation(body.email, fullName, body.event_date, body.event_location);
      if (confirmResult.error) console.error('⚠️ VIP-Bestätigung Fehler:', confirmResult.error);
      else console.log('✅ VIP-Bestätigung versendet an:', body.email);
    } catch (emailError) {
      console.error('❌ VIP-Bestätigung Fehler:', emailError);
    }

    try {
      const notificationResult = await sendVIPNotification({
        name: fullName, email: body.email, phone: body.phone,
        company: body.company, numberOfGuests: body.guests,
        eventDate: body.event_date, eventLocation: body.event_location,
        eventType: body.event_type, message: body.message,
        specialRequirements: body.special_requirements,
        sourceUrl: body.sourceUrl, utmSource: body.utmSource,
        utmMedium: body.utmMedium, utmCampaign: body.utmCampaign,
      });
      if (notificationResult.error) console.error('⚠️ VIP-Benachrichtigung Fehler:', notificationResult.error);
      else console.log('✅ VIP-Benachrichtigung versendet');
    } catch (emailError) {
      console.error('❌ VIP-Benachrichtigung Fehler:', emailError);
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
