#!/bin/bash
# Nginx Installation und Konfiguration - Auf dem Server ausführen

set -e

echo "🚀 Nginx Installation und Setup für inclusions.zone"
echo "=================================================="
echo ""

# Prüfe ob wir im richtigen Verzeichnis sind
if [ ! -f "nginx-inclusions-domain.conf" ]; then
    echo "⚠️  nginx-inclusions-domain.conf nicht gefunden!"
    echo "   Stelle sicher, dass du im Projekt-Verzeichnis bist:"
    echo "   cd ~/inclusions-2.0"
    exit 1
fi

echo "📋 Schritt 1: Installiere Nginx..."
sudo apt-get update
sudo apt-get install -y nginx

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Fehler bei der Nginx-Installation!"
    exit 1
fi

echo "✅ Nginx installiert"
echo ""

echo "📋 Schritt 2: Konfiguriere Nginx..."
sudo cp nginx-inclusions-domain.conf /etc/nginx/sites-available/inclusions-domain
sudo ln -sf /etc/nginx/sites-available/inclusions-domain /etc/nginx/sites-enabled/inclusions-domain

echo "📋 Schritt 3: Prüfe Nginx-Konfiguration..."
if sudo nginx -t; then
    echo ""
    echo "✅ Nginx-Konfiguration ist korrekt!"
    echo ""
    echo "🔄 Lade Nginx neu..."
    sudo systemctl reload nginx
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Nginx wurde erfolgreich neu geladen!"
        echo ""
        echo "📊 Status:"
        sudo systemctl status nginx --no-pager -l
        echo ""
        echo "✅ Fertig!"
        echo ""
        echo "📋 Nächste Schritte:"
        echo "1. Warte 15-60 Minuten auf DNS-Propagierung"
        echo "2. Prüfe DNS: https://dnschecker.org/#A/inclusions.zone"
        echo "3. Teste Website: http://inclusions.zone"
    else
        echo ""
        echo "❌ Fehler beim Neuladen von Nginx!"
        echo "   Prüfe Logs: sudo journalctl -u nginx -n 50"
    fi
else
    echo ""
    echo "❌ Nginx-Konfiguration hat Fehler!"
    echo "   Prüfe die Fehlermeldung oben"
    exit 1
fi
