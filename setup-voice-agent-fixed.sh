#!/bin/bash
# Voice Agent Setup - Verbesserte Version mit besserer Fehlerbehandlung

set -e

SERVER="10.55.55.155"
USER="incluzone"
REMOTE_DIR="~/inclusions-2.0"

echo "=== Phase 2: Voice Agent Setup (Verbessert) ==="
echo ""

# Prüfe ob .env.production existiert
if [ ! -f ".env.production" ]; then
    echo "❌ .env.production nicht gefunden!"
    exit 1
fi

echo "📋 Schritt 1: Kopiere Environment Variables auf Server..."
scp .env.production ${USER}@${SERVER}:${REMOTE_DIR}/.env

echo "✅ Environment Variables kopiert"
echo ""

echo "🔍 Schritt 2: Prüfe ob GEMINI_API_KEY vorhanden ist..."
ssh ${USER}@${SERVER} "cd ${REMOTE_DIR} && grep -q GEMINI_API_KEY .env && echo '✅ GEMINI_API_KEY gefunden' || echo '❌ GEMINI_API_KEY fehlt'"
echo ""

echo "🔄 Schritt 3: Stoppe alte App..."
ssh ${USER}@${SERVER} "pkill -f 'next start' 2>/dev/null && echo '✅ Alte App gestoppt' || echo '⚠️ Keine laufende App gefunden'"
sleep 2
echo ""

echo "🚀 Schritt 4: Starte Next.js App neu..."
ssh ${USER}@${SERVER} "cd ${REMOTE_DIR} && nohup npm start > /tmp/next.log 2>&1 &"
sleep 5
echo ""

echo "🔍 Schritt 5: Prüfe ob App läuft..."
if ssh ${USER}@${SERVER} "pgrep -f 'next start' > /dev/null"; then
    echo "✅ App läuft erfolgreich"
    echo ""
    echo "📋 App-Logs (letzte 10 Zeilen):"
    ssh ${USER}@${SERVER} "tail -10 /tmp/next.log"
else
    echo "❌ App läuft NICHT!"
    echo ""
    echo "📋 Fehler-Logs:"
    ssh ${USER}@${SERVER} "tail -20 /tmp/next.log"
    exit 1
fi

echo ""
echo "=== ✅ Fertig ==="
echo ""
echo "WICHTIG für Browser-Test:"
echo "1. Öffne Browser: http://10.55.55.155"
echo "2. Drücke Cmd+Shift+R (Mac) oder Ctrl+Shift+R (Windows) - Hard Reload"
echo "3. Oder: Browser-Cache leeren (Einstellungen → Datenschutz → Cache löschen)"
echo "4. Klicke auf Voice Agent Button"
echo "5. Erlaube Mikrofon-Zugriff (Browser fragt dich)"
echo ""
echo "Falls Fehler 'not-allowed' weiterhin besteht:"
echo "- Browser-Einstellungen → Websites → Mikrofon → inclusions.zone erlauben"
echo "- Oder: Seite in Inkognito-Modus öffnen (Cmd+Shift+N)"
echo ""
