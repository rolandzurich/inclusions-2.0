#!/bin/bash
# Automatisches PostgreSQL-Setup ohne Interaktion
# Nutzt sshpass für nicht-interaktive Authentifizierung

SERVER="10.55.55.155"
USER="incluzone"
PASS="13vor12!Asdf"

echo "🚀 PostgreSQL wird auf Server eingerichtet..."
echo "Server: $SERVER"
echo ""

# Prüfen ob sshpass verfügbar ist
if ! command -v sshpass &> /dev/null; then
    echo "❌ sshpass nicht installiert"
    echo "Installiere mit: brew install hudochenkov/sshpass/sshpass"
    echo ""
    echo "ODER nutze das Setup-Skript manuell:"
    echo "1. ssh incluzone@10.55.55.155"
    echo "2. Führe die Befehle aus postgresql-setup-server.sh aus"
    exit 1
fi

# Setup-Skript auf Server kopieren
echo "📤 Kopiere Setup-Skript..."
sshpass -p "$PASS" scp -o StrictHostKeyChecking=no postgresql-setup-server.sh "$USER@$SERVER:/tmp/pg_setup.sh" 2>&1

if [ $? -ne 0 ]; then
    echo "❌ Fehler beim Kopieren"
    exit 1
fi

# Setup ausführen
echo "🔧 Führe Setup aus..."
sshpass -p "$PASS" ssh -o StrictHostKeyChecking=no "$USER@$SERVER" "bash /tmp/pg_setup.sh" 2>&1

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ PostgreSQL erfolgreich eingerichtet!"
    echo ""
    echo "📊 Verbindungs-Details:"
    echo "   Host: $SERVER"
    echo "   Port: 5432"
    echo "   Datenbank: inclusions_db"
    echo "   User: inclusions_user"
    echo ""
    echo "🌐 Teste jetzt die Init-Seite:"
    echo "   http://localhost:3000/admin-v2/init-db"
else
    echo ""
    echo "❌ Fehler beim Setup"
    echo "Siehe Details oben"
fi
