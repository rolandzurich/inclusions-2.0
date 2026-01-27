# Environment-Variablen Übersicht

## Aktuell auf dem Server gesetzt:
```bash
NEXT_PUBLIC_SITE_URL=http://10.55.55.155
```

## Alle benötigten Environment-Variablen:

### ✅ Erforderlich für Basis-Funktionalität:
- `NEXT_PUBLIC_SITE_URL` - Base URL der Website (✅ gesetzt: `http://10.55.55.155`)

### 📧 E-Mail-Versand (Resend):
- `RESEND_API_KEY` - Resend API Key für E-Mail-Versand
- `RESEND_FROM_EMAIL` - Absender-E-Mail (Optional, Default: `noreply@inclusions.zone`)
- `RESEND_ADMIN_EMAIL` - Admin-E-Mail für Benachrichtigungen (Optional, Default: `info@inclusions.zone`)

### 🗄️ Datenbank (Supabase):
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase URL (Optional, Default: `http://localhost:3001`)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase Anon Key (Optional)
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase Service Role Key (Optional, für Admin-Operationen)

### 📊 Analytics (Umami):
- `NEXT_PUBLIC_UMAMI_URL` - Umami Analytics URL (Optional)
- `NEXT_PUBLIC_UMAMI_WEBSITE_ID` - Umami Website ID (Optional)

### 🤖 KI-Features (Gemini):
- `GEMINI_API_KEY` - Google Gemini API Key (Optional, für Chat-Features)

### 📊 Google Sheets Integration:
- `GOOGLE_SHEETS_CREDENTIALS` - Google Sheets Credentials als JSON String (Optional)
- `GOOGLE_SHEET_CONTACT_REQUESTS` - Spreadsheet ID für Kontaktanfragen (Optional)
- `GOOGLE_SHEET_NEWSLETTER` - Spreadsheet ID für Newsletter (Optional)
- `GOOGLE_SHEET_VIP` - Spreadsheet ID für VIP-Anmeldungen (Optional)

### 🐛 Debug:
- `NEXT_PUBLIC_AGENT_DEBUG` - Debug-Modus (Optional, setze auf `"1"` zum Aktivieren)

## Prüfung auf dem Server:

```bash
# Prüfe welche Variablen gesetzt sind
./ssh-exec.sh "cd ~/inclusions-2.0 && env | grep -E 'NEXT_PUBLIC|RESEND|SUPABASE|UMAMI|GEMINI|GOOGLE|AGENT' | sort"
```
