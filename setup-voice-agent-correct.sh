#!/bin/bash
# Voice Agent Setup - Korrigierte Version
# Stellt sicher, dass der richtige GEMINI_API_KEY gesetzt wird

set -e

SERVER="10.55.55.155"
USER="incluzone"
REMOTE_DIR="~/inclusions-2.0"

echo "=== Voice Agent Setup - Korrigiert ==="
echo ""

# Prüfe ob .env.production existiert
if [ ! -f ".env.production" ]; then
    echo "❌ .env.production nicht gefunden!"
    exit 1
fi

# Prüfe ob GEMINI_API_KEY korrekt ist
if ! grep -q "GEMINI_API_KEY=AIzaSy" .env.production; then
    echo "⚠️  WARNUNG: GEMINI_API_KEY sieht nicht korrekt aus!"
    echo "   Erwartet: GEMINI_API_KEY=AIzaSy..."
    echo "   Gefunden:"
    grep GEMINI_API_KEY .env.production || echo "   NICHT GEFUNDEN!"
    echo ""
    read -p "Trotzdem fortfahren? (j/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[JjYy]$ ]]; then
        exit 1
    fi
fi

echo "📋 Schritt 1: Kopiere Environment Variables auf Server..."
scp .env.production ${USER}@${SERVER}:${REMOTE_DIR}/.env

echo "✅ Environment Variables kopiert"
echo ""

echo "🔍 Schritt 2: Prüfe ob GEMINI_API_KEY korrekt kopiert wurde..."
ssh ${USER}@${SERVER} "cd ${REMOTE_DIR} && echo 'GEMINI_API_KEY auf Server:' && grep GEMINI_API_KEY .env | head -c 50 && echo '...'"
echo ""

echo "🔄 Schritt 3: Stoppe alte App..."
ssh ${USER}@${SERVER} "pkill -f 'next start' 2>/dev/null && echo '✅ Alte App gestoppt' || echo '⚠️ Keine laufende App gefunden'"
sleep 3
echo ""

echo "🚀 Schritt 4: Starte Next.js App neu..."
ssh ${USER}@${SERVER} "cd ${REMOTE_DIR} && nohup npm start > /tmp/next.log 2>&1 &"
sleep 5
echo ""

echo "🔍 Schritt 5: Prüfe ob App läuft..."
if ssh ${USER}@${SERVER} "pgrep -f 'next start' > /dev/null"; then
    echo "✅ App läuft"
    echo ""
    echo "⏳ Warte 5 Sekunden, damit App vollständig startet..."
    sleep 5
    echo ""
    echo "🧪 Schritt 6: Teste API..."
    echo "Öffne im Browser: http://10.55.55.155/api/test-gemini-key"
    echo ""
    echo "Erwartung:"
    echo "  ✅ keyExists: true"
    echo "  ✅ keyLength: 39 (nicht 24!)"
    echo "  ✅ keyPrefix: 'AIzaSyBzJ...' (nicht 'dein-gemin...'!)"
else
    echo "❌ App läuft NICHT!"
    echo ""
    echo "📋 Fehler-Logs:"
    ssh ${USER}@${SERVER} "tail -30 /tmp/next.log"
    exit 1
fi

echo ""
echo "=== ✅ Fertig ==="
echo ""
echo "WICHTIG:"
echo "1. Öffne: http://10.55.55.155/api/test-gemini-key"
echo "2. Prüfe: keyLength sollte 39 sein (nicht 24!)"
echo "3. Falls keyLength immer noch 24:"
echo "   - Hard Reload: Cmd+Shift+R"
echo "   - Oder: Browser-Cache leeren"
echo "4. Dann Voice Agent testen"
echo ""
