/**
 * Google Sheets Integration für Booking-Anfragen
 */

import { google } from 'googleapis';

const SHEET_ID = process.env.GOOGLE_SHEETS_BOOKING_ID || '';
const CREDENTIALS = process.env.GOOGLE_SHEETS_CREDENTIALS ? JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS) : null;

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

export async function writeBookingToSheets(bookingData: any) {
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

    const row = [
      new Date(bookingData.created_at).toLocaleString('de-CH'),
      bookingData.name || '',
      bookingData.email || '',
      bookingData.phone || '',
      bookingData.booking_type || '',
      bookingData.booking_item || '',
      bookingData.event_date || '',
      bookingData.event_location || '',
      bookingData.event_type || '',
      bookingData.message || '',
      bookingData.status || 'new',
    ];

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Booking-Anfragen!A:K',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [row],
      },
    });

    console.log('✅ Booking-Daten in Google Sheets geschrieben');
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Fehler beim Schreiben in Google Sheets:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}
