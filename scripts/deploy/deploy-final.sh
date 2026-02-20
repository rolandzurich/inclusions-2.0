#!/bin/bash
set -e

echo "🚀 FINAL DEPLOYMENT - PostgreSQL"
echo "================================"

# 1. Lokal bauen
echo ""
echo "📦 1. Baue lokal..."
cd /Users/roland/Curser/inclusions-2.0
npm run build

# 2. Kopiere zum Server
echo ""
echo "📤 2. Kopiere zum Server..."
scp -i ~/.ssh/inclusions_server -r .next incluzone@10.55.55.155:~/inclusions-2.0/
scp -i ~/.ssh/inclusions_server -r app incluzone@10.55.55.155:~/inclusions-2.0/
scp -i ~/.ssh/inclusions_server -r lib incluzone@10.55.55.155:~/inclusions-2.0/

# 3. Starte auf Server
echo ""
echo "🔄 3. Starte App auf Server..."
ssh -i ~/.ssh/inclusions_server incluzone@10.55.55.155 << 'ENDSSH'
killall -9 node 2>/dev/null || true
cd ~/inclusions-2.0
npm start > /tmp/app-final.log 2>&1 &
echo "App gestartet, warte 20 Sekunden..."
sleep 20
ENDSSH

# 4. Teste
echo ""
echo "🧪 4. Teste Newsletter API..."
ssh -i ~/.ssh/inclusions_server incluzone@10.55.55.155 << 'ENDSSH'
curl -X POST http://localhost:3000/api/newsletter \
  -H "Content-Type: application/json" \
  -d '{"email":"deployment@success.ch","first_name":"Deployment","last_name":"Success","interests":["events"]}' \
  -s -o /dev/null -w "HTTP Status: %{http_code}\n"

echo ""
echo "Warte 5 Sekunden für DB-Insert..."
sleep 5

echo ""
echo "📊 5. Prüfe Datenbank:"
echo '13vor12!Asdf' | sudo -S -u postgres psql -d inclusions_db -c 'SELECT id, email, first_name, status, created_at FROM newsletter_subscribers ORDER BY created_at DESC LIMIT 3;'

echo ""
echo "📝 6. Letzte App-Logs:"
tail -30 /tmp/app-final.log | grep -E 'Newsletter|Pool|PostgreSQL|Ready|ERROR' || tail -30 /tmp/app-final.log
ENDSSH

echo ""
echo "✅ DEPLOYMENT FERTIG!"
