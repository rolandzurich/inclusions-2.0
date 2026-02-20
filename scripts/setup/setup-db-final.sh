#!/bin/bash
# Finale Lösung mit sudo -S (liest Passwort von stdin)

SERVER_PASS="13vor12!Asdf"

echo "🚀 Erstelle Datenbank auf Server..."
echo ""

ssh -i ~/.ssh/inclusions_server -o StrictHostKeyChecking=no incluzone@10.55.55.155 bash << ENDSSH
echo "$SERVER_PASS" | sudo -S -u postgres psql -c "CREATE DATABASE inclusions_db;" 2>&1 | grep -v "already exists" || true
echo "$SERVER_PASS" | sudo -S -u postgres psql -c "CREATE USER inclusions_user WITH ENCRYPTED PASSWORD 'inclusions_secure_password_2024!';" 2>&1 | grep -v "already exists" || true
echo "$SERVER_PASS" | sudo -S -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE inclusions_db TO inclusions_user;"
echo "$SERVER_PASS" | sudo -S -u postgres psql -d inclusions_db -c "GRANT ALL ON SCHEMA public TO inclusions_user;"

echo ""
echo "✅ Datenbank erstellt!"
sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -w inclusions_db
ENDSSH

if [ $? -eq 0 ]; then
    echo ""
    echo "═══════════════════════════════════════"
    echo "✅ ERFOLG! Alles bereit!"
    echo "═══════════════════════════════════════"
    echo ""
    echo "🌐 Öffne jetzt: http://localhost:3000/admin-v2/init-db"
    echo ""
else
    echo ""
    echo "❌ Fehler beim Setup"
fi
