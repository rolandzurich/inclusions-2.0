#!/bin/bash
# Server-Konfiguration für 10.55.55.155
# Dieses Skript wird direkt auf dem Server ausgeführt

echo "=== Konfiguriere Server für 10.55.55.155 ==="
echo ""

# 1. Nginx-Konfiguration aktualisieren
echo "🔍 Aktualisiere Nginx-Konfiguration..."
sudo sed -i 's/server_name .*/server_name 10.55.55.155 _;/' /etc/nginx/sites-available/inclusions
echo "✅ Konfiguration aktualisiert"

# 2. Nginx prüfen
echo ""
echo "🔍 Prüfe Nginx..."
if sudo nginx -t 2>&1 | grep -q "successful"; then
    echo "✅ Nginx-Konfiguration ist gültig"
    
    # 3. Nginx neu laden
    echo ""
    echo "🔄 Lade Nginx neu..."
    sudo systemctl reload nginx
    echo "✅ Nginx neu geladen"
else
    echo "❌ Nginx-Konfiguration hat Fehler!"
    sudo nginx -t
    exit 1
fi

# 4. Firewall prüfen
echo ""
echo "🔥 Prüfe Firewall..."
if command -v ufw &> /dev/null; then
    if sudo ufw status | grep -q "80/tcp.*ALLOW"; then
        echo "✅ Port 80 ist bereits geöffnet"
    else
        echo "🔧 Öffne Port 80..."
        sudo ufw allow 80/tcp
        echo "✅ Port 80 geöffnet"
    fi
else
    echo "⚠️  UFW nicht verfügbar - prüfe Firewall manuell"
fi

# 5. Next.js App prüfen
echo ""
echo "🔍 Prüfe Next.js App..."
cd ~/inclusions-2.0
if pgrep -f "next start" > /dev/null; then
    echo "✅ Next.js App läuft bereits"
else
    echo "⚠️  Starte App..."
    pkill -f "next start" 2>/dev/null
    npm start > /tmp/next.log 2>&1 &
    sleep 2
    if pgrep -f "next start" > /dev/null; then
        echo "✅ Next.js App gestartet"
    else
        echo "❌ App konnte nicht gestartet werden"
        echo "   Prüfe Logs: tail -f /tmp/next.log"
    fi
fi

echo ""
echo "=== Fertig! ==="
echo ""
echo "Die Seite sollte jetzt erreichbar sein unter:"
echo "  http://10.55.55.155"
echo ""
echo "Teste es jetzt ohne VPN!"
