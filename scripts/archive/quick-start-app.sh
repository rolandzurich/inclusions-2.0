#!/bin/bash

# Quick Start Script für die App auf dem Server
# Führe aus: ssh incluzone@10.55.55.155 "bash -s" < quick-start-app.sh

echo "🚀 Starte App auf Server..."
echo ""

cd ~/inclusions-2.0 || { echo "❌ Verzeichnis nicht gefunden!"; exit 1; }

# 1. Prüfe ob Build vorhanden ist
echo "1️⃣ Prüfe Build..."
if [ ! -d .next ]; then
    echo "   Build fehlt - starte Build..."
    npm run build
    if [ $? -ne 0 ]; then
        echo "❌ Build fehlgeschlagen!"
        exit 1
    fi
    echo "✅ Build erfolgreich"
else
    echo "✅ Build vorhanden"
fi
echo ""

# 2. Stoppe alte App falls läuft
echo "2️⃣ Stoppe alte App..."
pkill -f 'next start' 2>/dev/null && echo "   Alte App gestoppt" || echo "   Keine alte App gefunden"
sleep 1
echo ""

# 3. Starte App
echo "3️⃣ Starte App..."
npm start > /tmp/next.log 2>&1 &
sleep 3
echo ""

# 4. Prüfe ob App läuft
echo "4️⃣ Prüfe Status..."
if pgrep -f 'next start' > /dev/null; then
    PID=$(pgrep -f 'next start')
    echo "✅ App läuft (PID: $PID)"
else
    echo "❌ App läuft NICHT!"
    echo ""
    echo "Letzte Log-Zeilen:"
    tail -20 /tmp/next.log
    exit 1
fi
echo ""

# 5. Zeige Logs
echo "5️⃣ App-Logs:"
echo "----------------------------------------"
tail -10 /tmp/next.log
echo "----------------------------------------"
echo ""

echo "✅ App erfolgreich gestartet!"
echo ""
echo "Nächste Schritte:"
echo "1. Teste API: curl https://inclusions.zone/api/debug-resend"
echo "2. Teste Newsletter-Anmeldung auf der Website"
echo "3. Prüfe Logs live: tail -f /tmp/next.log"
