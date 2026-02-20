# Launch-Vorbereitung: Strukturierter Plan

## Ziel: Vollständige Test-Vorbereitung vor Launch auf inclusions.zone

**Zeitaufwand gesamt:** ~4-6 Stunden (verteilt über mehrere Tage möglich)

---

## Phase 1: Basis-Konfiguration ✅ (Bereits erledigt)

**Zeitaufwand:** 30 Minuten  
**Status:** ✅ Abgeschlossen

- [x] Server-Konfiguration (Nginx, Firewall)
- [x] Next.js App läuft
- [x] Environment Variables vorbereitet (.env.production)

---

## Phase 2: Voice Agent (INCLUSI) 🎤

**Zeitaufwand:** 15 Minuten  
**Status:** ⏳ Bereit zur Aktivierung

### Was zu tun ist:

1. **Environment Variable prüfen** (automatisch)
   - `GEMINI_API_KEY` muss auf Server vorhanden sein
   - ✅ Bereits in `.env.production`: `AIzaSyBzJoEimC2cpaNIibF103zrZaPSFWZWdWg`

2. **Auf Server kopieren und App neu starten** (automatisch)
   - Skript kopiert `.env.production` → Server `.env`
   - App wird automatisch neu gestartet

3. **Testen**
   - Seite öffnen: `http://10.55.55.155`
   - Voice Agent Button klicken
   - Mikrofon-Zugriff erlauben
   - Frage stellen (z.B. "Wann ist das nächste Event?")
   - ✅ Erwartung: Antwort wird gesprochen

### Automatisches Skript:
```bash
./setup-voice-agent.sh
```

---

## Phase 3: Bilder korrekt anzeigen 🖼️

**Zeitaufwand:** 30 Minuten  
**Status:** ⏳ Prüfung nötig

### Problem-Analyse:
- Bilder werden über Next.js `<Image>` Komponente geladen
- Pfade: `/images/...` (aus `public/images/`)
- Problem: Absolute URLs in Schema.org könnten falsch sein

### Was zu tun ist:

1. **NEXT_PUBLIC_SITE_URL prüfen** (automatisch)
   - ✅ Bereits gesetzt: `http://10.55.55.155`

2. **Bilder-Test durchführen** (manuell)
   - Seite öffnen: `http://10.55.55.155`
   - Verschiedene Seiten prüfen:
     - Homepage (Hero-Bild)
     - DJs-Seite (DJ-Fotos)
     - Rückblick-Seite (Event-Fotos)
   - Browser DevTools → Network Tab → Prüfe ob Bilder laden (Status 200)

3. **Falls Bilder nicht laden:**
   - Prüfe Nginx-Logs: `sudo tail -f /var/log/nginx/inclusions-error.log`
   - Prüfe ob `/images/` korrekt weitergeleitet wird

### Automatisches Prüf-Skript:
```bash
./check-images.sh
```

---

## Phase 4: Formulare - E-Mail-Versand 📧

**Zeitaufwand:** 45 Minuten  
**Status:** ⏳ Konfiguration nötig

### Was zu tun ist:

1. **Resend API Key prüfen** (automatisch)
   - ✅ Bereits vorhanden: `re_an8y4Hrw_J5bcb33jndu9cb2avtyd87vB`
   - ✅ From Email: `noreply@inclusions.zone`
   - ✅ Admin Email: `info@inclusions.zone`

2. **Resend Domain-Verifizierung** (manuell - einmalig)
   - Gehe zu: https://resend.com/domains
   - Füge Domain hinzu: `inclusions.zone`
   - Füge DNS-Records hinzu (SPF, DKIM, DMARC)
   - ⚠️ **Wichtig:** Domain muss verifiziert sein, sonst landen E-Mails im Spam

3. **Test-E-Mail senden** (automatisch)
   - Skript sendet Test-E-Mail an `info@inclusions.zone`
   - Prüfe Postfach

4. **Formular testen** (manuell)
   - Formular ausfüllen (z.B. Booking-Formular)
   - ✅ Erwartung:
     - Bestätigungs-E-Mail an User
     - Notification-E-Mail an `info@inclusions.zone`

### Automatisches Skript:
```bash
./setup-email.sh
./test-email.sh
```

---

## Phase 5: Datenbank - Lokale PostgreSQL statt Supabase 💾

**Zeitaufwand:** 2-3 Stunden  
**Status:** 🔴 Muss implementiert werden

### Aktuelle Situation:
- Code verwendet Supabase Client (`lib/supabase.ts`)
- Formulare speichern in Supabase-Tabellen
- **Ziel:** Direkte PostgreSQL-Verbindung ohne Supabase

### Was zu tun ist:

1. **PostgreSQL auf Server installieren** (automatisch)
   ```bash
   sudo apt-get update
   sudo apt-get install postgresql postgresql-contrib
   ```

2. **Datenbank erstellen** (automatisch)
   - Datenbank: `inclusions`
   - User: `inclusions_user`
   - Passwort: Generiert automatisch

3. **Schema erstellen** (automatisch)
   - Tabellen: `contact_requests`, `newsletter_subscribers`, `vip_registrations`
   - Migrationen aus `backend/supabase/migrations/` verwenden

4. **Code anpassen** (automatisch)
   - `lib/db-direct.ts` erweitern/erstellen
   - API Routes anpassen (`app/api/contact/route.ts`, etc.)
   - Supabase-Abhängigkeiten entfernen

5. **Environment Variables setzen** (automatisch)
   - `DATABASE_URL=postgresql://inclusions_user:password@localhost:5432/inclusions`

6. **Testen** (manuell)
   - Formular ausfüllen
   - Prüfe Datenbank: `psql -U inclusions_user -d inclusions -c "SELECT * FROM contact_requests;"`

### Automatisches Skript:
```bash
./setup-local-database.sh
```

---

## Phase 6: Google Sheets Integration 📊

**Zeitaufwand:** 1 Stunde  
**Status:** ⏳ Konfiguration nötig

### Was zu tun ist:

1. **Google Service Account erstellen** (manuell - einmalig)
   - Gehe zu: https://console.cloud.google.com/
   - Erstelle Service Account
   - Lade JSON-Credentials herunter
   - ⚠️ **Wichtig:** JSON-Datei sicher aufbewahren

2. **Google Sheets erstellen** (manuell)
   - Erstelle 3 Sheets:
     - "Kontaktanfragen" (für Booking/Contact)
     - "Newsletter" (für Newsletter-Anmeldungen)
     - "VIP-Anmeldungen" (für VIP-Registrierungen)
   - Teile Sheets mit Service Account E-Mail (Lese-/Schreibrechte)

3. **Environment Variables setzen** (automatisch)
   - `GOOGLE_SHEETS_CREDENTIALS` (kompletter JSON-String)
   - `GOOGLE_SHEET_CONTACT_REQUESTS` (Spreadsheet ID)
   - `GOOGLE_SHEET_NEWSLETTER` (Spreadsheet ID)
   - `GOOGLE_SHEET_VIP` (Spreadsheet ID)

4. **Testen** (manuell)
   - Formular ausfüllen
   - Prüfe ob Daten in Google Sheet erscheinen

### Automatisches Skript:
```bash
./setup-google-sheets.sh
```

---

## Zusammenfassung: Automatische Workflows

### Workflow 1: Komplette Einrichtung (alle Phasen)
```bash
./setup-complete.sh
```
**Zeitaufwand:** ~4-6 Stunden (inkl. manuelle Schritte)

### Workflow 2: Schnell-Test (nur Phase 2-3)
```bash
./setup-quick-test.sh
```
**Zeitaufwand:** ~45 Minuten

### Workflow 3: Schritt-für-Schritt
```bash
./setup-voice-agent.sh    # Phase 2
./check-images.sh         # Phase 3
./setup-email.sh          # Phase 4
./setup-local-database.sh # Phase 5
./setup-google-sheets.sh  # Phase 6
```

---

## Checkliste vor Launch

- [ ] Voice Agent funktioniert
- [ ] Alle Bilder werden korrekt angezeigt
- [ ] Formulare senden Bestätigungs-E-Mails
- [ ] Formulare senden Admin-Notifications
- [ ] Daten werden in lokaler Datenbank gespeichert
- [ ] Daten werden in Google Sheets geschrieben
- [ ] Alle Tests ohne VPN durchgeführt
- [ ] Domain inclusions.zone vorbereitet (DNS, SSL)

---

## Nächste Schritte

1. **Sofort:** Phase 2 & 3 testen (Voice Agent + Bilder)
2. **Heute:** Phase 4 einrichten (E-Mail)
3. **Diese Woche:** Phase 5 implementieren (lokale DB)
4. **Vor Launch:** Phase 6 einrichten (Google Sheets)

**Ich erstelle jetzt die automatischen Skripte für alle Phasen.**
