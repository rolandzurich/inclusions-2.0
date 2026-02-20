# Umami Analytics - Übersicht

## Was ist Umami?

Umami ist eine **privacy-freundliche, selbst-gehostete Web-Analytics-Lösung** - eine Alternative zu Google Analytics.

## Warum Umami?

### ✅ Vorteile:
- **DSGVO-konform**: Keine Cookies, anonymisierte IP-Adressen
- **Selbst-gehostet**: Daten bleiben auf deinem Server
- **Leichtgewichtig**: Tracking-Script unter 2KB
- **Echtzeit-Daten**: Verfügbar in Sekunden
- **Open Source**: Kostenlos und transparent

### 📊 Was wird getrackt?

**Basis-Metriken:**
- Pageviews (Seitenaufrufe)
- Besucher (unique visitors)
- Bounce Rate
- Session-Dauer
- Referrer (Herkunft der Besucher)
- Browser, Betriebssystem, Gerätetyp
- Länder/Städte (anonymisiert)

**Erweiterte Features:**
- **Funnels**: Conversion-Raten und Drop-off-Punkte
- **User Journeys**: Wie Nutzer durch die Website navigieren
- **Retention**: Wiederkehrende Besucher
- **Goals**: Spezifische Events tracken (z.B. Formular-Submits)
- **UTM Campaign Tracking**: Automatische Analyse von Marketing-Kampagnen
- **Custom Events**: Button-Klicks, Formular-Submits, etc.

## Dashboard

### Wo kann ich die Daten sehen?

Umami hat ein **eigenes Web-Dashboard**, das du aufrufst über:
```
http://10.55.55.155:3002
```

### Dashboard-Features:

1. **Übersicht**: 
   - Pageviews, Besucher, Bounce Rate auf einen Blick
   - Grafiken für Zeiträume (heute, diese Woche, dieser Monat)

2. **Seiten-Analyse**:
   - Welche Seiten werden am meisten besucht?
   - Durchschnittliche Verweildauer pro Seite

3. **Besucher-Analyse**:
   - Länder/Städte-Verteilung
   - Browser/Device-Verteilung
   - Neue vs. wiederkehrende Besucher

4. **Referrer-Analyse**:
   - Woher kommen die Besucher? (Google, Social Media, Direkt, etc.)

5. **Echtzeit-Dashboard**:
   - Aktuelle Besucher live sehen
   - Welche Seiten werden gerade besucht?

6. **Custom Events**:
   - Formular-Submits
   - Button-Klicks
   - Andere Interaktionen

### Einrichtung:

1. **Umami auf dem Server starten** (via Docker)
2. **Website registrieren** im Umami-Dashboard
3. **Website-ID erhalten**
4. **Environment-Variablen setzen**:
   ```bash
   NEXT_PUBLIC_UMAMI_URL=http://10.55.55.155:3002
   NEXT_PUBLIC_UMAMI_WEBSITE_ID=<deine-website-id>
   ```

## Vergleich: Umami vs. Google Analytics

| Feature | Umami | Google Analytics |
|---------|-------|------------------|
| DSGVO-konform | ✅ Ja | ⚠️ Komplex |
| Selbst-gehostet | ✅ Ja | ❌ Nein |
| Cookies | ❌ Nein | ✅ Ja |
| Daten-Ownership | ✅ Du | ❌ Google |
| Kosten | ✅ Kostenlos | ✅ Kostenlos |
| Features | 🟡 Basis + Erweitert | 🟢 Sehr umfangreich |
| Datenschutz | ✅ Sehr gut | ⚠️ Abhängig von Google |

## Für Inclusions 2.0:

**Empfehlung:** ✅ **Ja, Umami ist sinnvoll!**

**Gründe:**
- Privacy-freundlich passt zu deiner inklusiven Mission
- Du behältst die Kontrolle über die Daten
- Einfache Einrichtung (bereits im docker-compose.yml vorhanden)
- Ausreichend Features für deine Bedürfnisse

**Was du damit tracken kannst:**
- Wie viele Menschen besuchen die Website?
- Welche Seiten sind am beliebtesten?
- Woher kommen die Besucher?
- Welche Formulare werden ausgefüllt?
- Wie funktioniert die VIP-Anmeldung?

## Nächste Schritte:

1. Umami auf dem Server starten (Docker)
2. Dashboard aufrufen und Website registrieren
3. Website-ID kopieren
4. Environment-Variablen setzen
5. Tracking aktiviert! 🎉
