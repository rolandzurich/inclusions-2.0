#!/bin/bash
# Einfaches Setup-Skript - führt alles in einem Befehl aus
# Führe aus: ./one-command-setup.sh

SERVER="10.55.55.155"
USER="incluzone"
PASSWORD="13vor12!Asdf"

echo "=== Environment-Variablen Setup ==="
echo ""
echo "Dieses Skript wird:"
echo "1. .env Datei auf Server kopieren"
echo "2. Keys prüfen"
echo "3. App neu starten"
echo ""
echo "Du musst das Passwort einmal eingeben: $PASSWORD"
echo ""

# Kopiere Datei
scp -o StrictHostKeyChecking=no .env.production $USER@$SERVER:~/inclusions-2.0/.env

if [ $? -eq 0 ]; then
    echo "✅ Datei kopiert"
    
    # Prüfe Keys
    echo ""
    echo "🔍 Prüfe Keys..."
    ssh -o StrictHostKeyChecking=no $USER@$SERVER "cd ~/inclusions-2.0 && grep -E 'RESEND_API_KEY|GEMINI_API_KEY' .env"
    
    # App neu starten
    echo ""
    echo "🔄 Starte App neu..."
    ssh -o StrictHostKeyChecking=no $USER@$SERVER "cd ~/inclusions-2.0 && pkill -f 'next start' && sleep 2 && npm start > /tmp/next.log 2>&1 &"
    
    echo ""
    echo "=== Fertig! ==="
else
    echo "❌ Fehler beim Kopieren"
    exit 1
fi
