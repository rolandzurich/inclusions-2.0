#!/bin/bash
# Deploy Admin-V2 Schema auf PostgreSQL Server

set -e

SERVER="10.55.55.155"
USER="incluzone"
SCHEMA_FILE="backend/schema_admin_v2_standalone.sql"

echo "🚀 Deploye Admin-V2 Schema auf Server..."

# 1. Schema-Datei auf Server kopieren
echo "📤 Kopiere Schema-Datei..."
scp -o StrictHostKeyChecking=no "$SCHEMA_FILE" "$USER@$SERVER:/tmp/schema_admin_v2.sql"

# 2. PostgreSQL-Status prüfen und Schema ausführen
echo "🔍 Prüfe PostgreSQL und führe Schema aus..."
ssh -o StrictHostKeyChecking=no "$USER@$SERVER" << 'ENDSSH'
# Prüfen ob PostgreSQL installiert ist
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL ist nicht installiert"
    echo "Installiere PostgreSQL..."
    sudo apt-get update -qq
    sudo apt-get install -y postgresql postgresql-contrib
fi

# PostgreSQL-Service starten (falls nicht aktiv)
sudo systemctl start postgresql || true
sudo systemctl enable postgresql || true

# Prüfen ob Datenbank existiert
DB_EXISTS=$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='inclusions_db'" 2>/dev/null || echo "0")

if [ "$DB_EXISTS" != "1" ]; then
    echo "📦 Erstelle Datenbank und User..."
    sudo -u postgres psql << 'EOPSQL'
CREATE DATABASE inclusions_db;
CREATE USER inclusions_user WITH ENCRYPTED PASSWORD 'inclusions_secure_password_2024!';
GRANT ALL PRIVILEGES ON DATABASE inclusions_db TO inclusions_user;
EOPSQL
fi

# Schema ausführen
echo "📊 Führe Schema aus..."
sudo -u postgres psql -d inclusions_db -f /tmp/schema_admin_v2.sql

echo "✅ Schema erfolgreich ausgeführt!"

# Tabellen auflisten
echo ""
echo "📋 Erstellte Tabellen:"
sudo -u postgres psql -d inclusions_db -c "\dt"

ENDSSH

echo ""
echo "✅ Admin-V2 Schema erfolgreich deployed!"
