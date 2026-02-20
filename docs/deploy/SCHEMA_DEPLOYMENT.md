# Schema-Deployment – Admin V2

## Option 1: Automatisches Deployment (empfohlen)

```bash
# Führe das Deployment-Skript aus
./deploy-schema-v2-simple.sh
```

Falls `sshpass` nicht installiert ist:
```bash
brew install hudochenkov/sshpass/sshpass
```

---

## Option 2: Manuelles Deployment

### Schritt 1: Schema auf Server kopieren

```bash
scp backend/schema_admin_v2_standalone.sql incluzone@10.55.55.155:/tmp/
```

### Schritt 2: Auf Server einloggen

```bash
ssh incluzone@10.55.55.155
```
Passwort: `13vor12!Asdf`

### Schritt 3: PostgreSQL prüfen/installieren

```bash
# Prüfen ob PostgreSQL installiert ist
psql --version

# Falls nicht installiert:
sudo apt-get update
sudo apt-get install -y postgresql postgresql-contrib

# Service starten
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Schritt 4: Datenbank erstellen (falls nicht vorhanden)

```bash
sudo -u postgres psql
```

Im PostgreSQL-Prompt:
```sql
CREATE DATABASE inclusions_db;
CREATE USER inclusions_user WITH ENCRYPTED PASSWORD 'inclusions_secure_password_2024!';
GRANT ALL PRIVILEGES ON DATABASE inclusions_db TO inclusions_user;
\q
```

### Schritt 5: Schema ausführen

```bash
sudo -u postgres psql -d inclusions_db -f /tmp/schema_admin_v2_standalone.sql
```

### Schritt 6: Prüfen

```bash
sudo -u postgres psql -d inclusions_db -c "\dt"
```

Du solltest diese Tabellen sehen:
- companies
- contacts
- deals
- projects
- project_tasks
- events_v2
- event_rsvps
- journal_entries

---

## Option 3: Lokales PostgreSQL (für Entwicklung)

Falls du lokal entwickeln möchtest:

```bash
# PostgreSQL lokal installieren (macOS)
brew install postgresql@14
brew services start postgresql@14

# Datenbank erstellen
createdb inclusions_db

# Schema ausführen
psql -d inclusions_db -f backend/schema_admin_v2_standalone.sql

# Prüfen
psql -d inclusions_db -c "\dt"
```

Dann in `.env.local`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=inclusions_db
DB_USER=dein-user
DB_PASSWORD=
DB_SSL=false
```
