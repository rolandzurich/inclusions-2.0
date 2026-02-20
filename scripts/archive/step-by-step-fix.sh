#!/bin/bash

# Schritt-für-Schritt Fix - keine langen Wartezeiten
SERVER="10.55.55.155"
USER="incluzone"
SSH_KEY="$HOME/.ssh/inclusions_server"
REMOTE_DIR="~/inclusions-2.0"

echo "🔧 Schritt-für-Schritt Fix"
echo "=========================="
echo ""

# Schritt 1: Dateien kopieren
echo "Schritt 1/6: Kopiere Route-Dateien..."
scp -i "$SSH_KEY" app/api/debug-resend/route.ts "$USER@$SERVER:$REMOTE_DIR/app/api/debug-resend/route.ts" 2>&1
scp -i "$SSH_KEY" app/api/newsletter/route.ts "$USER@$SERVER:$REMOTE_DIR/app/api/newsletter/route.ts" 2>&1
echo "✅ Schritt 1 fertig"
echo ""

# Schritt 2: App stoppen
echo "Schritt 2/6: Stoppe App..."
ssh -i "$SSH_KEY" "$USER@$SERVER" "pkill -9 -f 'next start' 2>/dev/null; sleep 1; echo 'App gestoppt'"
echo "✅ Schritt 2 fertig"
echo ""

# Schritt 3: Build löschen
echo "Schritt 3/6: Lösche Build..."
ssh -i "$SSH_KEY" "$USER@$SERVER" "cd $REMOTE_DIR && rm -rf .next && echo 'Build gelöscht'"
echo "✅ Schritt 3 fertig"
echo ""

# Schritt 4: Build (ohne lange Wartezeit - Output wird nicht angezeigt)
echo "Schritt 4/6: Baue App neu (dauert 1-2 Minuten)..."
ssh -i "$SSH_KEY" "$USER@$SERVER" "cd $REMOTE_DIR && npm run build > /tmp/build.log 2>&1 && echo 'Build erfolgreich' || (tail -20 /tmp/build.log && echo 'Build fehlgeschlagen')"
echo "✅ Schritt 4 fertig"
echo ""

# Schritt 5: App starten
echo "Schritt 5/6: Starte App..."
ssh -i "$SSH_KEY" "$USER@$SERVER" "cd $REMOTE_DIR && nohup npm start > /tmp/next.log 2>&1 & sleep 3 && pgrep -f 'next start' > /dev/null && echo 'App läuft' || echo 'App start fehlgeschlagen'"
echo "✅ Schritt 5 fertig"
echo ""

# Schritt 6: Test
echo "Schritt 6/6: Teste API..."
sleep 5
RESPONSE=$(ssh -i "$SSH_KEY" "$USER@$SERVER" "curl -s http://localhost:3000/api/debug-resend 2>&1" | head -c 200)
if echo "$RESPONSE" | grep -q "resendIsNull\|success"; then
    echo "✅✅✅ API FUNKTIONIERT! ✅✅✅"
    echo ""
    ssh -i "$SSH_KEY" "$USER@$SERVER" "curl -s http://localhost:3000/api/debug-resend" | python3 -m json.tool 2>/dev/null || ssh -i "$SSH_KEY" "$USER@$SERVER" "curl -s http://localhost:3000/api/debug-resend" | head -c 500
else
    echo "❌ API funktioniert noch nicht"
    echo "Response: $RESPONSE"
    echo ""
    echo "Logs:"
    ssh -i "$SSH_KEY" "$USER@$SERVER" "tail -20 /tmp/next.log"
fi
echo ""
echo "✅ Fertig! Teste jetzt: curl https://inclusions.zone/api/debug-resend"
