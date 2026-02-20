#!/bin/bash
# Vollständiger Status-Check

echo "🔍 Vollständiger Status-Check"
echo "=============================="
echo ""

echo "1️⃣ Nginx Status:"
sudo systemctl status nginx --no-pager | head -5
echo ""

echo "2️⃣ Next.js Prozess:"
ps aux | grep "next start" | grep -v grep
if [ $? -ne 0 ]; then
    echo "⚠️  Next.js läuft NICHT!"
else
    echo "✅ Next.js läuft"
fi
echo ""

echo "3️⃣ Teste Next.js direkt (Port 3000):"
curl -I http://localhost:3000 2>&1 | head -10
echo ""

echo "4️⃣ Teste Nginx-Proxy (Port 80):"
curl -I http://localhost 2>&1 | head -10
echo ""

echo "5️⃣ Prüfe ob inclusions.zone konfiguriert ist:"
sudo nginx -T 2>/dev/null | grep -A 3 "inclusions.zone" | head -5
echo ""

echo "6️⃣ Prüfe Nginx-Logs (letzte Fehler):"
sudo tail -5 /var/log/nginx/error.log 2>/dev/null || echo "Keine Fehler gefunden"
echo ""

echo "✅ Check abgeschlossen!"
