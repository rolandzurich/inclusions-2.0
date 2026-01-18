import { google } from 'googleapis';

// Google Sheets Konfiguration
const GOOGLE_SHEETS_CREDENTIALS = process.env.GOOGLE_SHEETS_CREDENTIALS; // JSON String oder undefined
const GOOGLE_SHEET_CONTACT_REQUESTS = process.env.GOOGLE_SHEET_CONTACT_REQUESTS || ''; // Spreadsheet ID
const GOOGLE_SHEET_NEWSLETTER = process.env.GOOGLE_SHEET_NEWSLETTER || ''; // Spreadsheet ID
const GOOGLE_SHEET_VIP = process.env.GOOGLE_SHEET_VIP || ''; // Spreadsheet ID

// Google Sheets Client initialisieren
function getSheetsClient() {
  if (!GOOGLE_SHEETS_CREDENTIALS) {
    console.warn('⚠️ GOOGLE_SHEETS_CREDENTIALS nicht gesetzt. Google Sheets Export wird übersprungen.');
    return null;
  }

  try {
    const credentials = JSON.parse(GOOGLE_SHEETS_CREDENTIALS);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    return google.sheets({ version: 'v4', auth });
  } catch (error) {
    console.error('❌ Fehler beim Initialisieren von Google Sheets:', error);
    return null;
  }
}

// Helper: Erstelle Header-Zeile, falls Sheet leer ist
async function ensureHeaders(
  sheets: any,
  spreadsheetId: string,
  sheetName: string,
  headers: string[]
) {
  try {
    // Prüfe ob Sheet existiert und ob erste Zeile leer ist
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A1:Z1`,
    });

    const existingHeaders = response.data.values?.[0];
    
    // Wenn keine Header vorhanden, erstelle sie
    if (!existingHeaders || existingHeaders.length === 0) {
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${sheetName}!A1`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [headers],
        },
      });
      console.log(`✅ Header für ${sheetName} erstellt`);
    }
  } catch (error: any) {
    // Wenn Sheet nicht existiert, erstelle es und füge Header hinzu
    if (error.code === 400 || error.message?.includes('Unable to parse range')) {
      try {
        await sheets.spreadsheets.values.append({
          spreadsheetId,
          range: `${sheetName}!A1`,
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [headers],
          },
        });
        console.log(`✅ Sheet ${sheetName} erstellt mit Headern`);
      } catch (createError) {
        console.error(`❌ Fehler beim Erstellen von Sheet ${sheetName}:`, createError);
      }
    } else {
      console.error(`❌ Fehler beim Prüfen von Headern für ${sheetName}:`, error);
    }
  }
}

// Helper: Füge Zeile zu Google Sheet hinzu
async function appendRow(
  spreadsheetId: string,
  sheetName: string,
  values: (string | number | null | undefined)[]
) {
  if (!spreadsheetId) {
    console.warn(`⚠️ Spreadsheet ID für ${sheetName} nicht gesetzt`);
    return { success: false, error: 'Spreadsheet ID nicht gesetzt' };
  }

  const sheets = getSheetsClient();
  if (!sheets) {
    return { success: false, error: 'Google Sheets Client nicht verfügbar' };
  }

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:Z`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [values],
      },
    });

    console.log(`✅ Zeile zu ${sheetName} hinzugefügt`);
    return { success: true };
  } catch (error) {
    console.error(`❌ Fehler beim Hinzufügen zu ${sheetName}:`, error);
    return { success: false, error: error instanceof Error ? error.message : 'Unbekannter Fehler' };
  }
}

// ============================================
// Contact Requests / Booking
// ============================================
export async function addContactRequestToSheet(data: {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone?: string | null;
  message?: string | null;
  booking_type?: string | null;
  booking_item?: string | null;
  event_date?: string | null;
  event_location?: string | null;
  event_type?: string | null;
  source_url?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  ip_address?: string | null;
  status?: string;
}) {
  if (!GOOGLE_SHEET_CONTACT_REQUESTS) {
    return { success: false, error: 'GOOGLE_SHEET_CONTACT_REQUESTS nicht konfiguriert' };
  }

  const sheets = getSheetsClient();
  if (!sheets) {
    return { success: false, error: 'Google Sheets Client nicht verfügbar' };
  }

  const sheetName = 'Kontaktanfragen';
  const headers = [
    'ID',
    'Erstellt am',
    'Name',
    'E-Mail',
    'Telefon',
    'Nachricht',
    'Buchungstyp',
    'Gebuchtes Item',
    'Event-Datum',
    'Event-Ort',
    'Event-Typ',
    'Quelle (URL)',
    'UTM Source',
    'UTM Medium',
    'UTM Campaign',
    'IP-Adresse',
    'Status',
  ];

  // Header sicherstellen
  await ensureHeaders(sheets, GOOGLE_SHEET_CONTACT_REQUESTS, sheetName, headers);

  // Werte für Zeile
  const values = [
    data.id,
    data.created_at,
    data.name,
    data.email,
    data.phone || '',
    data.message || '',
    data.booking_type || '',
    data.booking_item || '',
    data.event_date || '',
    data.event_location || '',
    data.event_type || '',
    data.source_url || '',
    data.utm_source || '',
    data.utm_medium || '',
    data.utm_campaign || '',
    data.ip_address || '',
    data.status || 'new',
  ];

  return await appendRow(GOOGLE_SHEET_CONTACT_REQUESTS, sheetName, values);
}

// ============================================
// Newsletter Subscribers
// ============================================
export async function addNewsletterSubscriberToSheet(data: {
  id: string;
  created_at: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  has_disability?: boolean | null;
  interests?: string[] | null;
  source_url?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  opt_in_confirmed_at?: string | null;
  status?: string;
}) {
  if (!GOOGLE_SHEET_NEWSLETTER) {
    return { success: false, error: 'GOOGLE_SHEET_NEWSLETTER nicht konfiguriert' };
  }

  const sheets = getSheetsClient();
  if (!sheets) {
    return { success: false, error: 'Google Sheets Client nicht verfügbar' };
  }

  const sheetName = 'Newsletter';
  const headers = [
    'ID',
    'Erstellt am',
    'E-Mail',
    'Vorname',
    'Nachname',
    'Menschen mit Beeinträchtigung',
    'Interessen',
    'Quelle (URL)',
    'UTM Source',
    'UTM Medium',
    'UTM Campaign',
    'Bestätigt am',
    'Status',
  ];

  // Header sicherstellen
  await ensureHeaders(sheets, GOOGLE_SHEET_NEWSLETTER, sheetName, headers);

  // Werte für Zeile
  const values = [
    data.id,
    data.created_at,
    data.email,
    data.first_name || '',
    data.last_name || '',
    data.has_disability ? 'Ja' : 'Nein',
    data.interests?.join(', ') || '',
    data.source_url || '',
    data.utm_source || '',
    data.utm_medium || '',
    data.utm_campaign || '',
    data.opt_in_confirmed_at || '',
    data.status || 'pending',
  ];

  return await appendRow(GOOGLE_SHEET_NEWSLETTER, sheetName, values);
}

// ============================================
// VIP Registrations
// ============================================
export async function addVIPRegistrationToSheet(data: {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone?: string | null;
  event_date?: string | null;
  event_location?: string | null;
  event_type?: string | null;
  message?: string | null;
  company?: string | null;
  number_of_guests?: number | null;
  special_requirements?: string | null;
  source_url?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  ip_address?: string | null;
  status?: string;
}) {
  if (!GOOGLE_SHEET_VIP) {
    return { success: false, error: 'GOOGLE_SHEET_VIP nicht konfiguriert' };
  }

  const sheets = getSheetsClient();
  if (!sheets) {
    return { success: false, error: 'Google Sheets Client nicht verfügbar' };
  }

  const sheetName = 'VIP-Anmeldungen';
  const headers = [
    'ID',
    'Erstellt am',
    'Name',
    'E-Mail',
    'Telefon',
    'Event-Datum',
    'Event-Ort',
    'Event-Typ',
    'Nachricht',
    'Firma',
    'Anzahl Gäste',
    'Besondere Anforderungen',
    'Quelle (URL)',
    'UTM Source',
    'UTM Medium',
    'UTM Campaign',
    'IP-Adresse',
    'Status',
  ];

  // Header sicherstellen
  await ensureHeaders(sheets, GOOGLE_SHEET_VIP, sheetName, headers);

  // Werte für Zeile
  const values = [
    data.id,
    data.created_at,
    data.name,
    data.email,
    data.phone || '',
    data.event_date || '',
    data.event_location || '',
    data.event_type || '',
    data.message || '',
    data.company || '',
    data.number_of_guests?.toString() || '',
    data.special_requirements || '',
    data.source_url || '',
    data.utm_source || '',
    data.utm_medium || '',
    data.utm_campaign || '',
    data.ip_address || '',
    data.status || 'new',
  ];

  return await appendRow(GOOGLE_SHEET_VIP, sheetName, values);
}
