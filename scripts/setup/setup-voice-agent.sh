#!/bin/bash
# Phase 2: Voice Agent Setup
# Kopiert Environment Variables auf Server und startet App neu

set -e

SERVER="10.55.55.155"
USER="incluzone"
REMOTE_DIR="~/inclusions-2.0"

echo "=== Phase 2: Voice Agent Setup ==="
echo ""

# Prüfe ob .env.production existiert
if [ ! -f ".env.production" ]; then
    echo "❌ .env.production nicht gefunden!"
    exit 1
fi

echo "📋 Kopiere Environment Variables auf Server..."
scp .env.production ${USER}@${SERVER}:${REMOTE_DIR}/.env

echo "✅ Environment Variables kopiert"
echo ""

echo "🔄 Starte Next.js App neu..."
ssh ${USER}@${SERVER} "cd ${REMOTE_DIR} && pkill -f 'next start' 2>/dev/null || true && npm start > /tmp/next.log 2>&1 & sleep 3 && pgrep -f 'next start' > /dev/null && echo '✅ App gestartet' || echo '⚠️ App-Start prüfen'"

echo ""
echo "=== ✅ Fertig ==="
echo ""
echo "Teste jetzt:"
echo "1. Öffne: http://10.55.55.155"
echo "2. Klicke auf Voice Agent Button"
echo "3. Erlaube Mikrofon-Zugriff"
echo "4. Stelle eine Frage (z.B. 'Wann ist das nächste Event?')"
echo ""
