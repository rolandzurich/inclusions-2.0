#!/bin/bash

# Script zum manuellen Ausführen der Datenbank-Migrationen

echo "🚀 Führe Datenbank-Migrationen aus..."
echo ""

# Prüfe ob Docker Container läuft
if ! docker ps | grep -q "inclusions-supabase-db"; then
    echo "❌ Supabase Datenbank-Container läuft nicht!"
    echo "   Starte mit: cd backend && docker-compose up -d"
    exit 1
fi

# Pfad zu den Migrationen
MIGRATIONS_DIR="backend/supabase/migrations"

if [ ! -d "$MIGRATIONS_DIR" ]; then
    echo "❌ Migrations-Verzeichnis nicht gefunden: $MIGRATIONS_DIR"
    exit 1
fi

echo "📋 Führe Migrationen aus..."
echo ""

# Migrationen in der richtigen Reihenfolge ausführen
MIGRATIONS=(
    "001_initial_schema.sql"
    "002_rls_policies.sql"
    "003_seed_data.sql"
    "004_add_viewed_at_fields.sql"
)

for migration in "${MIGRATIONS[@]}"; do
    MIGRATION_FILE="$MIGRATIONS_DIR/$migration"
    
    if [ ! -f "$MIGRATION_FILE" ]; then
        echo "⚠️  Datei nicht gefunden: $MIGRATION_FILE (überspringe)"
        continue
    fi
    
    echo "📝 Führe aus: $migration"
    
    if docker exec -i inclusions-supabase-db psql -U supabase_admin -d postgres < "$MIGRATION_FILE" 2>&1 | grep -i "error\|fehler" > /dev/null; then
        echo "  ⚠️  Warnung: Mögliche Fehler bei $migration (Tabellen könnten bereits existieren)"
    else
        echo "  ✅ $migration erfolgreich ausgeführt"
    fi
done

echo ""
echo "✅ Migrationen abgeschlossen!"
echo ""
echo "💡 Prüfe das Setup mit: ./check-database-setup.sh"
