/**
 * Google Sheets Integration für Newsletter-Abonnenten
 */

import { google } from 'googleapis';

const SHEET_ID = process.env.GOOGLE_SHEETS_NEWSLETTER_ID || '';
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

export async function writeNewsletterToSheets(subscriberData: any) {
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
      new Date(subscriberData.created_at).toLocaleString('de-CH'),
      subscriberData.email || '',
      subscriberData.first_name || '',
      subscriberData.last_name || '',
      subscriberData.has_disability ? 'Ja' : 'Nein',
      Array.isArray(subscriberData.interests) ? subscriberData.interests.join(', ') : '',
      subscriberData.status || 'pending',
      subscriberData.opt_in_confirmed_at ? new Date(subscriberData.opt_in_confirmed_at).toLocaleString('de-CH') : '',
    ];

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Newsletter!A:H',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [row],
      },
    });

    console.log('✅ Newsletter-Daten in Google Sheets geschrieben');
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Fehler beim Schreiben in Google Sheets:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}
