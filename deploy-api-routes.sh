#!/bin/bash

# Deploy API Routes auf Server
# Führe aus: bash deploy-api-routes.sh

SERVER="10.55.55.155"
USER="incluzone"
SSH_KEY="$HOME/.ssh/inclusions_server"

echo "📦 Deploy API Routes auf Server"
echo "================================"
echo ""

# 1. Prüfe ob Route lokal existiert
echo "1️⃣ Prüfe lokale Route-Dateien..."
if [ -f "app/api/debug-resend/route.ts" ]; then
    echo "✅ debug-resend/route.ts existiert lokal"
else
    echo "❌ debug-resend/route.ts fehlt lokal!"
    exit 1
fi

if [ -f "app/api/test-resend/route.ts" ]; then
    echo "✅ test-resend/route.ts existiert lokal"
fi

if [ -f "app/api/newsletter/route.ts" ]; then
    echo "✅ newsletter/route.ts existiert lokal"
fi
echo ""

# 2. Erstelle Verzeichnisse auf Server
echo "2️⃣ Erstelle Verzeichnisse auf Server..."
ssh -i "$SSH_KEY" "$USER@$SERVER" "mkdir -p ~/inclusions-2.0/app/api/debug-resend"
ssh -i "$SSH_KEY" "$USER@$SERVER" "mkdir -p ~/inclusions-2.0/app/api/test-resend"
ssh -i "$SSH_KEY" "$USER@$SERVER" "mkdir -p ~/inclusions-2.0/app/api/newsletter"
echo "✅ Verzeichnisse erstellt"
echo ""

# 3. Kopiere Route-Dateien
echo "3️⃣ Kopiere Route-Dateien..."
scp -i "$SSH_KEY" app/api/debug-resend/route.ts "$USER@$SERVER:~/inclusions-2.0/app/api/debug-resend/route.ts"
scp -i "$SSH_KEY" app/api/test-resend/route.ts "$USER@$SERVER:~/inclusions-2.0/app/api/test-resend/route.ts" 2>/dev/null || echo "⚠️  test-resend/route.ts nicht gefunden (optional)"
scp -i "$SSH_KEY" app/api/newsletter/route.ts "$USER@$SERVER:~/inclusions-2.0/app/api/newsletter/route.ts"
echo "✅ Dateien kopiert"
echo ""

# 4. Prüfe ob Dateien auf Server angekommen sind
echo "4️⃣ Prüfe Dateien auf Server..."
ssh -i "$SSH_KEY" "$USER@$SERVER" "ls -la ~/inclusions-2.0/app/api/debug-resend/"
echo ""

# 5. Baue App neu
echo "5️⃣ Baue App neu..."
ssh -i "$SSH_KEY" "$USER@$SERVER" "cd ~/inclusions-2.0 && pkill -f 'next start' 2>/dev/null; rm -rf .next && npm run build"
echo ""

# 6. Starte App
echo "6️⃣ Starte App..."
ssh -i "$SSH_KEY" "$USER@$SERVER" "cd ~/inclusions-2.0 && npm start > /tmp/next.log 2>&1 &"
sleep 5
echo ""

# 7. Teste API
echo "7️⃣ Teste API..."
sleep 3
RESPONSE=$(ssh -i "$SSH_KEY" "$USER@$SERVER" "curl -s http://localhost:3000/api/debug-resend 2>&1")
if echo "$RESPONSE" | grep -q "resendIsNull\|success"; then
    echo "✅ API funktioniert!"
    echo "$RESPONSE" | head -c 300
else
    echo "❌ API funktioniert noch nicht"
    echo "Response: ${RESPONSE:0:200}..."
fi
echo ""

echo "✅ Fertig!"
echo ""
echo "Teste jetzt: curl https://inclusions.zone/api/debug-resend"
