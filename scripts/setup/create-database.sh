#!/bin/bash
# Erstellt die PostgreSQL-Datenbank auf dem Server
# Einmalige Ausführung nötig

echo "═══════════════════════════════════════"
echo "  Erstelle inclusions_db Datenbank"
echo "═══════════════════════════════════════"
echo ""

ssh -i ~/.ssh/inclusions_server -o StrictHostKeyChecking=no incluzone@10.55.55.155 << 'ENDSSH'
sudo -u postgres psql -c "CREATE DATABASE inclusions_db;" 2>&1 | grep -v "already exists" || true
sudo -u postgres psql -c "CREATE USER inclusions_user WITH ENCRYPTED PASSWORD 'inclusions_secure_password_2024!';" 2>&1 | grep -v "already exists" || true  
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE inclusions_db TO inclusions_user;"
sudo -u postgres psql -d inclusions_db -c "GRANT ALL ON SCHEMA public TO inclusions_user;"
echo ""
echo "✅ Datenbank erfolgreich erstellt!"
echo "📊 Name: inclusions_db"
echo "👤 User: inclusions_user"
ENDSSH

if [ $? -eq 0 ]; then
    echo ""
    echo "═══════════════════════════════════════"
    echo "✅ FERTIG! Datenbank ist bereit!"
    echo "═══════════════════════════════════════"
    echo ""
    echo "🌐 Nächster Schritt:"
    echo "   Öffne: http://localhost:3000/admin-v2/init-db"
    echo "   Klicke auf '🚀 Datenbank jetzt initialisieren'"
    echo ""
else
    echo ""
    echo "❌ Fehler - Siehe oben für Details"
fi
