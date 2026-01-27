# Environment-Variablen Checkliste für Server

## ✅ Aktuell auf dem Server gesetzt:
```bash
NEXT_PUBLIC_SITE_URL=http://10.55.55.155
```

## 📋 Vollständige Liste aller Environment-Variablen:

### 🔴 Erforderlich (App funktioniert ohne, aber Features fehlen):

1. **NEXT_PUBLIC_SITE_URL** ✅
   - **Status:** Gesetzt (`http://10.55.55.155`)
   - **Verwendung:** Base URL für Schema.org, Links, etc.
   - **Wichtig:** ✅ Bereits gesetzt

### 🟡 Optional aber empfohlen:

2. **RESEND_API_KEY**
   - **Status:** ❌ Nicht gesetzt
   - **Verwendung:** E-Mail-Versand (Newsletter, Kontaktformulare, VIP-Anmeldungen)
   - **Impact:** E-Mails werden nicht versendet, Formulare funktionieren aber
   - **Wo:** `lib/resend.ts`

3. **RESEND_FROM_EMAIL**
   - **Status:** ❌ Nicht gesetzt (hat Default: `noreply@inclusions.zone`)
   - **Verwendung:** Absender-E-Mail für alle E-Mails
   - **Impact:** Kein - verwendet Default

4. **RESEND_ADMIN_EMAIL**
   - **Status:** ❌ Nicht gesetzt (hat Default: `info@inclusions.zone`)
   - **Verwendung:** Empfänger für Benachrichtigungen
   - **Impact:** Kein - verwendet Default

### 🟢 Optional (Features funktionieren ohne):

5. **NEXT_PUBLIC_SUPABASE_URL**
   - **Status:** ❌ Nicht gesetzt (hat Default: `http://localhost:3001`)
   - **Verwendung:** Supabase Datenbankverbindung
   - **Impact:** Datenbank-Features funktionieren nicht

6. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - **Status:** ❌ Nicht gesetzt
   - **Verwendung:** Supabase öffentlicher Key
   - **Impact:** Datenbank-Features funktionieren nicht

7. **SUPABASE_SERVICE_ROLE_KEY**
   - **Status:** ❌ Nicht gesetzt
   - **Verwendung:** Supabase Admin-Operationen (Rate Limiting, etc.)
   - **Impact:** Admin-Features funktionieren nicht

8. **NEXT_PUBLIC_UMAMI_URL**
   - **Status:** ❌ Nicht gesetzt
   - **Verwendung:** Umami Analytics URL
   - **Impact:** Analytics werden nicht geladen

9. **NEXT_PUBLIC_UMAMI_WEBSITE_ID**
   - **Status:** ❌ Nicht gesetzt
   - **Verwendung:** Umami Website ID
   - **Impact:** Analytics werden nicht geladen

10. **GEMINI_API_KEY**
    - **Status:** ❌ Nicht gesetzt
    - **Verwendung:** Google Gemini für Chat-Features (INCLUSI)
    - **Impact:** Chat-Features funktionieren nicht

11. **GOOGLE_SHEETS_CREDENTIALS**
    - **Status:** ❌ Nicht gesetzt
    - **Verwendung:** Google Sheets Integration (JSON String)
    - **Impact:** Google Sheets Export funktioniert nicht

12. **GOOGLE_SHEET_CONTACT_REQUESTS**
    - **Status:** ❌ Nicht gesetzt
    - **Verwendung:** Spreadsheet ID für Kontaktanfragen
    - **Impact:** Kein Export zu Google Sheets

13. **GOOGLE_SHEET_NEWSLETTER**
    - **Status:** ❌ Nicht gesetzt
    - **Verwendung:** Spreadsheet ID für Newsletter
    - **Impact:** Kein Export zu Google Sheets

14. **GOOGLE_SHEET_VIP**
    - **Status:** ❌ Nicht gesetzt
    - **Verwendung:** Spreadsheet ID für VIP-Anmeldungen
    - **Impact:** Kein Export zu Google Sheets

15. **NEXT_PUBLIC_AGENT_DEBUG**
    - **Status:** ❌ Nicht gesetzt
    - **Verwendung:** Debug-Modus aktivieren (setze auf `"1"`)
    - **Impact:** Debug-Features sind deaktiviert

## 🔧 Empfohlene .env Datei für Server:

```bash
# Basis-URL (bereits gesetzt)
NEXT_PUBLIC_SITE_URL=http://10.55.55.155

# E-Mail-Versand (wenn benötigt)
# RESEND_API_KEY=re_...
# RESEND_FROM_EMAIL=noreply@inclusions.zone
# RESEND_ADMIN_EMAIL=info@inclusions.zone

# Datenbank (wenn Supabase verwendet wird)
# NEXT_PUBLIC_SUPABASE_URL=https://...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
# SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Analytics (wenn Umami verwendet wird)
# NEXT_PUBLIC_UMAMI_URL=https://...
# NEXT_PUBLIC_UMAMI_WEBSITE_ID=...

# KI-Features (wenn Chat aktiviert werden soll)
# GEMINI_API_KEY=...

# Google Sheets (wenn Export benötigt wird)
# GOOGLE_SHEETS_CREDENTIALS={"type":"service_account",...}
# GOOGLE_SHEET_CONTACT_REQUESTS=...
# GOOGLE_SHEET_NEWSLETTER=...
# GOOGLE_SHEET_VIP=...

# Debug (optional)
# NEXT_PUBLIC_AGENT_DEBUG=1
```

## ✅ Fazit:

**Für die Basis-Funktionalität der Website:**
- ✅ `NEXT_PUBLIC_SITE_URL` ist gesetzt - **ausreichend!**

**Für vollständige Funktionalität sollten zusätzlich gesetzt werden:**
- 🔴 `RESEND_API_KEY` - wenn E-Mail-Versand benötigt wird
- 🟡 `GEMINI_API_KEY` - wenn Chat-Features (INCLUSI) aktiviert werden sollen
- 🟢 Alle anderen sind optional und haben Defaults oder werden einfach nicht verwendet

Die App funktioniert aktuell mit nur `NEXT_PUBLIC_SITE_URL`, aber einige Features (E-Mail, Chat, Analytics) sind deaktiviert.
