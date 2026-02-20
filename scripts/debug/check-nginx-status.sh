#!/bin/bash
# Prüfe Nginx-Konfiguration und Website-Status

echo "🔍 Prüfe Nginx-Konfiguration und Website-Status"
echo "================================================"
echo ""

echo "📋 Schritt 1: Prüfe aktive Nginx-Konfigurationen..."
echo ""
sudo nginx -T 2>/dev/null | grep -A 5 "server_name" | head -20

echo ""
echo "📋 Schritt 2: Prüfe ob inclusions.zone konfiguriert ist..."
if sudo nginx -T 2>/dev/null | grep -q "inclusions.zone"; then
    echo "✅ inclusions.zone ist in der Nginx-Konfiguration"
else
    echo "❌ inclusions.zone ist NICHT in der Nginx-Konfiguration"
fi

echo ""
echo "📋 Schritt 3: Prüfe Nginx-Status..."
sudo systemctl status nginx --no-pager -l | head -15

echo ""
echo "📋 Schritt 4: Teste lokale Verbindung..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200\|404\|500"; then
    echo "✅ Next.js läuft auf Port 3000"
    curl -s http://localhost:3000 | head -5
else
    echo "⚠️  Next.js antwortet nicht auf Port 3000"
    echo "   Prüfe: ps aux | grep 'next start'"
fi

echo ""
echo "📋 Schritt 5: Teste Nginx-Proxy..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost | grep -q "200\|404\|500"; then
    echo "✅ Nginx-Proxy funktioniert"
    curl -s http://localhost | head -5
else
    echo "⚠️  Nginx-Proxy antwortet nicht"
fi

echo ""
echo "📋 Schritt 6: Prüfe Nginx-Logs (letzte 10 Zeilen)..."
echo ""
sudo tail -10 /var/log/nginx/error.log 2>/dev/null || echo "Keine Fehler-Logs gefunden"

echo ""
echo "✅ Prüfung abgeschlossen!"
echo ""
echo "📋 Nächste Schritte:"
echo "1. Warte auf DNS-Propagierung (15-60 Minuten)"
echo "2. Prüfe DNS: https://dnschecker.org/#A/inclusions.zone"
echo "3. Teste Website: http://inclusions.zone"
echo "4. Falls Warnungen: Prüfe alte Nginx-Konfigurationen"
