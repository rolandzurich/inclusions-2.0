#!/bin/bash
# Nginx Installation und Konfiguration für inclusions.zone

set -e

SERVER="10.55.55.155"
USER="incluzone"
REMOTE_DIR="~/inclusions-2.0"

echo "🚀 Nginx Installation und Setup für inclusions.zone"
echo "=================================================="
echo ""

echo "📋 Schritt 1: Installiere Nginx auf Server..."
ssh ${USER}@${SERVER} "sudo apt-get update && sudo apt-get install -y nginx" 2>&1

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Fehler bei der Nginx-Installation!"
    echo "   Prüfe die Fehlermeldung oben"
    exit 1
fi

echo "✅ Nginx installiert"
echo ""

echo "📋 Schritt 2: Kopiere Konfigurationsdateien..."
scp nginx-inclusions-domain.conf setup-nginx-domain.sh ${USER}@${SERVER}:${REMOTE_DIR}/ 2>&1

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Fehler beim Kopieren der Dateien!"
    exit 1
fi

echo "✅ Dateien kopiert"
echo ""

echo "📋 Schritt 3: Konfiguriere Nginx..."
ssh ${USER}@${SERVER} "cd ${REMOTE_DIR} && chmod +x setup-nginx-domain.sh && ./setup-nginx-domain.sh" 2>&1

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Fehler bei der Nginx-Konfiguration!"
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
