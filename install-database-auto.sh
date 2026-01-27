#!/bin/bash

# Automatisches Datenbank-Setup mit sudo -S
# Passwort wird vom stdin gelesen

set -e

PASSWORD="13vor12!Asdf"

echo "🚀 Starte Datenbank-Setup..."
echo ""

# Helper-Funktion für sudo-Befehle
sudo_cmd() {
    echo "$PASSWORD" | sudo -S "$@"
}

# 1. Installiere PostgreSQL
echo "📦 Schritt 1: Installiere PostgreSQL..."
if ! command -v psql &> /dev/null; then
    echo "  Installiere PostgreSQL..."
    echo "$PASSWORD" | sudo -S apt-get update -qq
    echo "$PASSWORD" | sudo -S apt-get install -y postgresql postgresql-contrib
    echo "✅ PostgreSQL installiert"
else
    echo "✅ PostgreSQL bereits installiert: $(psql --version)"
fi

# Starte Service
echo "$PASSWORD" | sudo -S systemctl start postgresql
echo "$PASSWORD" | sudo -S systemctl enable postgresql
echo "✅ PostgreSQL Service gestartet"
echo ""

# 2. Erstelle Datenbank und Benutzer
echo "📋 Schritt 2: Erstelle Datenbank und Benutzer..."
echo "$PASSWORD" | sudo -S -u postgres psql << 'SQL' 2>&1 | grep -v "already exists" || true
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
SQL
echo "✅ Datenbank und Benutzer erstellt"
echo ""

# 3. Erstelle Schema
echo "📋 Schritt 3: Erstelle Datenbank-Schema..."
echo "$PASSWORD" | sudo -S -u postgres psql -d inclusions_db << 'SQL'
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Contact Requests
CREATE TABLE IF NOT EXISTS contact_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT,
    booking_type TEXT,
    booking_item TEXT,
    event_date DATE,
    event_location TEXT,
    event_type TEXT,
    source_url TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    honeypot TEXT,
    ip_address INET,
    admin_notes TEXT,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'completed', 'archived')),
    viewed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_contact_requests_created_at ON contact_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_requests_email ON contact_requests(email);
CREATE INDEX IF NOT EXISTS idx_contact_requests_status ON contact_requests(status);
CREATE INDEX IF NOT EXISTS idx_contact_requests_viewed_at ON contact_requests(viewed_at);

-- Newsletter Subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    email TEXT NOT NULL UNIQUE,
    first_name TEXT,
    last_name TEXT,
    has_disability BOOLEAN,
    interests TEXT[],
    opt_in_token UUID DEFAULT uuid_generate_v4(),
    opt_in_confirmed_at TIMESTAMPTZ,
    opt_in_expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
    source_url TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'unsubscribed')),
    unsubscribed_at TIMESTAMPTZ,
    honeypot TEXT,
    ip_address INET,
    admin_notes TEXT,
    mailchimp_synced_at TIMESTAMPTZ,
    mailchimp_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_status ON newsletter_subscribers(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_opt_in_token ON newsletter_subscribers(opt_in_token);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_created_at ON newsletter_subscribers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_mailchimp_synced ON newsletter_subscribers(mailchimp_synced_at);

-- VIP Registrations
CREATE TABLE IF NOT EXISTS vip_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    event_date DATE,
    event_location TEXT,
    event_type TEXT,
    message TEXT,
    company TEXT,
    number_of_guests INTEGER,
    special_requirements TEXT,
    source_url TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    honeypot TEXT,
    ip_address INET,
    admin_notes TEXT,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'confirmed', 'cancelled', 'archived')),
    viewed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_vip_registrations_created_at ON vip_registrations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vip_registrations_email ON vip_registrations(email);
CREATE INDEX IF NOT EXISTS idx_vip_registrations_status ON vip_registrations(status);
CREATE INDEX IF NOT EXISTS idx_vip_registrations_viewed_at ON vip_registrations(viewed_at);

-- Content Blocks
CREATE TABLE IF NOT EXISTS content_blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    key TEXT NOT NULL UNIQUE,
    title TEXT,
    body_markdown TEXT,
    body_html TEXT,
    image_url TEXT,
    published BOOLEAN DEFAULT true,
    order_index INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_content_blocks_key ON content_blocks(key);
CREATE INDEX IF NOT EXISTS idx_content_blocks_published ON content_blocks(published);

-- Rate Limits
CREATE TABLE IF NOT EXISTS rate_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ip_address INET NOT NULL,
    endpoint TEXT NOT NULL,
    request_count INTEGER DEFAULT 1,
    window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(ip_address, endpoint, window_start)
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start ON rate_limits(window_start);
SQL

echo "✅ Schema erstellt"
echo ""

# 4. Prüfe Tabellen
echo "📋 Schritt 4: Prüfe Tabellen..."
TABLES=("contact_requests" "newsletter_subscribers" "vip_registrations" "content_blocks" "rate_limits")

for table in "${TABLES[@]}"; do
    EXISTS=$(echo "$PASSWORD" | sudo -S -u postgres psql -d inclusions_db -tAc "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '$table');" 2>/dev/null)
    if [ "$EXISTS" = "t" ]; then
        echo "  ✅ Tabelle '$table' existiert"
    else
        echo "  ❌ Tabelle '$table' fehlt!"
    fi
done

echo ""

# 5. Setze Umgebungsvariablen
echo "📋 Schritt 5: Setze Umgebungsvariablen..."
cd ~/inclusions-2.0 2>/dev/null || { echo "⚠️  Projekt-Verzeichnis nicht gefunden"; exit 1; }

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
    echo "✅ DB-Umgebungsvariablen bereits vorhanden"
fi

echo ""
echo "✅ Datenbank-Setup abgeschlossen!"
echo ""
echo "📝 Verbindungsdetails:"
echo "   Host: localhost"
echo "   Port: 5432"
echo "   Database: inclusions_db"
echo "   User: inclusions_user"
echo "   Password: inclusions_secure_password_2024!"
echo ""
echo "💡 Nächste Schritte:"
echo "   1. Starte Next.js App neu:"
echo "      cd ~/inclusions-2.0 && pkill -f 'next start' && npm start > /tmp/next.log 2>&1 &"
echo "   2. Teste Formular-Submissions"
