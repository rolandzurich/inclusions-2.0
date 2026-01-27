# Environment-Variablen korrekt integrieren - Schritt für Schritt

## Problem:
Voice Agent und Resend funktionieren nicht, weil die Environment-Variablen nicht korrekt auf dem Server sind.

## Lösung: Manuell auf dem Server einrichten

### Schritt 1: Verbinde dich mit dem Server
```bash
ssh incluzone@10.55.55.155
# Passwort: 13vor12!Asdf
```

### Schritt 2: Gehe ins Projekt-Verzeichnis
```bash
cd ~/inclusions-2.0
```

### Schritt 3: Erstelle/Überschreibe die .env Datei
```bash
cat > .env << 'ENVEOF'
NEXT_PUBLIC_SITE_URL=http://10.55.55.155

# E-Mail-Versand (Resend)
RESEND_API_KEY=re_an8y4Hrw_J5bcb33jndu9cb2avtyd87vB
RESEND_FROM_EMAIL=noreply@inclusions.zone
RESEND_ADMIN_EMAIL=info@inclusions.zone

# Chat-Features (Gemini) - Voice Agent
GEMINI_API_KEY=AIzaSyBzJoEimC2cpaNIibF103zrZaPSFWZWdWg
ENVEOF
```

### Schritt 4: Prüfe ob die Datei korrekt ist
```bash
cat .env
```

Du solltest sehen:
- NEXT_PUBLIC_SITE_URL=http://10.55.55.155
- RESEND_API_KEY=re_an8y4Hrw_J5bcb33jndu9cb2avtyd87vB
- RESEND_FROM_EMAIL=noreply@inclusions.zone
- RESEND_ADMIN_EMAIL=info@inclusions.zone
- GEMINI_API_KEY=AIzaSyBzJoEimC2cpaNIibF103zrZaPSFWZWdWg

### Schritt 5: App neu starten (WICHTIG!)
```bash
# Stoppe alte App
pkill -f 'next start'

# Warte kurz
sleep 2

# Starte neu (im Hintergrund)
npm start > /tmp/next.log 2>&1 &

# Prüfe ob App läuft
ps aux | grep "next start" | grep -v grep
```

### Schritt 6: Prüfe Logs (optional)
```bash
tail -20 /tmp/next.log
```

## Alternative: Datei lokal kopieren

Falls du die Datei lokal kopieren möchtest:

```bash
# Auf deinem Mac:
cd /Users/roland/Curser/inclusions-2.0
scp .env.production incluzone@10.55.55.155:~/inclusions-2.0/.env
```

Dann auf dem Server:
```bash
ssh incluzone@10.55.55.155
cd ~/inclusions-2.0
pkill -f 'next start' && sleep 2 && npm start > /tmp/next.log 2>&1 &
```

## Warum muss die App neu gestartet werden?

Next.js lädt Environment-Variablen **nur beim Start**. Änderungen an `.env` werden erst nach Neustart wirksam.

## Testen ob es funktioniert:

1. **Voice Agent (INCLUSI):**
   - Öffne: http://10.55.55.155
   - Klicke auf "Mit INCLUSI sprechen"
   - Stelle eine Frage → sollte antworten

2. **Resend (E-Mail):**
   - Fülle ein Kontaktformular aus
   - E-Mail sollte versendet werden

## Falls es immer noch nicht funktioniert:

Prüfe die Logs:
```bash
ssh incluzone@10.55.55.155
tail -50 /tmp/next.log | grep -E 'RESEND|GEMINI|error'
```

Falls Fehler sichtbar sind, teile sie mit mir.
