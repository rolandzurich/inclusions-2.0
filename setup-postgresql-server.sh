#!/bin/bash

# Script zum Einrichten von PostgreSQL auf dem Server
# Führt alle Schritte aus: Installation, DB-Erstellung, Migrationen

SERVER="10.55.55.155"
USER="incluzone"
PASSWORD="13vor12!Asdf"

echo "🚀 Richte PostgreSQL-Datenbank auf dem Server ein..."
echo ""

# Funktion zum Ausführen von Befehlen auf dem Server
run_on_server() {
    if command -v sshpass &> /dev/null; then
        sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$USER@$SERVER" "$1"
    else
        ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$USER@$SERVER" "$1"
    fi
}

# 1. Prüfe ob PostgreSQL installiert ist
echo "📋 Schritt 1: Prüfe PostgreSQL Installation..."
if run_on_server "which psql > /dev/null 2>&1"; then
    echo "✅ PostgreSQL ist bereits installiert"
    PSQL_VERSION=$(run_on_server "psql --version")
    echo "   Version: $PSQL_VERSION"
else
    echo "📦 Installiere PostgreSQL..."
    run_on_server "sudo apt-get update && sudo apt-get install -y postgresql postgresql-contrib"
    if [ $? -eq 0 ]; then
        echo "✅ PostgreSQL installiert"
    else
        echo "❌ Installation fehlgeschlagen"
        exit 1
    fi
fi

echo ""
echo "📋 Schritt 2: Starte PostgreSQL Service..."
run_on_server "sudo systemctl start postgresql"
run_on_server "sudo systemctl enable postgresql"

echo ""
echo "📋 Schritt 3: Erstelle Datenbank und Benutzer..."

# Erstelle SQL-Script für DB-Setup
cat > /tmp/setup_db.sql << 'EOF'
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

# Kopiere SQL-Script auf Server
if command -v sshpass &> /dev/null; then
    sshpass -p "$PASSWORD" scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null /tmp/setup_db.sql "$USER@$SERVER:/tmp/setup_db.sql"
else
    scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null /tmp/setup_db.sql "$USER@$SERVER:/tmp/setup_db.sql"
fi

# Führe SQL-Script aus
run_on_server "sudo -u postgres psql -f /tmp/setup_db.sql"

echo ""
echo "📋 Schritt 4: Kopiere Migrationen auf Server..."

# Erstelle temporäres Verzeichnis für Migrationen
run_on_server "mkdir -p ~/inclusions-2.0/backend/supabase/migrations"

# Kopiere Migrationen
MIGRATIONS=(
    "backend/supabase/migrations/001_initial_schema.sql"
    "backend/supabase/migrations/002_rls_policies.sql"
    "backend/supabase/migrations/003_seed_data.sql"
    "backend/supabase/migrations/004_add_viewed_at_fields.sql"
)

for migration in "${MIGRATIONS[@]}"; do
    if [ -f "$migration" ]; then
        echo "  📝 Kopiere $migration..."
        if command -v sshpass &> /dev/null; then
            sshpass -p "$PASSWORD" scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$migration" "$USER@$SERVER:~/inclusions-2.0/$migration"
        else
            scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$migration" "$USER@$SERVER:~/inclusions-2.0/$migration"
        fi
    fi
done

echo ""
echo "📋 Schritt 5: Führe Migrationen aus..."

# Führe Migrationen in der richtigen Reihenfolge aus
for migration in "${MIGRATIONS[@]}"; do
    MIGRATION_FILE="~/inclusions-2.0/$migration"
    MIGRATION_NAME=$(basename "$migration")
    
    echo "  🔄 Führe aus: $MIGRATION_NAME"
    
    # Führe Migration aus (als postgres User, dann verbinde mit inclusions_db)
    run_on_server "sudo -u postgres psql -d inclusions_db -f $MIGRATION_FILE 2>&1" | grep -v "already exists\|does not exist" || true
    
    echo "  ✅ $MIGRATION_NAME abgeschlossen"
done

echo ""
echo "📋 Schritt 6: Prüfe Tabellen..."

# Prüfe ob Tabellen erstellt wurden
TABLES=("contact_requests" "newsletter_subscribers" "vip_registrations" "content_blocks" "rate_limits")

for table in "${TABLES[@]}"; do
    if run_on_server "sudo -u postgres psql -d inclusions_db -tAc \"SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '$table');\"" | grep -q t; then
        echo "  ✅ Tabelle '$table' existiert"
    else
        echo "  ❌ Tabelle '$table' fehlt!"
    fi
done

echo ""
echo "✅ Datenbank-Setup abgeschlossen!"
echo ""
echo "📝 Datenbank-Verbindungsdetails:"
echo "   Host: localhost (auf Server)"
echo "   Port: 5432"
echo "   Database: inclusions_db"
echo "   User: inclusions_user"
echo "   Password: inclusions_secure_password_2024!"
echo ""
echo "💡 Nächste Schritte:"
echo "   1. Aktualisiere lib/db-direct.ts mit den Verbindungsdaten"
echo "   2. Setze Umgebungsvariablen für DB-Zugriff"
echo "   3. Teste Formular-Submissions"

# Aufräumen
rm -f /tmp/setup_db.sql
