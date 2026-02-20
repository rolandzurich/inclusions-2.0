#!/bin/bash
# Automatisches Setup: Seite ohne VPN erreichbar machen

echo "=== Seite ohne VPN erreichbar machen ==="
echo ""

# 1. Öffentliche IP herausfinden
echo "🔍 Prüfe öffentliche IP..."
PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s icanhazip.com 2>/dev/null)

if [ -z "$PUBLIC_IP" ]; then
    echo "❌ Konnte öffentliche IP nicht ermitteln"
    echo "   Möglicherweise ist der Server nicht direkt im Internet erreichbar"
    exit 1
fi

echo "✅ Öffentliche IP: $PUBLIC_IP"
echo ""

# 2. Aktuelle Nginx-Konfiguration prüfen
NGINX_CONFIG="/etc/nginx/sites-available/inclusions"
echo "📋 Prüfe Nginx-Konfiguration..."

if [ ! -f "$NGINX_CONFIG" ]; then
    echo "❌ Nginx-Konfiguration nicht gefunden: $NGINX_CONFIG"
    exit 1
fi

# 3. Backup erstellen
echo "💾 Erstelle Backup..."
sudo cp "$NGINX_CONFIG" "${NGINX_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)"
echo "✅ Backup erstellt"
echo ""

# 4. Prüfe ob öffentliche IP bereits in server_name ist
if grep -q "$PUBLIC_IP" "$NGINX_CONFIG"; then
    echo "✅ Öffentliche IP bereits in Nginx-Konfiguration"
else
    echo "🔧 Füge öffentliche IP zur Nginx-Konfiguration hinzu..."
    
    # Ersetze server_name Zeile
    sudo sed -i "s/server_name .*/server_name $PUBLIC_IP 10.55.55.155 _;/" "$NGINX_CONFIG"
    echo "✅ Nginx-Konfiguration aktualisiert"
fi

echo ""

# 5. Nginx-Konfiguration prüfen
echo "🔍 Prüfe Nginx-Konfiguration..."
if sudo nginx -t 2>&1 | grep -q "successful"; then
    echo "✅ Nginx-Konfiguration ist gültig"
else
    echo "❌ Nginx-Konfiguration hat Fehler!"
    sudo nginx -t
    exit 1
fi

echo ""

# 6. Nginx neu laden
echo "🔄 Lade Nginx neu..."
sudo systemctl reload nginx

if [ $? -eq 0 ]; then
    echo "✅ Nginx neu geladen"
else
    echo "❌ Fehler beim Neuladen von Nginx"
    exit 1
fi

echo ""

# 7. Firewall prüfen
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
    echo "⚠️  UFW nicht installiert - prüfe Firewall manuell"
fi

echo ""
echo "=== Fertig! ==="
echo ""
echo "Die Seite sollte jetzt ohne VPN erreichbar sein:"
echo "  http://$PUBLIC_IP"
echo ""
echo "Teste es jetzt ohne VPN!"
echo ""
echo "Für später (wenn du auf inclusions.zone umstellst):"
echo "  1. DNS A-Record: inclusions.zone → $PUBLIC_IP"
echo "  2. Nginx server_name ändern zu: server_name inclusions.zone www.inclusions.zone;"
echo "  3. Nginx neu laden: sudo systemctl reload nginx"
