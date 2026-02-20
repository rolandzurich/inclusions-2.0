/**
 * Google Sheets Integration für VIP-Anmeldungen
 * Automatisches Schreiben von VIP-Daten in Google Sheets
 */

import { google } from 'googleapis';

const SHEET_ID = process.env.GOOGLE_SHEETS_VIP_ID || '';
const CREDENTIALS = process.env.GOOGLE_SHEETS_CREDENTIALS ? JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS) : null;

/**
 * Authentifizierung mit Google Sheets API
 */
async function getAuthClient() {
  if (!CREDENTIALS) {
    console.warn('Google Sheets Credentials nicht konfiguriert');
    return null;
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: CREDENTIALS,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    return await auth.getClient();
  } catch (error) {
    console.error('Google Auth Fehler:', error);
    return null;
  }
}

/**
 * Schreibt eine VIP-Anmeldung in Google Sheets
 */
export async function writeVIPToSheets(vipData: any) {
  try {
    if (!SHEET_ID) {
      console.log('Google Sheets ID nicht konfiguriert - überspringe Sheets-Update');
      return { success: false, error: 'Nicht konfiguriert' };
    }

    const authClient = await getAuthClient();
    if (!authClient) {
      return { success: false, error: 'Authentifizierung fehlgeschlagen' };
    }

    const sheets = google.sheets({ version: 'v4', auth: authClient as any });

    // Formatiere die Daten für Google Sheets
    const row = [
      new Date(vipData.created_at).toLocaleString('de-CH'),
      vipData.first_name || '',
      vipData.last_name || '',
      vipData.email || '',
      vipData.phone || '',
      vipData.alter || '',
      vipData.iv_ausweis || '',
      vipData.beeintraechtigung || '',
      vipData.event_date || '',
      vipData.event_location || '',
      vipData.ankunftszeit || '',
      vipData.tixi_taxi || 'Nein',
      vipData.tixi_adresse || '',
      vipData.vip_braucht_betreuer || 'Nein',
      vipData.vip_betreuer_name || '',
      vipData.vip_betreuer_telefon || '',
      vipData.anmeldung_durch === 'betreuer' ? 'Betreuer:in' : 'Selbst',
      vipData.anmeldung_betreuer_name || '',
      vipData.anmeldung_betreuer_email || '',
      vipData.anmeldung_betreuer_telefon || '',
      vipData.kontaktperson_name || '',
      vipData.kontaktperson_telefon || '',
      vipData.besondere_beduerfnisse || '',
      vipData.status || 'pending',
    ];

    // Schreibe in Google Sheets (füge neue Zeile hinzu)
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'VIP-Anmeldungen!A:X', // A bis X (24 Spalten)
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [row],
      },
    });

    console.log('✅ VIP-Daten in Google Sheets geschrieben:', response.data.updates?.updatedRows || 0, 'Zeile(n)');
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Fehler beim Schreiben in Google Sheets:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Erstellt die Header-Zeile in Google Sheets (einmalig ausführen)
 */
export async function createVIPSheetsHeader() {
  try {
    if (!SHEET_ID) {
      return { success: false, error: 'Sheet ID nicht konfiguriert' };
    }

    const authClient = await getAuthClient();
    if (!authClient) {
      return { success: false, error: 'Authentifizierung fehlgeschlagen' };
    }

    const sheets = google.sheets({ version: 'v4', auth: authClient as any });

    const headers = [
      'Erstellt am',
      'Vorname',
      'Nachname',
      'E-Mail',
      'Telefon',
      'Alter',
      'IV-Ausweis',
      'Beeinträchtigung',
      'Event-Datum',
      'Event-Ort',
      'Ankunftszeit',
      'TIXI-Taxi',
      'TIXI-Adresse',
      'Benötigt 1-zu-1 Betreuer',
      'Betreuer Name',
      'Betreuer Telefon',
      'Angemeldet durch',
      'Anmeldungs-Betreuer Name',
      'Anmeldungs-Betreuer E-Mail',
      'Anmeldungs-Betreuer Telefon',
      'Kontaktperson Name',
      'Kontaktperson Telefon',
      'Besondere Bedürfnisse',
      'Status',
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: 'VIP-Anmeldungen!A1:X1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [headers],
      },
    });

    console.log('✅ Google Sheets Header erstellt');
    return { success: true };
  } catch (error) {
    console.error('❌ Fehler beim Erstellen des Headers:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}
