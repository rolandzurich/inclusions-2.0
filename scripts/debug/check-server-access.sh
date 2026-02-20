#!/bin/bash
# Prüft und stellt sicher, dass die Seite auf 10.55.55.155 ohne VPN erreichbar ist

echo "=== Prüfe Server-Konfiguration für 10.55.55.155 ==="
echo ""

# Nginx-Konfiguration prüfen
NGINX_CONFIG="/etc/nginx/sites-available/inclusions"

echo "🔍 Prüfe Nginx-Konfiguration..."
if [ -f "$NGINX_CONFIG" ]; then
    echo "✅ Nginx-Konfiguration gefunden: $NGINX_CONFIG"
    
    # Prüfe ob server_name korrekt ist
    if grep -q "server_name.*10.55.55.155" "$NGINX_CONFIG"; then
        echo "✅ server_name enthält 10.55.55.155"
    else
        echo "⚠️  server_name enthält NICHT 10.55.55.155"
        echo "   Aktualisiere Konfiguration..."
        sudo sed -i 's/server_name .*/server_name 10.55.55.155 _;/' "$NGINX_CONFIG"
        echo "✅ Konfiguration aktualisiert"
    fi
    
    # Prüfe Konfiguration
    echo ""
    echo "🔍 Validiere Nginx-Konfiguration..."
    if sudo nginx -t 2>&1 | grep -q "successful"; then
        echo "✅ Nginx-Konfiguration ist gültig"
        
        # Neu laden
        echo ""
        echo "🔄 Lade Nginx neu..."
        sudo systemctl reload nginx
        echo "✅ Nginx neu geladen"
    else
        echo "❌ Nginx-Konfiguration hat Fehler!"
        sudo nginx -t
        exit 1
    fi
else
    echo "❌ Nginx-Konfiguration nicht gefunden: $NGINX_CONFIG"
    exit 1
fi

# Firewall prüfen
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
    echo "⚠️  UFW nicht gefunden - prüfe Firewall manuell"
fi

# Next.js App prüfen
echo ""
echo "🔍 Prüfe Next.js App..."
if pgrep -f "next start" > /dev/null; then
    echo "✅ Next.js App läuft"
else
    echo "⚠️  Next.js App läuft NICHT"
    echo "   Starte App..."
    cd ~/inclusions-2.0
    pkill -f "next start" 2>/dev/null
    npm start > /tmp/next.log 2>&1 &
    sleep 2
    if pgrep -f "next start" > /dev/null; then
        echo "✅ Next.js App gestartet"
    else
        echo "❌ Next.js App konnte nicht gestartet werden"
        echo "   Prüfe Logs: tail -f /tmp/next.log"
    fi
fi

# Netzwerk-Interface prüfen
echo ""
echo "🔍 Prüfe Netzwerk-Interface..."
if ip addr show | grep -q "10.55.55.155"; then
    echo "✅ Server hat IP 10.55.55.155"
else
    echo "⚠️  IP 10.55.55.155 nicht auf diesem Server gefunden"
    echo "   Das ist OK, wenn das Data-Center NAT/Port-Forwarding verwendet"
fi

echo ""
echo "=== Fertig! ==="
echo ""
echo "Die Seite sollte jetzt erreichbar sein unter:"
echo "  http://10.55.55.155"
echo ""
echo "Teste es jetzt ohne VPN!"
echo ""
echo "Falls es nicht funktioniert:"
echo "1. Prüfe mit deinem Freund vom Data-Center, ob Port 80 weitergeleitet wird"
echo "2. Prüfe ob die Firewall im Data-Center Port 80 erlaubt"
echo "3. Prüfe Nginx-Logs: sudo tail -f /var/log/nginx/inclusions-error.log"
