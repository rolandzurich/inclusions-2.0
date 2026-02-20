# Admin Backend - Anleitung

## Übersicht

Das Admin-Backend ist vollständig implementiert und funktionsfähig! Alle Formulareinträge werden im Backend erfasst und können verwaltet werden.

## Zugriff auf das Admin-Backend

### 1. Login

Besuchen Sie: **http://localhost:3000/admin/login** (oder Ihre Domain + /admin/login)

**Test-Zugangsdaten:**
- **E-Mail:** `info@inclusions.zone` oder `admin@inclusions.zone`
- **Passwort:** `Inclusions2026!`

### 2. Dashboard

Nach dem Login werden Sie zum Dashboard weitergeleitet: `/admin/dashboard`

Das Dashboard zeigt:
- **Zusammenfassung** (Summary) aller Einträge
  - Anzahl Booking-Anfragen
  - Anzahl Newsletter-Abonnenten
  - Anzahl VIP-Anmeldungen
- **Neue Einträge** (mit "Neu"-Badge)
- **Neueste Booking-Anfragen** (die letzten 5)

## Navigation

Das Admin-Backend hat folgende Bereiche:

### 📊 Dashboard
- Übersicht über alle Statistiken
- Neueste Einträge auf einen Blick
- Schnellzugriff auf neue Anfragen

### 📝 Booking-Anfragen
**URL:** `/admin/contact-requests`

**Features:**
- Liste aller Buchungsanfragen
- Detailansicht für jede Anfrage
- Markierung als "gesehen" (beim Anklicken)
- Duplikat-Erkennung (gleiche E-Mail-Adressen)
- CSV-Export für Excel/Google Sheets
- Löschen-Funktion

**Angezeigte Informationen:**
- Name, E-Mail, Telefon
- Booking-Typ (DJ, Dance Crew, etc.)
- Gebuchtes Item
- Event-Datum, -Ort, -Typ
- Nachricht
- Status
- Erstellungsdatum

### 💌 Newsletter Abonnenten
**URL:** `/admin/newsletter`

**Features:**
- Liste aller Newsletter-Abonnenten
- Filter: Alle / Bestätigt / Ausstehend
- Detailansicht für jeden Abonnenten
- CSV-Export für Mailchimp
- Löschen-Funktion

**Angezeigte Informationen:**
- E-Mail, Vor-/Nachname
- Status (Bestätigt/Ausstehend)
- Interessen
- Beeinträchtigung (ja/nein)
- Bestätigungs- und Erstellungsdatum

### 🌟 VIP-Anmeldungen
**URL:** `/admin/vip`

**Features:**
- Liste aller VIP-Anmeldungen
- Detailansicht für jede Anmeldung
- Markierung als "gesehen" (beim Anklicken)
- Duplikat-Erkennung
- CSV-Export für Google Sheets
- Löschen-Funktion

**Angezeigte Informationen:**
- Name, E-Mail, Telefon
- Event-Datum, -Ort
- Firma
- Anzahl Gäste
- Besondere Anforderungen
- Nachricht
- Status
- Erstellungsdatum

**⚠️ WICHTIG:** VIP-Anmeldungen sind Ihr Kernstück! Alle Informationen aus den VIP-Formularen werden vollständig gespeichert und angezeigt.

## Datenstruktur

Alle Formulardaten werden in JSON-Dateien gespeichert:
- `data/contact_requests.json` - Booking-Anfragen
- `data/vip_registrations.json` - VIP-Anmeldungen
- `data/newsletter_subscribers.json` - Newsletter-Abonnenten

## Testdaten

Ich habe bereits Beispiel-Testdaten für Sie erstellt:
- **3 Booking-Anfragen** (1 bereits angesehen, 2 neu)
- **3 VIP-Anmeldungen** (1 bereits angesehen, 2 neu)
- **4 Newsletter-Abonnenten** (3 bestätigt, 1 ausstehend, 1 bereits angesehen)

Sie können diese jetzt im Admin-Backend sehen!

## Features im Detail

### 🔍 Automatische Markierung als "Gesehen"
Wenn Sie eine Anfrage oder VIP-Anmeldung anklicken, wird sie automatisch als "gesehen" markiert und das "Neu"-Badge verschwindet.

### 📥 CSV-Export
Alle Bereiche haben einen Export-Button:
- **Booking-Anfragen:** Exportiert alle Felder für Excel/Google Sheets
- **VIP-Anmeldungen:** Exportiert alle Felder inklusive besondere Anforderungen
- **Newsletter:** Exportiert im Mailchimp-Format

### 🔄 Duplikat-Erkennung
Das System erkennt automatisch doppelte E-Mail-Adressen und markiert sie mit einem "Doppelt"-Badge.

### 🔒 Sicherheit
- Alle Admin-Bereiche sind mit Token-basierter Authentifizierung geschützt
- Token wird im LocalStorage gespeichert
- Jede API-Anfrage erfordert einen gültigen Token

## Workflow

### Typischer Workflow für neue Einträge:

1. **Dashboard besuchen** → Sehen Sie neue Einträge
2. **Bereich auswählen** (z.B. VIP-Anmeldungen)
3. **Eintrag anklicken** → Detailansicht öffnet sich
4. **Informationen prüfen** → Wird automatisch als "gesehen" markiert
5. **Aktion durchführen:**
   - Kontaktieren Sie den Kunden
   - Exportieren Sie die Daten
   - Löschen Sie den Eintrag (falls erledigt oder Spam)

## API-Endpunkte

Falls Sie die Daten programmatisch abrufen möchten:

```
GET  /api/admin/stats                    - Dashboard-Statistiken
GET  /api/admin/contact-requests         - Alle Booking-Anfragen
GET  /api/admin/contact-requests/[id]    - Einzelne Anfrage
DELETE /api/admin/contact-requests/[id]  - Anfrage löschen

GET  /api/admin/vip                      - Alle VIP-Anmeldungen
GET  /api/admin/vip/[id]                 - Einzelne Anmeldung
DELETE /api/admin/vip/[id]               - Anmeldung löschen

GET  /api/admin/newsletter               - Alle Newsletter-Abonnenten
GET  /api/admin/newsletter/export        - Mailchimp CSV-Export
DELETE /api/admin/newsletter/[id]        - Abonnent löschen
```

Alle Endpunkte erfordern einen `Authorization: Bearer <token>` Header.

## Technische Details

### Datenspeicherung
- **Entwicklung:** JSON-Dateien im `data/` Ordner
- **Produktion:** Gleiche JSON-Dateien (kann später auf Datenbank umgestellt werden)

### Vorteile der JSON-Lösung:
- ✅ Einfach und zuverlässig
- ✅ Keine Datenbank-Setup erforderlich
- ✅ Datensicherung = einfaches File-Backup
- ✅ Schnell und performant für kleine bis mittlere Datenmengen

### Migration zu Datenbank (optional, später):
Falls Sie später zu einer Datenbank wechseln möchten (Supabase/PostgreSQL/SQLite), ist die Struktur bereits vorbereitet. Die API-Routes können leicht angepasst werden.

## Nächste Schritte

1. ✅ **Jetzt testen:** Besuchen Sie `/admin/login` und loggen Sie sich ein
2. ✅ **Testdaten ansehen:** Navigieren Sie durch alle Bereiche
3. ✅ **Produktiv nutzen:** Das System ist produktionsbereit!

## Support

Falls Sie Fragen haben oder Anpassungen benötigen:
- VIP-Anmeldungen sind vollständig implementiert mit allen Feldern
- CSV-Exporte funktionieren für alle Bereiche
- Alle Formulardaten werden korrekt gespeichert und angezeigt

**Das Backend ist vollständig funktionsfähig und produktionsbereit!** 🎉
