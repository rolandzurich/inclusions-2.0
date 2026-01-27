# Datenbank-Setup auf Server - Komplette Anleitung

## Schritt-für-Schritt Anleitung

Verbinde dich mit dem Server und führe die folgenden Befehle aus:

```bash
ssh incluzone@10.55.55.155
```

### 1. PostgreSQL installieren

```bash
# Prüfe ob bereits installiert
which psql

# Falls nicht installiert:
sudo apt-get update
sudo apt-get install -y postgresql postgresql-contrib

# Starte PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Datenbank und Benutzer erstellen

```bash
sudo -u postgres psql << 'EOF'
-- Erstelle Datenbank
CREATE DATABASE inclusions_db;

-- Erstelle Benutzer
CREATE USER inclusions_user WITH PASSWORD 'inclusions_secure_password_2024!';

-- Setze Berechtigungen
GRANT ALL PRIVILEGES ON DATABASE inclusions_db TO inclusions_user;
ALTER DATABASE inclusions_db OWNER TO inclusions_user;
\q
EOF
```

### 3. Schema erstellen

Kopiere diesen Befehl komplett und führe ihn aus:

```bash
sudo -u postgres psql -d inclusions_db << 'SQL'
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
```

### 4. Tabellen prüfen

```bash
sudo -u postgres psql -d inclusions_db -c "\dt"
```

Du solltest folgende Tabellen sehen:
- `contact_requests`
- `newsletter_subscribers`
- `vip_registrations`
- `content_blocks`
- `rate_limits`

### 5. Umgebungsvariablen setzen

```bash
cd ~/inclusions-2.0

# Füge DB-Variablen zu .env hinzu
cat >> .env << 'EOF'

# Datenbank-Verbindung (direkt PostgreSQL, ohne Supabase)
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=inclusions_db
DB_USER=inclusions_user
DB_PASSWORD=inclusions_secure_password_2024!
DB_SSL=false
EOF
```

### 6. Next.js App neu starten

```bash
cd ~/inclusions-2.0

# Stoppe alte Instanz
pkill -f "next start"

# Starte neu
npm start > /tmp/next.log 2>&1 &
```

### 7. Testen

```bash
# Prüfe Logs
tail -f /tmp/next.log

# Prüfe Datenbank-Verbindung
sudo -u postgres psql -d inclusions_db -c "SELECT COUNT(*) FROM contact_requests;"
```

## Fertig!

Die Datenbank ist jetzt eingerichtet. Formulare speichern Daten direkt in PostgreSQL.
