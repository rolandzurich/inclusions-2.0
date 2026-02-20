#!/bin/bash
# Nginx-Konfiguration für Domain inclusions.zone

echo "🔧 Konfiguriere Nginx für inclusions.zone..."
echo ""

# Prüfe ob Nginx installiert ist
if ! command -v nginx &> /dev/null; then
    echo "❌ Nginx ist nicht installiert!"
    echo "   Installiere mit: sudo apt-get update && sudo apt-get install nginx"
    exit 1
fi

# Prüfe ob wir im richtigen Verzeichnis sind
if [ ! -f "nginx-inclusions-domain.conf" ]; then
    echo "⚠️  nginx-inclusions-domain.conf nicht gefunden!"
    echo "   Stelle sicher, dass du im Projekt-Verzeichnis bist:"
    echo "   cd ~/inclusions-2.0"
    exit 1
fi

# Kopiere Konfiguration
echo "📋 Kopiere Nginx-Konfiguration..."
sudo cp nginx-inclusions-domain.conf /etc/nginx/sites-available/inclusions-domain

# Erstelle Symlink
echo "🔗 Erstelle Symlink..."
sudo ln -sf /etc/nginx/sites-available/inclusions-domain /etc/nginx/sites-enabled/inclusions-domain

# Prüfe Konfiguration
echo ""
echo "🔍 Prüfe Nginx-Konfiguration..."
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
        echo "📋 Nächste Schritte:"
        echo "1. Warte 15-60 Minuten auf DNS-Propagierung"
        echo "2. Prüfe DNS: https://dnschecker.org/#A/inclusions.zone"
        echo "3. Teste Website: http://inclusions.zone"
        echo ""
        echo "📊 Status prüfen:"
        echo "   sudo systemctl status nginx"
        echo "   sudo tail -f /var/log/nginx/error.log"
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
