# Environment-Variablen manuell hinzufügen

## Problem:
Zu viele SSH-Verbindungen offen - automatisches Hinzufügen funktioniert aktuell nicht.

## Lösung: Manuell auf dem Server

### Option 1: Via SSH direkt verbinden
```bash
ssh incluzone@10.55.55.155
cd ~/inclusions-2.0
nano .env
```

Dann folgende Zeilen hinzufügen:
```bash
# E-Mail-Versand (Resend)
RESEND_API_KEY=re_an8y4Hrw_J5bcb33jndu9cb2avtyd87vB
RESEND_FROM_EMAIL=noreply@inclusions.zone
RESEND_ADMIN_EMAIL=info@inclusions.zone

# Chat-Features (Gemini)
GEMINI_API_KEY=AIzaSyBzJoEimC2cpaNIibF103zrZaPSFWZWdWg
```

### Option 2: Via expect-Skript (nach Wartezeit)
Warte 1-2 Minuten, dann:
```bash
cd /Users/roland/Curser/inclusions-2.0
./quick-deploy.sh .env.server /home/incluzone/inclusions-2.0/.env
```

### Option 3: Datei lokal erstellen und kopieren
Die Datei `.env.server` wurde bereits lokal erstellt mit allen Keys.
Du kannst sie manuell auf den Server kopieren.

## Nach dem Hinzufügen:

App neu starten:
```bash
ssh incluzone@10.55.55.155
cd ~/inclusions-2.0
pkill -f 'next start'
npm start > /tmp/next.log 2>&1 &
```

## Prüfen ob es funktioniert:
```bash
ssh incluzone@10.55.55.155
cd ~/inclusions-2.0
cat .env | grep -E 'RESEND|GEMINI'
```
