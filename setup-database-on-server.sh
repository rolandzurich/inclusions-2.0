#!/bin/bash

# Script zum Einrichten der PostgreSQL-Datenbank direkt auf dem Server
# Führe aus: ssh incluzone@10.55.55.155 "bash -s" < setup-database-on-server.sh

set -e

echo "🚀 Richte PostgreSQL-Datenbank ein..."
echo ""

# 1. Installiere PostgreSQL falls nicht vorhanden
if ! command -v psql &> /dev/null; then
    echo "📦 Installiere PostgreSQL..."
    sudo apt-get update
    sudo apt-get install -y postgresql postgresql-contrib
fi

# Starte PostgreSQL Service
sudo systemctl start postgresql
sudo systemctl enable postgresql

echo "✅ PostgreSQL installiert und gestartet"
echo ""

# 2. Erstelle Datenbank und Benutzer
echo "📋 Erstelle Datenbank und Benutzer..."

sudo -u postgres psql << 'EOF'
-- Erstelle Datenbank falls nicht vorhanden
SELECT 'CREATE DATABASE inclusions_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'inclusions_db')\gexec

-- Erstelle Benutzer falls nicht vorhanden
DO
$$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'inclusions_user') THEN
    CREATE USER inclusions_user WITH PASSWORD 'inclusions_secure_password_2024!';
  END IF;
END
$$;

-- Setze Berechtigungen
GRANT ALL PRIVILEGES ON DATABASE inclusions_db TO inclusions_user;
ALTER DATABASE inclusions_db OWNER TO inclusions_user;
EOF

echo "✅ Datenbank und Benutzer erstellt"
echo ""

# 3. Erstelle Schema (Migrationen)
echo "📋 Führe Migrationen aus..."

# Wechsle ins Projekt-Verzeichnis
cd ~/inclusions-2.0 || { echo "❌ Projekt-Verzeichnis nicht gefunden"; exit 1; }

# Prüfe ob Migrationen vorhanden sind
MIGRATIONS_DIR="backend/supabase/migrations"
if [ ! -d "$MIGRATIONS_DIR" ]; then
    echo "⚠️  Migrations-Verzeichnis nicht gefunden: $MIGRATIONS_DIR"
    echo "   Erstelle Verzeichnis..."
    mkdir -p "$MIGRATIONS_DIR"
fi

# Führe Migrationen aus (falls vorhanden)
if [ -f "$MIGRATIONS_DIR/001_initial_schema.sql" ]; then
    echo "  🔄 Führe Schema-Migration aus..."
    sudo -u postgres psql -d inclusions_db -f "$MIGRATIONS_DIR/001_initial_schema.sql" 2>&1 | grep -v "already exists\|does not exist" || true
    echo "  ✅ Schema erstellt"
fi

if [ -f "$MIGRATIONS_DIR/002_rls_policies.sql" ]; then
    echo "  🔄 Führe RLS-Policies aus..."
    sudo -u postgres psql -d inclusions_db -f "$MIGRATIONS_DIR/002_rls_policies.sql" 2>&1 | grep -v "already exists\|does not exist" || true
    echo "  ✅ RLS-Policies erstellt"
fi

if [ -f "$MIGRATIONS_DIR/004_add_viewed_at_fields.sql" ]; then
    echo "  🔄 Führe zusätzliche Felder-Migration aus..."
    sudo -u postgres psql -d inclusions_db -f "$MIGRATIONS_DIR/004_add_viewed_at_fields.sql" 2>&1 | grep -v "already exists\|does not exist" || true
    echo "  ✅ Zusätzliche Felder erstellt"
fi

# 4. Prüfe Tabellen
echo ""
echo "📋 Prüfe Tabellen..."

TABLES=("contact_requests" "newsletter_subscribers" "vip_registrations" "content_blocks" "rate_limits")

for table in "${TABLES[@]}"; do
    EXISTS=$(sudo -u postgres psql -d inclusions_db -tAc "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '$table');")
    if [ "$EXISTS" = "t" ]; then
        echo "  ✅ Tabelle '$table' existiert"
    else
        echo "  ❌ Tabelle '$table' fehlt!"
    fi
done

echo ""
echo "✅ Datenbank-Setup abgeschlossen!"
echo ""
echo "📝 Verbindungsdetails:"
echo "   Host: localhost"
echo "   Port: 5432"
echo "   Database: inclusions_db"
echo "   User: inclusions_user"
echo "   Password: inclusions_secure_password_2024!"
