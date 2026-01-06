# Datenschutz-Informationen für Inclusions 2.0

## Verwendung in Datenschutzerklärung

Diese Informationen können in die Datenschutzerklärung der Website eingefügt werden.

## Formulare & Kontaktanfragen

### Erhobene Daten
- Name, E-Mail-Adresse, optional Telefonnummer
- Nachricht/Anfrage-Inhalt
- IP-Adresse (für Spam-Schutz)
- UTM-Parameter (Marketing-Tracking)
- Zeitstempel der Anfrage

### Zweck
- Bearbeitung von Kontaktanfragen
- Booking-Anfragen für DJs/Dance Crew
- VIP/Event-Anmeldungen
- Newsletter-Anmeldungen (mit Double-Opt-In)

### Speicherdauer
- Kontaktanfragen: Bis zur Bearbeitung, max. 2 Jahre
- Newsletter: Bis zur Abmeldung
- VIP-Anmeldungen: Bis zum Event, max. 1 Jahr

### Rechtsgrundlage
- Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)
- Art. 6 Abs. 1 lit. a DSGVO (Einwilligung bei Newsletter)

## Analytics (Umami)

### Erhobene Daten
- Pageviews (anonymisiert)
- Events (Formular-Submits, anonymisiert)
- Browser-Typ, Bildschirmauflösung
- Referrer (Herkunft)

### Zweck
- Website-Optimierung
- Marketing-Insights
- Verständnis der Nutzer-Interaktionen

### Besonderheiten
- **Keine Cookies** (oder nur minimale, DSGVO-konforme)
- **Anonymisierung** der IP-Adressen
- **Selbst-gehostet** (Daten bleiben auf eigenem Server)
- **DSGVO-konform** (keine personenbezogenen Daten)

### Rechtsgrundlage
- Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse)

## E-Mail-Versand (Resend)

### Verwendete Daten
- E-Mail-Adresse des Empfängers
- Name (für Personalisierung)

### Zweck
- Versand von Bestätigungs-E-Mails
- Newsletter-Versand (nur nach Opt-In)
- Admin-Notifications

### Speicherung
- E-Mail-Adressen werden in Supabase gespeichert
- Resend speichert keine Daten dauerhaft

### Rechtsgrundlage
- Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)
- Art. 6 Abs. 1 lit. a DSGVO (Einwilligung)

## Datenbank (Supabase)

### Standort
- **Selbst-gehostet** auf Server in der Schweiz
- **DSGVO-konform** (Daten bleiben in EU/CH)

### Sicherheit
- Verschlüsselte Verbindungen (TLS)
- Row Level Security (RLS) aktiv
- Kein öffentlicher Datenzugriff
- Regelmäßige Backups

## Rechte der Nutzer

Gemäß DSGVO haben Nutzer folgende Rechte:

1. **Auskunft** (Art. 15 DSGVO)
2. **Berichtigung** (Art. 16 DSGVO)
3. **Löschung** (Art. 17 DSGVO)
4. **Einschränkung** (Art. 18 DSGVO)
5. **Datenübertragbarkeit** (Art. 20 DSGVO)
6. **Widerspruch** (Art. 21 DSGVO)
7. **Widerruf der Einwilligung** (Art. 7 Abs. 3 DSGVO)

**Kontakt für Datenschutz-Anfragen:**
- E-Mail: admin@inclusions.zone
- Adresse: [Ihre Adresse]

## Textbaustein für Datenschutzerklärung

```
### Kontaktformulare

Wenn Sie uns über unsere Website kontaktieren, speichern wir die von Ihnen 
angegebenen Daten (Name, E-Mail, Nachricht) zur Bearbeitung Ihrer Anfrage. 
Diese Daten werden auf unserem Server in der Schweiz gespeichert und nicht 
an Dritte weitergegeben. Die Speicherung erfolgt bis zur vollständigen 
Bearbeitung Ihrer Anfrage, maximal jedoch 2 Jahre.

### Newsletter

Wenn Sie sich für unseren Newsletter anmelden, speichern wir Ihre E-Mail-Adresse 
und optional Ihren Namen. Sie erhalten eine Bestätigungs-E-Mail (Double-Opt-In). 
Sie können sich jederzeit abmelden. Die Daten werden gelöscht, sobald Sie sich 
abmelden.

### Analytics

Wir nutzen Umami, eine selbst-gehostete, datenschutzfreundliche Analytics-Lösung. 
Es werden keine Cookies gesetzt und keine personenbezogenen Daten gespeichert. 
Ihre IP-Adresse wird anonymisiert. Die Daten dienen ausschließlich der 
Website-Optimierung und werden auf unserem Server in der Schweiz gespeichert.

### E-Mail-Versand

Für den Versand von E-Mails nutzen wir Resend. Ihre E-Mail-Adresse wird zur 
Zweckerfüllung an Resend übermittelt. Resend speichert keine Daten dauerhaft. 
Die Datenübertragung erfolgt verschlüsselt (TLS).
```

## Checkliste für DSGVO-Konformität

- ✅ Datenschutzerklärung auf Website
- ✅ Cookie-Banner (falls Cookies verwendet)
- ✅ Opt-In für Newsletter (Double-Opt-In)
- ✅ Widerspruchsrecht bei Analytics
- ✅ Kontaktmöglichkeit für Datenschutz-Anfragen
- ✅ Impressum mit vollständiger Adresse
- ✅ SSL/TLS Verschlüsselung
- ✅ Regelmäßige Backups
- ✅ Zugriffsschutz (Firewall, RLS)

