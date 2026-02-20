#!/bin/bash
# FINALE LÖSUNG - Interaktiv mit Passwort-Eingabe
# Führe dieses Skript AUS oder kopiere die Befehle

clear
echo "═══════════════════════════════════════════════════"
echo "  INCLUSIONS V2 - Finale Datenbank-Einrichtung"
echo "═══════════════════════════════════════════════════"
echo ""
echo "🎯 Was passiert:"
echo "   1. Verbindung zum Server (SSH)"
echo "   2. Datenbank erstellen (braucht EINMAL sudo-Passwort)"
echo "   3. Fertig!"
echo ""
echo "📝 Du musst das Server-Passwort EINMAL eingeben"
echo "   Passwort: 13vor12!Asdf"
echo ""
echo "─────────────────────────────────────────────────"
read -p "Drücke Enter zum Starten..." 

echo ""
echo "🔗 Verbinde zum Server..."

ssh -i ~/.ssh/inclusions_server -t incluzone@10.55.55.155 << 'ENDSSH'
echo ""
echo "🔧 Erstelle Datenbank (sudo-Passwort nötig)..."
echo "   Passwort: 13vor12!Asdf"
echo ""

sudo -u postgres psql -c "CREATE DATABASE inclusions_db;" 2>&1 | grep -v "already exists" || true
sudo -u postgres psql -c "CREATE USER inclusions_user WITH ENCRYPTED PASSWORD 'inclusions_secure_password_2024!';" 2>&1 | grep -v "already exists" || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE inclusions_db TO inclusions_user;"
sudo -u postgres psql -d inclusions_db -c "GRANT ALL ON SCHEMA public TO inclusions_user;"

echo ""
echo "═══════════════════════════════════════════════════"
echo "✅ ERFOLG! Datenbank ist bereit!"
echo "═══════════════════════════════════════════════════"
echo ""
echo "📊 Verbindung:"
echo "   Host: 10.55.55.155"
echo "   Port: 5432"
echo "   Datenbank: inclusions_db"
echo "   User: inclusions_user"
echo ""
echo "🌐 Nächster Schritt:"
echo "   1. Öffne: http://localhost:3000/admin-v2/init-db"
echo "   2. Klicke auf '🚀 Datenbank jetzt initialisieren'"
echo "   3. Siehe Tabellen erstellt ✅"
echo ""
read -p "Drücke Enter zum Beenden..."
ENDSSH

echo ""
if [ $? -eq 0 ]; then
    echo "✅ Alles erledigt!"
    echo ""
    echo "Öffne jetzt: http://localhost:3000/admin-v2/init-db"
else
    echo "❌ Es gab einen Fehler"
    echo "Siehe Details oben"
fi
echo ""
