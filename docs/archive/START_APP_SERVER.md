# App auf Server starten - Schritt für Schritt

## Problem gefunden
✅ Environment-Variablen sind korrekt gesetzt  
❌ **Next.js App läuft NICHT** → Deshalb werden keine E-Mails versendet!

## Lösung: App starten

### Schritt 1: Prüfe ob App bereits läuft
```bash
ssh incluzone@10.55.55.155 "pgrep -f 'next start'"
```
**Falls nichts zurückkommt:** App läuft nicht → weiter zu Schritt 2

### Schritt 2: Prüfe ob Build vorhanden ist
```bash
ssh incluzone@10.55.55.155 "cd ~/inclusions-2.0 && ls -la .next"
```
**Falls `.next` Verzeichnis fehlt:** App muss erst gebaut werden → Schritt 3a  
**Falls `.next` vorhanden ist:** App kann direkt gestartet werden → Schritt 3b

### Schritt 3a: App bauen (falls nötig)
```bash
ssh incluzone@10.55.55.155 "cd ~/inclusions-2.0 && npm run build"
```
**Warte bis Build fertig ist** (kann 1-2 Minuten dauern)

### Schritt 3b: App starten
```bash
ssh incluzone@10.55.55.155 "cd ~/inclusions-2.0 && npm start > /tmp/next.log 2>&1 &"
```

### Schritt 4: Prüfe ob App läuft
```bash
ssh incluzone@10.55.55.155 "pgrep -f 'next start'"
```
**Sollte eine PID (Prozess-ID) zurückgeben** → App läuft!

### Schritt 5: Prüfe Logs
```bash
ssh incluzone@10.55.55.155 "tail -20 /tmp/next.log"
```
**Sollte zeigen:**
- `Ready on http://localhost:3000` oder ähnlich
- Keine Fehler

### Schritt 6: Teste API Endpoint
```bash
curl https://inclusions.zone/api/debug-resend
```
**Sollte JSON zurückgeben mit:**
- `resendIsNull: false`
- `apiKeyValid: true`

## Alles in einem Befehl

```bash
ssh incluzone@10.55.55.155 "cd ~/inclusions-2.0 && \
  ([ -d .next ] || npm run build) && \
  pkill -f 'next start' 2>/dev/null; \
  npm start > /tmp/next.log 2>&1 & \
  sleep 3 && \
  pgrep -f 'next start' && echo '✅ App läuft!' || echo '❌ App-Start fehlgeschlagen'"
```

## Nach dem Start

### 1. Newsletter-Anmeldung testen
- Gehe zu: https://inclusions.zone/newsletter
- Fülle das Formular aus
- Prüfe ob Bestätigungsmail ankommt

### 2. Logs live verfolgen
```bash
ssh incluzone@10.55.55.155 "tail -f /tmp/next.log"
```
**Drücke Ctrl+C zum Beenden**

### 3. Prüfe Resend Dashboard
- Gehe zu: https://resend.com/emails
- Prüfe ob E-Mails versendet wurden

## Troubleshooting

### Problem: App startet nicht
```bash
# Prüfe Logs auf Fehler
ssh incluzone@10.55.55.155 "tail -50 /tmp/next.log | grep -i error"

# Prüfe ob Port 3000 belegt ist
ssh incluzone@10.55.55.155 "lsof -i :3000"
```

### Problem: App läuft aber E-Mails kommen nicht an
```bash
# Prüfe ob Environment-Variablen geladen sind
ssh incluzone@10.55.55.155 "cat /proc/\$(pgrep -f 'next start' | head -1)/environ | grep RESEND"

# Falls nicht geladen: App neu starten
ssh incluzone@10.55.55.155 "pkill -f 'next start' && cd ~/inclusions-2.0 && npm start > /tmp/next.log 2>&1 &"
```

### Problem: Build schlägt fehl
```bash
# Prüfe Node-Version (sollte 18+ sein)
ssh incluzone@10.55.55.155 "node --version"

# Prüfe ob node_modules vorhanden sind
ssh incluzone@10.55.55.155 "cd ~/inclusions-2.0 && ls -la node_modules"

# Falls nicht: npm install ausführen
ssh incluzone@10.55.55.155 "cd ~/inclusions-2.0 && npm install"
```

## Wichtig

**Nach jeder Änderung an `.env`:** App muss neu gestartet werden!
```bash
ssh incluzone@10.55.55.155 "pkill -f 'next start' && cd ~/inclusions-2.0 && npm start > /tmp/next.log 2>&1 &"
```
