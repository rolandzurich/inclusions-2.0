#!/bin/bash

# Script zum Kopieren der Migrationen und Ausführen des DB-Setups auf dem Server

SERVER="10.55.55.155"
USER="incluzone"
PASSWORD="13vor12!Asdf"

echo "🚀 Kopiere Migrationen auf Server und richte Datenbank ein..."
echo ""

# Funktion zum Ausführen von Befehlen
run_ssh() {
    ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$USER@$SERVER" "$1"
}

run_scp() {
    scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$1" "$USER@$SERVER:$2"
}

# 1. Kopiere Migrationen
echo "📋 Schritt 1: Kopiere Migrationen auf Server..."

MIGRATIONS=(
    "backend/supabase/migrations/001_initial_schema.sql"
    "backend/supabase/migrations/002_rls_policies.sql"
    "backend/supabase/migrations/003_seed_data.sql"
    "backend/supabase/migrations/004_add_viewed_at_fields.sql"
)

for migration in "${MIGRATIONS[@]}"; do
    if [ -f "$migration" ]; then
        echo "  📝 Kopiere $migration..."
        run_scp "$migration" "~/inclusions-2.0/$migration"
    else
        echo "  ⚠️  Datei nicht gefunden: $migration"
    fi
done

# 2. Kopiere Setup-Skript
echo ""
echo "📋 Schritt 2: Kopiere Setup-Skript..."
run_scp "setup-database-on-server.sh" "~/inclusions-2.0/setup-database-on-server.sh"

# 3. Führe Setup aus
echo ""
echo "📋 Schritt 3: Führe Datenbank-Setup aus..."
run_ssh "cd ~/inclusions-2.0 && chmod +x setup-database-on-server.sh && bash setup-database-on-server.sh"

echo ""
echo "✅ Setup abgeschlossen!"
echo ""
echo "💡 Nächste Schritte:"
echo "   1. Setze Umgebungsvariablen für DB-Verbindung in .env"
echo "   2. Starte die Next.js App neu"
