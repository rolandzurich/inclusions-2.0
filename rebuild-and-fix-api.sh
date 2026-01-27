#!/bin/bash

# Rebuild App und fix API Routes
# Führe direkt auf dem Server aus: ssh incluzone@10.55.55.155 "bash -s" < rebuild-and-fix-api.sh

set -e

echo "🔧 Rebuild App und fix API Routes"
echo "=================================="
echo ""

cd ~/inclusions-2.0 || { echo "❌ Verzeichnis nicht gefunden!"; exit 1; }

# 1. Stoppe App
echo "1️⃣ Stoppe App..."
pkill -f 'next start' 2>/dev/null && echo "   ✅ App gestoppt" || echo "   ⚠️  Keine laufende App gefunden"
sleep 2
echo ""

# 2. Prüfe ob Route existiert
echo "2️⃣ Prüfe API-Route..."
if [ -f "app/api/debug-resend/route.ts" ]; then
    echo "✅ Route-Datei existiert: app/api/debug-resend/route.ts"
else
    echo "❌ Route-Datei fehlt!"
    exit 1
fi
echo ""

# 3. Lösche alten Build
echo "3️⃣ Lösche alten Build..."
if [ -d ".next" ]; then
    rm -rf .next
    echo "✅ Alten Build gelöscht"
else
    echo "⚠️  Kein alter Build gefunden"
fi
echo ""

# 4. Baue App neu
echo "4️⃣ Baue App neu..."
echo "   (Dies kann 1-2 Minuten dauern...)"
npm run build
if [ $? -eq 0 ]; then
    echo "✅ Build erfolgreich"
else
    echo "❌ Build fehlgeschlagen!"
    exit 1
fi
echo ""

# 5. Prüfe ob Route im Build ist
echo "5️⃣ Prüfe ob Route im Build enthalten ist..."
if [ -f ".next/server/app/api/debug-resend/route.js" ]; then
    echo "✅ Route ist im Build enthalten"
elif [ -f ".next/server/pages/api/debug-resend.js" ]; then
    echo "✅ Route ist im Build enthalten (Pages Router)"
else
    echo "⚠️  Route nicht im Build gefunden"
    echo "   Prüfe .next/server/app/api/ oder .next/server/pages/api/"
    ls -la .next/server/app/api/ 2>/dev/null | head -5 || echo "   Verzeichnis nicht gefunden"
fi
echo ""

# 6. Starte App
echo "6️⃣ Starte App..."
npm start > /tmp/next.log 2>&1 &
sleep 5
echo ""

# 7. Prüfe Status
echo "7️⃣ Prüfe Status..."
if pgrep -f 'next start' > /dev/null; then
    PID=$(pgrep -f 'next start' | head -1)
    echo "✅ App läuft (PID: $PID)"
else
    echo "❌ App läuft NICHT!"
    echo "Logs:"
    tail -20 /tmp/next.log
    exit 1
fi
echo ""

# 8. Teste API lokal
echo "8️⃣ Teste API lokal..."
sleep 2
RESPONSE=$(curl -s http://localhost:3000/api/debug-resend 2>&1)
if echo "$RESPONSE" | grep -q "resendIsNull\|success"; then
    echo "✅ API funktioniert lokal!"
    echo ""
    echo "Response (erste 300 Zeichen):"
    echo "$RESPONSE" | head -c 300
    echo ""
else
    echo "❌ API funktioniert noch nicht lokal"
    echo "Response: ${RESPONSE:0:200}..."
    echo ""
    echo "Logs:"
    tail -20 /tmp/next.log
fi
echo ""

# 9. Teste über Domain
echo "9️⃣ Teste über Domain (inclusions.zone)..."
sleep 2
DOMAIN_RESPONSE=$(curl -s https://inclusions.zone/api/debug-resend 2>&1 | head -c 300)
if echo "$DOMAIN_RESPONSE" | grep -q "resendIsNull\|success"; then
    echo "✅ API funktioniert über Domain!"
else
    echo "⚠️  API funktioniert noch nicht über Domain"
    echo "Response: ${DOMAIN_RESPONSE:0:200}..."
    echo ""
    echo "→ Prüfe Nginx-Konfiguration oder warte auf DNS-Propagierung"
fi
echo ""

echo "================================"
echo "✅ Fertig!"
echo "================================"
echo ""
echo "Nächste Schritte:"
echo "1. Teste Newsletter-Anmeldung auf https://inclusions.zone/newsletter"
echo "2. Prüfe Logs: tail -f /tmp/next.log"
echo "3. Prüfe Resend Dashboard: https://resend.com/emails"
