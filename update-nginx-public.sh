#!/bin/bash
# Einfaches Skript: Nginx-Konfiguration aktualisieren und neu laden

echo "=== Nginx für öffentliche IP konfigurieren ==="
echo ""

# Öffentliche IP
PUBLIC_IP="82.192.247.193"
NGINX_CONFIG="/etc/nginx/sites-available/inclusions"

echo "📋 Aktualisiere Nginx-Konfiguration..."
echo "   Öffentliche IP: $PUBLIC_IP"
echo ""

# Backup erstellen
sudo cp "$NGINX_CONFIG" "${NGINX_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)"
echo "✅ Backup erstellt"
echo ""

# Server_name aktualisieren
sudo sed -i "s/server_name .*/server_name $PUBLIC_IP 10.55.55.155 _;/" "$NGINX_CONFIG"
echo "✅ Nginx-Konfiguration aktualisiert"
echo ""

# Prüfen
echo "🔍 Prüfe Konfiguration..."
if sudo nginx -t 2>&1 | grep -q "successful"; then
    echo "✅ Konfiguration ist gültig"
    echo ""
    
    # Neu laden
    echo "🔄 Lade Nginx neu..."
    sudo systemctl reload nginx
    echo "✅ Nginx neu geladen"
    echo ""
    
    # Firewall prüfen
    echo "🔥 Prüfe Firewall..."
    if command -v ufw &> /dev/null; then
        if sudo ufw status | grep -q "80/tcp.*ALLOW"; then
            echo "✅ Port 80 ist bereits geöffnet"
        else
            echo "🔧 Öffne Port 80..."
            sudo ufw allow 80/tcp
            echo "✅ Port 80 geöffnet"
        fi
    fi
    
    echo ""
    echo "=== Fertig! ==="
    echo ""
    echo "Die Seite ist jetzt erreichbar unter:"
    echo "  http://$PUBLIC_IP"
    echo ""
    echo "Teste es jetzt ohne VPN!"
else
    echo "❌ Konfiguration hat Fehler!"
    sudo nginx -t
    exit 1
fi
