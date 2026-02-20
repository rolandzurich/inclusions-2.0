#!/bin/bash

# Komplettes Setup: Kopiert Migrationen, richtet DB ein und setzt Umgebungsvariablen

SERVER="10.55.55.155"
USER="incluzone"

echo "🚀 Komplettes Datenbank-Setup..."
echo ""

# 1. Kopiere Migrationen und Setup-Skript
echo "📋 Schritt 1: Kopiere Dateien auf Server..."

scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    backend/supabase/migrations/001_initial_schema.sql \
    backend/supabase/migrations/002_rls_policies.sql \
    backend/supabase/migrations/003_seed_data.sql \
    backend/supabase/migrations/004_add_viewed_at_fields.sql \
    setup-database-on-server.sh \
    "$USER@$SERVER:~/inclusions-2.0/backend/supabase/migrations/" 2>/dev/null || \
    ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$USER@$SERVER" \
    "mkdir -p ~/inclusions-2.0/backend/supabase/migrations && \
     mkdir -p ~/inclusions-2.0"

# Kopiere Migrationen einzeln
for file in backend/supabase/migrations/*.sql setup-database-on-server.sh; do
    if [ -f "$file" ]; then
        echo "  📝 Kopiere $(basename $file)..."
        scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
            "$file" "$USER@$SERVER:~/inclusions-2.0/$file" 2>&1 | grep -v "Warning" || true
    fi
done

# 2. Führe Setup aus
echo ""
echo "📋 Schritt 2: Führe Datenbank-Setup aus..."
ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$USER@$SERVER" << 'ENDSSH'
cd ~/inclusions-2.0
chmod +x setup-database-on-server.sh
bash setup-database-on-server.sh
ENDSSH

# 3. Setze Umgebungsvariablen
echo ""
echo "📋 Schritt 3: Setze Umgebungsvariablen..."
ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$USER@$SERVER" << 'ENDSSH'
cd ~/inclusions-2.0

# Füge DB-Variablen zu .env hinzu (falls nicht vorhanden)
if ! grep -q "DB_HOST" .env 2>/dev/null; then
    cat >> .env << 'EOF'

# Datenbank-Verbindung (direkt PostgreSQL, ohne Supabase)
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=inclusions_db
DB_USER=inclusions_user
DB_PASSWORD=inclusions_secure_password_2024!
DB_SSL=false
EOF
    echo "✅ DB-Umgebungsvariablen zu .env hinzugefügt"
else
    echo "✅ DB-Umgebungsvariablen bereits in .env vorhanden"
fi
ENDSSH

echo ""
echo "✅ Setup abgeschlossen!"
echo ""
echo "💡 Nächste Schritte:"
echo "   1. Starte die Next.js App neu:"
echo "      ssh $USER@$SERVER 'cd ~/inclusions-2.0 && pkill -f \"next start\" && npm start > /tmp/next.log 2>&1 &'"
echo "   2. Teste Formular-Submissions"
