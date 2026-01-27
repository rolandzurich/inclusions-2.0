# Datenbank-Setup Anleitung (ohne Supabase)

Diese Anleitung richtet eine direkte PostgreSQL-Datenbank auf dem Server ein.

## Voraussetzungen

- SSH-Zugriff auf den Server (10.55.55.155)
- Sudo-Rechte auf dem Server

## Schritt 1: Auf Server verbinden

```bash
ssh incluzone@10.55.55.155
```

## Schritt 2: PostgreSQL installieren

```bash
# Prüfe ob PostgreSQL bereits installiert ist
which psql

# Falls nicht installiert:
sudo apt-get update
sudo apt-get install -y postgresql postgresql-contrib

# Starte PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

## Schritt 3: Datenbank und Benutzer erstellen

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

## Schritt 4: Migrationen ausführen

```bash
cd ~/inclusions-2.0

# Erstelle Migrations-Verzeichnis falls nicht vorhanden
mkdir -p backend/supabase/migrations

# Führe Migrationen aus (falls vorhanden)
if [ -f backend/supabase/migrations/001_initial_schema.sql ]; then
    sudo -u postgres psql -d inclusions_db -f backend/supabase/migrations/001_initial_schema.sql
fi

if [ -f backend/supabase/migrations/002_rls_policies.sql ]; then
    sudo -u postgres psql -d inclusions_db -f backend/supabase/migrations/002_rls_policies.sql
fi

if [ -f backend/supabase/migrations/004_add_viewed_at_fields.sql ]; then
    sudo -u postgres psql -d inclusions_db -f backend/supabase/migrations/004_add_viewed_at_fields.sql
fi
```

**Falls Migrationen nicht vorhanden sind**, kopiere sie zuerst:

```bash
# Auf deinem lokalen Rechner:
scp backend/supabase/migrations/*.sql incluzone@10.55.55.155:~/inclusions-2.0/backend/supabase/migrations/
```

## Schritt 5: Tabellen prüfen

```bash
sudo -u postgres psql -d inclusions_db -c "\dt"
```

Du solltest folgende Tabellen sehen:
- `contact_requests`
- `newsletter_subscribers`
- `vip_registrations`
- `content_blocks`
- `rate_limits`

## Schritt 6: Umgebungsvariablen setzen

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

## Schritt 7: Next.js App neu starten

```bash
cd ~/inclusions-2.0

# Stoppe alte Instanz
pkill -f "next start"

# Starte neu
npm start > /tmp/next.log 2>&1 &
```

## Schritt 8: Testen

1. Öffne die Website: `http://10.55.55.155`
2. Teste ein Formular (z.B. Newsletter-Anmeldung)
3. Prüfe Logs: `tail -f /tmp/next.log`
4. Prüfe Datenbank:

```bash
sudo -u postgres psql -d inclusions_db -c "SELECT * FROM newsletter_subscribers LIMIT 5;"
```

## Troubleshooting

### PostgreSQL startet nicht

```bash
sudo systemctl status postgresql
sudo journalctl -u postgresql -n 50
```

### Verbindungsfehler

```bash
# Prüfe ob PostgreSQL läuft
sudo systemctl status postgresql

# Prüfe ob Port 5432 offen ist
sudo netstat -tulpn | grep 5432
```

### Tabellen fehlen

```bash
# Führe Migrationen manuell aus
cd ~/inclusions-2.0/backend/supabase/migrations
sudo -u postgres psql -d inclusions_db -f 001_initial_schema.sql
sudo -u postgres psql -d inclusions_db -f 002_rls_policies.sql
sudo -u postgres psql -d inclusions_db -f 004_add_viewed_at_fields.sql
```

## Fertig!

Die Datenbank ist jetzt eingerichtet und die Formulare sollten Daten direkt in PostgreSQL speichern (ohne Supabase).
