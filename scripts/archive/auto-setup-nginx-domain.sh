#!/bin/bash
# Automatisches Setup: Nginx für Domain inclusions.zone konfigurieren

set -e

SERVER="10.55.55.155"
USER="incluzone"
REMOTE_DIR="~/inclusions-2.0"

echo "🚀 Automatisches Nginx-Setup für inclusions.zone"
echo "================================================"
echo ""

# Prüfe ob Dateien existieren
if [ ! -f "nginx-inclusions-domain.conf" ]; then
    echo "❌ Fehler: nginx-inclusions-domain.conf nicht gefunden!"
    echo "   Stelle sicher, dass du im Projekt-Verzeichnis bist:"
    echo "   cd /Users/roland/Curser/inclusions-2.0"
    exit 1
fi

echo "📋 Schritt 1: Kopiere Dateien auf Server..."
scp nginx-inclusions-domain.conf setup-nginx-domain.sh ${USER}@${SERVER}:${REMOTE_DIR}/ 2>&1

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Fehler beim Kopieren der Dateien!"
    echo "   Prüfe:"
    echo "   - Bist du mit VPN verbunden?"
    echo "   - Ist der Server erreichbar?"
    echo "   - Stimmt die IP-Adresse: ${SERVER}?"
    exit 1
fi

echo "✅ Dateien kopiert"
echo ""

echo "📋 Schritt 2: Konfiguriere Nginx auf Server..."
ssh ${USER}@${SERVER} "cd ${REMOTE_DIR} && chmod +x setup-nginx-domain.sh && ./setup-nginx-domain.sh" 2>&1

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Fehler beim Konfigurieren von Nginx!"
    echo "   Prüfe die Fehlermeldung oben"
    exit 1
fi

echo ""
echo "✅ Fertig!"
echo ""
echo "📋 Nächste Schritte:"
echo "1. Warte 15-60 Minuten auf DNS-Propagierung"
echo "2. Prüfe DNS: https://dnschecker.org/#A/inclusions.zone"
echo "3. Teste Website: http://inclusions.zone"
echo ""
echo "📊 Status prüfen:"
echo "   ssh ${USER}@${SERVER} 'sudo systemctl status nginx'"
