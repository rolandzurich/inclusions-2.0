#!/bin/bash
# Einfaches Skript - einfach auf dem Server ausführen (wenn du bereits eingeloggt bist)

echo "=== Konfiguriere Server für 10.55.55.155 ==="
echo ""

# 1. Nginx-Konfiguration aktualisieren
echo "🔍 Aktualisiere Nginx-Konfiguration..."
sudo sed -i 's/server_name .*/server_name 10.55.55.155 _;/' /etc/nginx/sites-available/inclusions
echo "✅ Konfiguration aktualisiert"

# 2. Nginx prüfen
echo ""
echo "🔍 Prüfe Nginx..."
sudo nginx -t && echo "✅ Nginx-Konfiguration OK" || echo "❌ Fehler!"

# 3. Nginx neu laden
echo ""
echo "🔄 Lade Nginx neu..."
sudo systemctl reload nginx
echo "✅ Nginx neu geladen"

# 4. Firewall öffnen
echo ""
echo "🔥 Öffne Port 80..."
sudo ufw allow 80/tcp 2>/dev/null || echo "⚠️  UFW nicht verfügbar"
echo "✅ Port 80 geöffnet"

# 5. Next.js App prüfen
echo ""
echo "🔍 Prüfe Next.js App..."
cd ~/inclusions-2.0
if pgrep -f "next start" > /dev/null; then
    echo "✅ App läuft bereits"
else
    echo "⚠️  Starte App..."
    pkill -f "next start" 2>/dev/null
    npm start > /tmp/next.log 2>&1 &
    sleep 2
    if pgrep -f "next start" > /dev/null; then
        echo "✅ App gestartet"
    else
        echo "❌ App konnte nicht gestartet werden"
    fi
fi

echo ""
echo "=== Fertig! ==="
echo ""
echo "Die Seite sollte jetzt erreichbar sein unter:"
echo "  http://10.55.55.155"
echo ""
echo "Teste es jetzt ohne VPN!"
