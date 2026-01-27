#!/bin/bash

# Kompletter Fix - führt ALLES durch bis zum Ende
set -e

SERVER="10.55.55.155"
USER="incluzone"
SSH_KEY="$HOME/.ssh/inclusions_server"
REMOTE_DIR="~/inclusions-2.0"

echo "🔧 KOMPLETTER FIX - Alle Schritte"
echo "=================================="
echo ""

# 1. Kopiere Route-Dateien
echo "1️⃣ Kopiere Route-Dateien..."
scp -i "$SSH_KEY" app/api/debug-resend/route.ts "$USER@$SERVER:$REMOTE_DIR/app/api/debug-resend/route.ts"
scp -i "$SSH_KEY" app/api/newsletter/route.ts "$USER@$SERVER:$REMOTE_DIR/app/api/newsletter/route.ts"
echo "✅ Dateien kopiert"
echo ""

# 2. Stoppe App komplett
echo "2️⃣ Stoppe App..."
ssh -i "$SSH_KEY" "$USER@$SERVER" "pkill -9 -f 'next start' 2>/dev/null || true"
sleep 3
echo "✅ App gestoppt"
echo ""

# 3. Lösche Build komplett
echo "3️⃣ Lösche Build..."
ssh -i "$SSH_KEY" "$USER@$SERVER" "cd $REMOTE_DIR && rm -rf .next"
echo "✅ Build gelöscht"
echo ""

# 4. Baue App neu (mit Output)
echo "4️⃣ Baue App neu (kann 2-3 Minuten dauern)..."
ssh -i "$SSH_KEY" "$USER@$SERVER" "cd $REMOTE_DIR && npm run build 2>&1 | tail -50"
echo ""

# 5. Prüfe Build
echo "5️⃣ Prüfe Build..."
BUILD_FILES=$(ssh -i "$SSH_KEY" "$USER@$SERVER" "cd $REMOTE_DIR && find .next/server -name '*debug-resend*' -o -name '*newsletter*' 2>/dev/null | head -5")
if [ -n "$BUILD_FILES" ]; then
    echo "✅ Route-Dateien im Build gefunden:"
    echo "$BUILD_FILES"
else
    echo "⚠️  Route-Dateien nicht im Build gefunden"
    echo "Prüfe Build-Struktur:"
    ssh -i "$SSH_KEY" "$USER@$SERVER" "cd $REMOTE_DIR && ls -la .next/server/app/api/ 2>/dev/null || ls -la .next/server/pages/api/ 2>/dev/null || echo 'Keine API-Verzeichnisse gefunden'"
fi
echo ""

# 6. Starte App
echo "6️⃣ Starte App..."
ssh -i "$SSH_KEY" "$USER@$SERVER" "cd $REMOTE_DIR && nohup npm start > /tmp/next.log 2>&1 &"
sleep 8
echo "✅ App gestartet"
echo ""

# 7. Prüfe ob App läuft
echo "7️⃣ Prüfe App-Status..."
if ssh -i "$SSH_KEY" "$USER@$SERVER" "pgrep -f 'next start' > /dev/null"; then
    PID=$(ssh -i "$SSH_KEY" "$USER@$SERVER" "pgrep -f 'next start' | head -1")
    echo "✅ App läuft (PID: $PID)"
else
    echo "❌ App läuft NICHT!"
    echo "Logs:"
    ssh -i "$SSH_KEY" "$USER@$SERVER" "tail -30 /tmp/next.log"
    exit 1
fi
echo ""

# 8. Teste API lokal
echo "8️⃣ Teste API lokal..."
sleep 3
LOCAL_RESPONSE=$(ssh -i "$SSH_KEY" "$USER@$SERVER" "curl -s http://localhost:3000/api/debug-resend 2>&1" || echo "CURL_ERROR")
if echo "$LOCAL_RESPONSE" | grep -q "resendIsNull\|success"; then
    echo "✅✅✅ API FUNKTIONIERT LOKAL! ✅✅✅"
    echo ""
    echo "Response:"
    echo "$LOCAL_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$LOCAL_RESPONSE" | head -c 500
else
    echo "❌ API funktioniert noch nicht lokal"
    echo "Response (erste 300 Zeichen):"
    echo "${LOCAL_RESPONSE:0:300}..."
    echo ""
    echo "Logs:"
    ssh -i "$SSH_KEY" "$USER@$SERVER" "tail -40 /tmp/next.log | grep -iE '(error|warn|api|route)' || tail -20 /tmp/next.log"
fi
echo ""

# 9. Teste über Domain
echo "9️⃣ Teste API über Domain..."
sleep 2
DOMAIN_RESPONSE=$(curl -s https://inclusions.zone/api/debug-resend 2>&1 | head -c 300)
if echo "$DOMAIN_RESPONSE" | grep -q "resendIsNull\|success"; then
    echo "✅✅✅ API FUNKTIONIERT ÜBER DOMAIN! ✅✅✅"
else
    echo "⚠️  API funktioniert noch nicht über Domain"
    echo "Response: ${DOMAIN_RESPONSE:0:200}..."
    echo ""
    echo "→ Falls lokal funktioniert, prüfe Nginx:"
    echo "  ssh -i $SSH_KEY $USER@$SERVER 'sudo nginx -t && sudo systemctl reload nginx'"
fi
echo ""

echo "================================"
echo "✅ FERTIG!"
echo "================================"
