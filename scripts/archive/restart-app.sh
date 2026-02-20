#!/bin/bash
# Script um die App sauber neu zu starten

echo "🛑 Stoppe alle Node/NPM Prozesse..."
ps aux | grep -E "(next|npm)" | grep -v grep | awk '{print $2}' | xargs -r kill -9
sleep 3

echo "✅ Alle Prozesse gestoppt"
ps aux | grep -E "(next|npm)" | grep -v grep || echo "Keine Prozesse mehr"

echo "🚀 Starte App neu..."
cd ~/inclusions-2.0
nohup npm start > /tmp/app-live.log 2>&1 &
sleep 10

echo "📊 Status:"
ps aux | grep "next start" | grep -v grep && echo "✅ App läuft" || echo "❌ App läuft nicht"

echo "📜 Letzte Logs:"
tail -20 /tmp/app-live.log
