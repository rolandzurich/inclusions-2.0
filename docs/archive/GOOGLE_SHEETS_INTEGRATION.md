# Google Sheets Integration - Automatische Datenübertragung 📊

## Übersicht

Alle Formulareinträge werden **automatisch** in vorbereitete Google Sheets geschrieben:
- ✅ **VIP-Anmeldungen** → Google Sheet
- ✅ **Booking-Anfragen** → Google Sheet
- ✅ **Newsletter-Abonnenten** → Google Sheet

---

## 🚀 Schnellstart

### Schritt 1: Google Cloud Projekt erstellen

1. Gehe zu: https://console.cloud.google.com/
2. Erstelle ein neues Projekt (z.B. "Inclusions Forms")
3. Aktiviere die **Google Sheets API**
4. Erstelle einen **Service Account**:
   - IAM & Admin → Service Accounts → Create Service Account
   - Name: "inclusions-sheets-writer"
   - Rolle: None (wir geben direkt Sheet-Zugriff)
5. Erstelle einen **JSON Key** für den Service Account
   - Service Account öffnen → Keys → Add Key → Create new key → JSON
   - Datei wird heruntergeladen (z.B. `inclusions-sheets-xxx.json`)

### Schritt 2: Google Sheets erstellen

Erstelle **3 Google Sheets** (oder 3 Tabs in einem Sheet):

#### Sheet 1: VIP-Anmeldungen
**Name:** VIP-Anmeldungen

**Header (Zeile 1):**
```
Erstellt am | Vorname | Nachname | E-Mail | Telefon | Alter | IV-Ausweis | Beeinträchtigung | Event-Datum | Event-Ort | Ankunftszeit | TIXI-Taxi | TIXI-Adresse | Benötigt 1-zu-1 Betreuer | Betreuer Name | Betreuer Telefon | Angemeldet durch | Anmeldungs-Betreuer Name | Anmeldungs-Betreuer E-Mail | Anmeldungs-Betreuer Telefon | Kontaktperson Name | Kontaktperson Telefon | Besondere Bedürfnisse | Status
```

#### Sheet 2: Booking-Anfragen
**Name:** Booking-Anfragen

**Header (Zeile 1):**
```
Erstellt am | Name | E-Mail | Telefon | Booking-Typ | Gebuchtes Item | Event-Datum | Event-Ort | Event-Typ | Nachricht | Status
```

#### Sheet 3: Newsletter
**Name:** Newsletter

**Header (Zeile 1):**
```
Erstellt am | E-Mail | Vorname | Nachname | Hat Beeinträchtigung | Interessen | Status | Bestätigt am
```

### Schritt 3: Service Account Zugriff geben

1. Öffne jedes Google Sheet
2. Klicke auf "Teilen" (Share)
3. Füge die **Service Account E-Mail** hinzu (aus dem JSON-Key, z.B. `inclusions-sheets-writer@...iam.gserviceaccount.com`)
4. Gib **Editor**-Rechte
5. Deaktiviere "Notify people" (Service Accounts brauchen keine Benachrichtigung)

### Schritt 4: Sheet IDs kopieren

Kopiere die **Sheet ID** aus der URL jedes Sheets:
```
https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit
                                         ^^^^^^^^^^^^
```

### Schritt 5: Umgebungsvariablen setzen

Füge zu `.env.server` (oder `.env.local`) hinzu:

```bash
# Google Sheets Integration
GOOGLE_SHEETS_CREDENTIALS='{"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}'
GOOGLE_SHEETS_VIP_ID="IHRE_VIP_SHEET_ID"
GOOGLE_SHEETS_BOOKING_ID="IHRE_BOOKING_SHEET_ID"
GOOGLE_SHEETS_NEWSLETTER_ID="IHRE_NEWSLETTER_SHEET_ID"
```

**Wichtig:** Das `GOOGLE_SHEETS_CREDENTIALS` muss der **gesamte Inhalt** der heruntergeladenen JSON-Datei sein (als Einzeiler).

#### Konvertierung des JSON-Keys:

```bash
# Methode 1: Mit jq (empfohlen)
cat inclusions-sheets-xxx.json | jq -c . > credentials-oneline.txt

# Methode 2: Manuell
# Öffne die JSON-Datei, entferne alle Zeilenumbrüche und setze sie in einfache Anführungszeichen
```

---

## 📋 Wie es funktioniert

### Automatischer Ablauf:

1. **Benutzer füllt Formular aus** (VIP, Booking, Newsletter)
2. **Daten werden gespeichert:**
   - ✅ In JSON-Datei (für Backend)
   - ✅ In Google Sheets (automatisch)
   - ✅ E-Mail-Benachrichtigung versendet
3. **Sofort verfügbar:**
   - Im Admin-Backend
   - In Google Sheets (Echtzeit)

### Vorteile:

- ✅ **Echtzeit-Sync** - Neue Einträge erscheinen sofort in Google Sheets
- ✅ **Backup** - Daten sind in JSON UND Google Sheets
- ✅ **Teamwork** - Mehrere Personen können gleichzeitig in Sheets arbeiten
- ✅ **Auswertungen** - Nutze Google Sheets für Pivot-Tabellen, Charts, etc.
- ✅ **Export** - Einfacher Export zu Excel, CSV, etc.

---

## 🔧 Erweiterte Konfiguration

### Mehrere Sheets in einem Dokument:

Sie können auch ein einziges Google Sheets Dokument mit mehreren Tabs verwenden:

1. Erstelle ein Dokument: "Inclusions Formulardaten"
2. Erstelle 3 Tabs:
   - Tab 1: "VIP-Anmeldungen"
   - Tab 2: "Booking-Anfragen"
   - Tab 3: "Newsletter"
3. Verwende die **gleiche Sheet ID** für alle drei:
   ```bash
   GOOGLE_SHEETS_VIP_ID="GLEICHE_SHEET_ID"
   GOOGLE_SHEETS_BOOKING_ID="GLEICHE_SHEET_ID"
   GOOGLE_SHEETS_NEWSLETTER_ID="GLEICHE_SHEET_ID"
   ```

Die Integration schreibt dann automatisch in die korrekten Tabs!

### Optional: Manueller Sync bestehender Daten

Falls Sie bereits Daten in JSON haben und diese in Google Sheets übertragen möchten, erstellen Sie eine Admin-Route:

```typescript
// app/api/admin/sync-to-sheets/route.ts
import { readJsonFile } from '@/lib/db-json';
import { writeVIPToSheets } from '@/lib/google-sheets-vip';

export async function POST() {
  const vips = await readJsonFile('vip_registrations.json');
  for (const vip of vips) {
    await writeVIPToSheets(vip);
  }
  return Response.json({ success: true, synced: vips.length });
}
```

---

## 📊 Sheet-Struktur

### VIP-Anmeldungen (24 Spalten)

Enthält **ALLE** Daten aus dem VIP-Formular:

**Persönliche Daten:**
- Vorname, Nachname, E-Mail, Telefon, Alter

**VIP-Status:**
- IV-Ausweis, Beeinträchtigung

**Event:**
- Event-Datum, Event-Ort, Ankunftszeit

**TIXI-Taxi:**
- TIXI-Taxi (Ja/Nein), TIXI-Adresse

**1-zu-1 Betreuer (für VIP):**
- Benötigt Betreuer, Betreuer Name, Betreuer Telefon

**Anmeldung:**
- Angemeldet durch (Selbst/Betreuer:in)
- Anmeldungs-Betreuer Name, E-Mail, Telefon (falls durch Betreuer)
- Kontaktperson Name, Telefon (falls selbst)

**Sonstiges:**
- Besondere Bedürfnisse, Status

### Booking-Anfragen (11 Spalten)

- Erstellt am, Name, E-Mail, Telefon
- Booking-Typ, Gebuchtes Item
- Event-Datum, Event-Ort, Event-Typ
- Nachricht, Status

### Newsletter (8 Spalten)

- Erstellt am, E-Mail, Vorname, Nachname
- Hat Beeinträchtigung, Interessen
- Status, Bestätigt am

---

## 🔒 Sicherheit

**Service Account Credentials:**
- Speichern Sie die Credentials **NIE** im Git-Repository
- Verwenden Sie `.env.server` (ist in `.gitignore`)
- Auf dem Server: Setzen Sie die Env-Variablen in `/etc/environment` oder PM2 Ecosystem

**Best Practices:**
- Service Account hat nur Zugriff auf die freigegebenen Sheets
- Keine weiteren Google-Dienste zugänglich
- Minimale Berechtigungen (nur Sheets API)

---

## 🧪 Testing

### Lokales Testing:

1. Setze die Env-Variablen in `.env.local`
2. Starte Dev-Server: `npm run dev`
3. Fülle ein Formular aus
4. Prüfe Google Sheets → Neue Zeile sollte erscheinen
5. Prüfe Console-Logs: "✅ VIP-Daten in Google Sheets geschrieben"

### Produktions-Testing:

Nach dem Deployment auf https://inclusions.zone:
1. Fülle ein Formular aus
2. Prüfe Google Sheets
3. Prüfe Admin-Backend
4. Beide sollten die gleichen Daten zeigen

---

## 📝 Deployment auf Server

### Dateien hochladen:

```bash
scp -i ~/.ssh/inclusions_server lib/google-sheets-*.ts incluzone@10.55.55.155:/home/incluzone/inclusions-2.0/lib/
scp -i ~/.ssh/inclusions_server app/api/vip/route.ts incluzone@10.55.55.155:/home/incluzone/inclusions-2.0/app/api/vip/
scp -i ~/.ssh/inclusions_server app/api/booking/route.ts incluzone@10.55.55.155:/home/incluzone/inclusions-2.0/app/api/booking/
scp -i ~/.ssh/inclusions_server app/api/newsletter/route.ts incluzone@10.55.55.155:/home/incluzone/inclusions-2.0/app/api/newsletter/
```

### Env-Variablen auf Server setzen:

```bash
ssh -i ~/.ssh/inclusions_server incluzone@10.55.55.155
cd /home/incluzone/inclusions-2.0
nano .env.server
```

Füge hinzu:
```bash
GOOGLE_SHEETS_CREDENTIALS='...'
GOOGLE_SHEETS_VIP_ID='...'
GOOGLE_SHEETS_BOOKING_ID='...'
GOOGLE_SHEETS_NEWSLETTER_ID='...'
```

### App neu bauen und starten:

```bash
NODE_OPTIONS='--max-old-space-size=2048' npm run build
pm2 restart all
```

---

## ❓ Troubleshooting

### Problem: "Google Sheets ID nicht konfiguriert"

**Lösung:** Env-Variablen sind nicht gesetzt. Prüfe `.env.server` oder `.env.local`

### Problem: "Authentifizierung fehlgeschlagen"

**Lösung:** 
1. Prüfe ob `GOOGLE_SHEETS_CREDENTIALS` korrekt als JSON-String gesetzt ist
2. Prüfe ob der Service Account Zugriff auf die Sheets hat (Teilen-Dialog)

### Problem: "Fehler beim Schreiben in Google Sheets"

**Lösung:**
1. Prüfe Sheet ID in der URL
2. Prüfe Tab-Namen (z.B. "VIP-Anmeldungen" muss exakt so heißen)
3. Prüfe Service Account Rechte (Editor, nicht nur Viewer)

### Problem: Daten werden nicht geschrieben

**Prüfen:**
1. Server-Logs: `pm2 logs --lines 50`
2. Suche nach "Google Sheets" Meldungen
3. Prüfe ob Credentials korrekt sind

---

## 💡 Alternative: Ohne Google Sheets

Falls Sie Google Sheets nicht verwenden möchten:
- Die Integration ist **optional**
- Formulare funktionieren auch ohne (speichern nur in JSON)
- Einfach die Env-Variablen nicht setzen
- Die App funktioniert normal weiter

---

## 📈 Erweiterte Features (optional)

### Auto-Sortierung aktivieren:

In Google Sheets können Sie Filter und Sortierung aktivieren:
1. Markieren Sie die Header-Zeile
2. Data → Create a filter
3. Klicken Sie auf "Erstellt am" → Sort Z→A (neueste zuerst)

### Bedingte Formatierung:

**Neue Einträge hervorheben:**
- Format → Conditional formatting
- Regel: "Datum ist in den letzten 24 Stunden"
- Format: Hintergrund grün

**IV-Ausweis Ja:**
- Spalte "IV-Ausweis" = "Ja"
- Format: Hintergrund blau

### Formeln für Statistiken:

**Am Ende des Sheets:**
```
Gesamt: =COUNTA(A2:A)
Neue heute: =COUNTIF(A:A, TODAY())
Mit IV-Ausweis: =COUNTIF(G:G, "Ja")
```

---

## 🎯 Best Practices

1. **Regelmäßige Backups:** 
   - Google Sheets hat automatische Versionierung
   - Zusätzlich: Wöchentlicher Export als Excel-Backup

2. **Zugriffsverwaltung:**
   - Teilen Sie Sheets nur mit relevanten Personen
   - Service Account braucht nur Editor-Rechte

3. **Daten-Qualität:**
   - Ändern Sie die Header-Zeile NICHT
   - Löschen Sie keine Zeilen direkt aus Sheets
   - Nutzen Sie das Admin-Backend zum Löschen

4. **Performance:**
   - Google Sheets kann 10 Mio. Zellen handhaben
   - Bei >10.000 Einträgen: Archivieren Sie alte Daten

---

## ✅ Erfolgskriterien

Nach Setup sollten Sie sehen:

1. ✅ Console-Log: "✅ VIP-Daten in Google Sheets geschrieben"
2. ✅ Neue Zeile erscheint in Google Sheets
3. ✅ Daten sind auch im Admin-Backend sichtbar
4. ✅ Alle Formular-Felder sind korrekt übertragen

**Wenn alles funktioniert: Herzlichen Glückwunsch! 🎉**

Sie haben jetzt ein vollautomatisches System für alle Formulardaten!
