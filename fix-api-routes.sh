#!/bin/bash

# Fix API Routes auf dem Server
# Führe direkt auf dem Server aus

cd ~/inclusions-2.0 || exit 1

echo "🔍 Prüfe API-Routes..."
echo ""

# 1. Prüfe ob API-Route existiert
echo "1️⃣ Prüfe ob API-Route existiert..."
if [ -d "app/api/debug-resend" ]; then
    echo "✅ Route-Verzeichnis existiert"
    if [ -f "app/api/debug-resend/route.ts" ]; then
        echo "✅ Route-Datei existiert"
    else
        echo "❌ Route-Datei fehlt!"
        exit 1
    fi
else
    echo "❌ Route-Verzeichnis fehlt!"
    exit 1
fi
echo ""

# 2. Teste API lokal
echo "2️⃣ Teste API lokal auf localhost:3000..."
RESPONSE=$(curl -s http://localhost:3000/api/debug-resend 2>&1)
if echo "$RESPONSE" | grep -q "resendIsNull\|success"; then
    echo "✅ API funktioniert lokal!"
    echo "Response (erste 500 Zeichen):"
    echo "$RESPONSE" | head -c 500
    echo ""
else
    echo "❌ API funktioniert NICHT lokal"
    echo "Response: ${RESPONSE:0:200}..."
    echo ""
    echo "→ Mögliche Ursache: Route nicht im Build enthalten"
    echo "→ Lösung: App neu bauen"
fi
echo ""

# 3. Prüfe Build
echo "3️⃣ Prüfe Build..."
if [ -d ".next" ]; then
    echo "✅ Build-Verzeichnis existiert"
    
    # Prüfe ob Route im Build ist
    if [ -f ".next/server/app/api/debug-resend/route.js" ] || [ -f ".next/server/pages/api/debug-resend.js" ]; then
        echo "✅ Route ist im Build enthalten"
    else
        echo "⚠️  Route könnte nicht im Build sein"
        echo "   Prüfe .next/server/app/api/ oder .next/server/pages/api/"
        ls -la .next/server/app/api/ 2>/dev/null | head -10 || echo "   Verzeichnis nicht gefunden"
    fi
else
    echo "❌ Build-Verzeichnis fehlt!"
    echo "→ Lösung: npm run build ausführen"
fi
echo ""

# 4. Prüfe ob App läuft
echo "4️⃣ Prüfe App-Status..."
if pgrep -f 'next start' > /dev/null; then
    PID=$(pgrep -f 'next start' | head -1)
    echo "✅ App läuft (PID: $PID)"
else
    echo "❌ App läuft NICHT!"
fi
echo ""

# 5. Empfehlung
echo "================================"
echo "📊 EMPFEHLUNG"
echo "================================"
echo ""

if ! echo "$RESPONSE" | grep -q "resendIsNull\|success"; then
    echo "→ App neu bauen und neu starten:"
    echo "  pkill -f 'next start'"
    echo "  npm run build"
    echo "  npm start > /tmp/next.log 2>&1 &"
else
    echo "✅ API funktioniert lokal - Problem liegt bei Nginx oder Routing"
    echo "→ Prüfe Nginx-Konfiguration"
fi
