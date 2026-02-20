#!/bin/bash
# Einfaches Deploy-Skript für Admin-V2 Schema
# Verwendet sshpass für automatische Authentifizierung

SERVER="10.55.55.155"
USER="incluzone"
PASS="13vor12!Asdf"
SCHEMA_FILE="backend/schema_admin_v2_standalone.sql"

echo "🚀 Deploye Admin-V2 Schema..."

# Prüfen ob sshpass installiert ist
if ! command -v sshpass &> /dev/null; then
    echo "⚠️  sshpass nicht installiert. Installiere..."
    brew install sshpass 2>/dev/null || {
        echo "❌ Bitte sshpass manuell installieren: brew install hudochenkov/sshpass/sshpass"
        exit 1
    }
fi

# 1. Schema-Datei kopieren
echo "📤 Kopiere Schema..."
sshpass -p "$PASS" scp -o StrictHostKeyChecking=no "$SCHEMA_FILE" "$USER@$SERVER:/tmp/schema_v2.sql"

# 2. Auf Server ausführen
echo "🔧 Führe Schema aus..."
sshpass -p "$PASS" ssh -o StrictHostKeyChecking=no "$USER@$SERVER" bash << 'EOF'
# PostgreSQL prüfen/installieren
if ! command -v psql &> /dev/null; then
    echo "Installing PostgreSQL..."
    sudo apt-get update -qq && sudo apt-get install -y postgresql postgresql-contrib
fi

# Service starten
sudo systemctl start postgresql 2>/dev/null || true

# DB prüfen/erstellen
sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw inclusions_db || {
    echo "Creating database..."
    sudo -u postgres psql -c "CREATE DATABASE inclusions_db;"
    sudo -u postgres psql -c "CREATE USER inclusions_user WITH PASSWORD 'inclusions_secure_password_2024!';"
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE inclusions_db TO inclusions_user;"
}

# Schema ausführen
echo "Executing schema..."
sudo -u postgres psql -d inclusions_db -f /tmp/schema_v2.sql

echo "✅ Done! Tables:"
sudo -u postgres psql -d inclusions_db -c "\dt"
EOF

echo ""
echo "✅ Schema deployed!"
