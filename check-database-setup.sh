#!/bin/bash

# Script zum Prüfen ob die Datenbank korrekt aufgesetzt ist

echo "🔍 Prüfe Datenbank-Setup..."
echo ""

# Prüfe ob Docker Container läuft
if ! docker ps | grep -q "inclusions-supabase-db"; then
    echo "❌ Supabase Datenbank-Container läuft nicht!"
    echo "   Starte mit: cd backend && docker-compose up -d"
    exit 1
fi

echo "✅ Supabase Container läuft"
echo ""

# Prüfe ob Tabellen existieren
echo "📋 Prüfe Tabellen..."

TABLES=("contact_requests" "newsletter_subscribers" "vip_registrations" "content_blocks" "rate_limits")

for table in "${TABLES[@]}"; do
    if docker exec inclusions-supabase-db psql -U supabase_admin -d postgres -tAc "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '$table');" | grep -q t; then
        echo "  ✅ Tabelle '$table' existiert"
    else
        echo "  ❌ Tabelle '$table' fehlt!"
    fi
done

echo ""
echo "📋 Prüfe RLS Policies..."

# Prüfe ob RLS aktiviert ist
RLS_TABLES=("contact_requests" "newsletter_subscribers" "vip_registrations")

for table in "${RLS_TABLES[@]}"; do
    RLS_ENABLED=$(docker exec inclusions-supabase-db psql -U supabase_admin -d postgres -tAc "SELECT relrowsecurity FROM pg_class WHERE relname = '$table';" 2>/dev/null | tr -d ' ')
    if [ "$RLS_ENABLED" = "t" ]; then
        echo "  ✅ RLS ist aktiviert für '$table'"
    else
        echo "  ⚠️  RLS ist NICHT aktiviert für '$table'"
    fi
done

echo ""
echo "📋 Prüfe Umgebungsvariablen..."

# Prüfe ob Supabase URL gesetzt ist
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo "  ⚠️  NEXT_PUBLIC_SUPABASE_URL ist nicht gesetzt"
else
    echo "  ✅ NEXT_PUBLIC_SUPABASE_URL ist gesetzt"
fi

# Prüfe ob Service Role Key gesetzt ist
if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "  ⚠️  SUPABASE_SERVICE_ROLE_KEY ist nicht gesetzt"
else
    echo "  ✅ SUPABASE_SERVICE_ROLE_KEY ist gesetzt"
fi

echo ""
echo "📊 Teste Datenbank-Verbindung..."

# Teste Verbindung
if docker exec inclusions-supabase-db psql -U supabase_admin -d postgres -c "SELECT 1;" > /dev/null 2>&1; then
    echo "  ✅ Datenbank-Verbindung erfolgreich"
else
    echo "  ❌ Datenbank-Verbindung fehlgeschlagen"
fi

echo ""
echo "✅ Prüfung abgeschlossen!"
echo ""
echo "💡 Falls Tabellen fehlen, führe die Migrationen manuell aus:"
echo "   docker exec -i inclusions-supabase-db psql -U supabase_admin -d postgres < backend/supabase/migrations/001_initial_schema.sql"
echo "   docker exec -i inclusions-supabase-db psql -U supabase_admin -d postgres < backend/supabase/migrations/002_rls_policies.sql"
echo "   docker exec -i inclusions-supabase-db psql -U supabase_admin -d postgres < backend/supabase/migrations/004_add_viewed_at_fields.sql"
