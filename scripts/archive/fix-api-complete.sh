#!/bin/bash

# Kompletter Fix für API Routes
# Führe aus: bash fix-api-complete.sh

set -e

SERVER="10.55.55.155"
USER="incluzone"
SSH_KEY="$HOME/.ssh/inclusions_server"
REMOTE_DIR="~/inclusions-2.0"

echo "🔧 Kompletter Fix für API Routes"
echo "================================"
echo ""

# 1. Prüfe lokale Dateien
echo "1️⃣ Prüfe lokale Route-Dateien..."
if [ ! -f "app/api/debug-resend/route.ts" ]; then
    echo "❌ app/api/debug-resend/route.ts fehlt lokal!"
    exit 1
fi
echo "✅ Route-Dateien existieren lokal"
echo ""

# 2. Erstelle Verzeichnisse auf Server
echo "2️⃣ Erstelle Verzeichnisse auf Server..."
ssh -i "$SSH_KEY" "$USER@$SERVER" "mkdir -p $REMOTE_DIR/app/api/debug-resend"
ssh -i "$SSH_KEY" "$USER@$SERVER" "mkdir -p $REMOTE_DIR/app/api/newsletter"
echo "✅ Verzeichnisse erstellt"
echo ""

# 3. Kopiere Route-Dateien
echo "3️⃣ Kopiere Route-Dateien auf Server..."
scp -i "$SSH_KEY" app/api/debug-resend/route.ts "$USER@$SERVER:$REMOTE_DIR/app/api/debug-resend/route.ts"
scp -i "$SSH_KEY" app/api/newsletter/route.ts "$USER@$SERVER:$REMOTE_DIR/app/api/newsletter/route.ts"
echo "✅ Dateien kopiert"
echo ""

# 4. Prüfe ob Dateien angekommen sind
echo "4️⃣ Prüfe Dateien auf Server..."
ssh -i "$SSH_KEY" "$USER@$SERVER" "ls -la $REMOTE_DIR/app/api/debug-resend/"
if [ $? -eq 0 ]; then
    echo "✅ Dateien sind auf Server"
else
    echo "❌ Dateien fehlen auf Server!"
    exit 1
fi
echo ""

# 5. Stoppe App
echo "5️⃣ Stoppe App..."
ssh -i "$SSH_KEY" "$USER@$SERVER" "pkill -f 'next start' 2>/dev/null || true"
sleep 2
echo "✅ App gestoppt"
echo ""

# 6. Lösche alten Build
echo "6️⃣ Lösche alten Build..."
ssh -i "$SSH_KEY" "$USER@$SERVER" "cd $REMOTE_DIR && rm -rf .next"
echo "✅ Alter Build gelöscht"
echo ""

# 7. Baue App neu
echo "7️⃣ Baue App neu (kann 1-2 Minuten dauern)..."
ssh -i "$SSH_KEY" "$USER@$SERVER" "cd $REMOTE_DIR && npm run build"
if [ $? -eq 0 ]; then
    echo "✅ Build erfolgreich"
else
    echo "❌ Build fehlgeschlagen!"
    exit 1
fi
echo ""

# 8. Prüfe ob Route im Build ist
echo "8️⃣ Prüfe ob Route im Build enthalten ist..."
BUILD_CHECK=$(ssh -i "$SSH_KEY" "$USER@$SERVER" "cd $REMOTE_DIR && (ls -la .next/server/app/api/debug-resend/route.js 2>/dev/null || ls -la .next/server/pages/api/debug-resend.js 2>/dev/null || echo 'NOT_FOUND')")
if echo "$BUILD_CHECK" | grep -q "route.js"; then
    echo "✅ Route ist im Build enthalten"
else
    echo "⚠️  Route nicht im Build gefunden"
    echo "Build-Check: $BUILD_CHECK"
fi
echo ""

# 9. Starte App
echo "9️⃣ Starte App..."
ssh -i "$SSH_KEY" "$USER@$SERVER" "cd $REMOTE_DIR && npm start > /tmp/next.log 2>&1 &"
sleep 5
echo "✅ App gestartet"
echo ""

# 10. Prüfe ob App läuft
echo "🔟 Prüfe App-Status..."
if ssh -i "$SSH_KEY" "$USER@$SERVER" "pgrep -f 'next start' > /dev/null"; then
    echo "✅ App läuft"
else
    echo "❌ App läuft NICHT!"
    ssh -i "$SSH_KEY" "$USER@$SERVER" "tail -20 /tmp/next.log"
    exit 1
fi
echo ""

# 11. Teste API lokal
echo "1️⃣1️⃣ Teste API lokal (localhost:3000)..."
sleep 3
LOCAL_RESPONSE=$(ssh -i "$SSH_KEY" "$USER@$SERVER" "curl -s http://localhost:3000/api/debug-resend 2>&1")
if echo "$LOCAL_RESPONSE" | grep -q "resendIsNull\|success"; then
    echo "✅ API funktioniert lokal!"
    echo ""
    echo "Response (erste 400 Zeichen):"
    echo "$LOCAL_RESPONSE" | head -c 400
    echo ""
else
    echo "❌ API funktioniert noch nicht lokal"
    echo "Response: ${LOCAL_RESPONSE:0:300}..."
    echo ""
    echo "Logs:"
    ssh -i "$SSH_KEY" "$USER@$SERVER" "tail -30 /tmp/next.log"
fi
echo ""

# 12. Teste über Domain
echo "1️⃣2️⃣ Teste API über Domain (inclusions.zone)..."
sleep 2
DOMAIN_RESPONSE=$(curl -s https://inclusions.zone/api/debug-resend 2>&1 | head -c 300)
if echo "$DOMAIN_RESPONSE" | grep -q "resendIsNull\|success"; then
    echo "✅ API funktioniert über Domain!"
else
    echo "⚠️  API funktioniert noch nicht über Domain"
    echo "Response: ${DOMAIN_RESPONSE:0:200}..."
    echo ""
    echo "→ Falls lokal funktioniert, prüfe Nginx-Konfiguration"
fi
echo ""

echo "================================"
echo "✅ Fertig!"
echo "================================"
echo ""
echo "Nächste Schritte:"
echo "1. Teste: curl https://inclusions.zone/api/debug-resend"
echo "2. Teste Newsletter-Anmeldung auf https://inclusions.zone/newsletter"
echo "3. Prüfe Logs: ssh -i $SSH_KEY $USER@$SERVER 'tail -f /tmp/next.log'"
