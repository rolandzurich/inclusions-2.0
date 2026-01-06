# Inclusions 2.0 Backend - Setup & Deployment

## Übersicht

Selbst-gehostetes Backend mit Supabase (PostgreSQL), Umami Analytics und Resend E-Mail-Service. Alles läuft via Docker Compose.

## Voraussetzungen

- Docker & Docker Compose installiert
- Server in der Schweiz (für DSGVO-Konformität)
- Domain mit DNS-Zugriff (für E-Mail-Setup)
- Resend Account (kostenlos verfügbar)

## Lokale Entwicklung

### 1. Umgebungsvariablen einrichten

```bash
cd backend
cp env.example .env
```

Bearbeite `.env` und setze:
- `POSTGRES_PASSWORD` - Starker Passwort (min. 32 Zeichen)
- `JWT_SECRET` - Zufälliger String (min. 32 Zeichen)
- `RESEND_API_KEY` - Dein Resend API Key
- `RESEND_FROM_EMAIL` - E-Mail-Adresse für Absender
- `RESEND_ADMIN_EMAIL` - Admin-E-Mail für Notifications

### 2. Docker Compose starten

```bash
docker-compose up -d
```

Dies startet:
- **Supabase** (Postgres, Auth, REST API, Studio)
  - Postgres: `localhost:54322`
  - Studio: `http://localhost:54323`
  - REST API: `http://localhost:3001`
- **Umami** (Analytics)
  - Dashboard: `http://localhost:3000`

### 3. Supabase Studio öffnen

Öffne `http://localhost:54323` im Browser.

**Wichtig:** Beim ersten Start werden die SQL-Migrationen automatisch ausgeführt.

### 4. Umami Setup

1. Öffne `http://localhost:3000`
2. Erstelle einen Account (erster User wird Admin)
3. Erstelle eine Website
4. Kopiere die Website-ID in `.env` als `NEXT_PUBLIC_UMAMI_WEBSITE_ID`

### 5. Next.js Umgebungsvariablen

Erstelle `.env.local` im Root-Verzeichnis:

```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_ANON_KEY=<aus Supabase Studio>
SUPABASE_SERVICE_ROLE_KEY=<aus Supabase Studio>
NEXT_PUBLIC_UMAMI_URL=http://localhost:3000
NEXT_PUBLIC_UMAMI_WEBSITE_ID=<aus Umami>
RESEND_API_KEY=<dein-resend-key>
RESEND_FROM_EMAIL=noreply@inclusions.zone
RESEND_ADMIN_EMAIL=admin@inclusions.zone
```

**Supabase Keys finden:**
1. Öffne Supabase Studio (`http://localhost:54323`)
2. Gehe zu Settings → API
3. Kopiere `anon` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Kopiere `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

### 6. Admin User erstellen

```bash
# Via Supabase Studio oder SQL:
# In Supabase Studio → SQL Editor:

INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  'admin@inclusions.zone',
  crypt('dein-passwort', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
);
```

**Oder:** Nutze Supabase Auth UI in Studio.

## Produktion Deployment

### 1. Server vorbereiten

```bash
# Docker installieren (falls nicht vorhanden)
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Docker Compose installieren
sudo apt-get update
sudo apt-get install docker-compose-plugin
```

### 2. Projekt auf Server kopieren

```bash
# Via Git oder SCP
git clone <dein-repo>
cd inclusions-2.0/backend
```

### 3. Umgebungsvariablen setzen

```bash
cp env.example .env
nano .env  # Bearbeite alle Werte für Produktion
```

**Wichtig für Produktion:**
- `API_EXTERNAL_URL=https://api.inclusions.zone` (deine Domain)
- `GOTRUE_SITE_URL=https://inclusions.zone` (deine Frontend-Domain)
- Starke Passwörter verwenden!

### 4. Reverse Proxy einrichten (Nginx)

```nginx
# /etc/nginx/sites-available/inclusions-backend

# Supabase Studio
server {
    listen 80;
    server_name studio.inclusions.zone;
    
    location / {
        proxy_pass http://localhost:54323;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Umami
server {
    listen 80;
    server_name analytics.inclusions.zone;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**HTTPS mit Let's Encrypt:**
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d studio.inclusions.zone -d analytics.inclusions.zone
```

### 5. Docker Compose starten

```bash
docker-compose up -d
```

### 6. Firewall konfigurieren

```bash
# Nur notwendige Ports öffnen
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

**Wichtig:** Postgres (54322) sollte NICHT öffentlich erreichbar sein!

## E-Mail Setup (Resend)

### 1. Domain verifizieren

1. Gehe zu [Resend Dashboard](https://resend.com/domains)
2. Füge deine Domain hinzu (z.B. `inclusions.zone`)
3. Füge die DNS-Records hinzu:
   - SPF Record
   - DKIM Records
   - DMARC Record (optional)

### 2. DNS Records (Beispiel)

```
# SPF
TXT @ "v=spf1 include:resend.com ~all"

# DKIM (von Resend bereitgestellt)
TXT resend._domainkey "..."

# DMARC (optional)
TXT _dmarc "v=DMARC1; p=none; rua=mailto:admin@inclusions.zone"
```

### 3. API Key erstellen

1. Gehe zu Resend → API Keys
2. Erstelle neuen Key
3. Kopiere in `.env` als `RESEND_API_KEY`

## Backup-Strategie

### Automatisches tägliches Backup

Erstelle `/etc/cron.daily/inclusions-backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/backups/inclusions"
DATE=$(date +%Y%m%d)
mkdir -p $BACKUP_DIR

# Postgres Backup
docker exec inclusions-supabase-db pg_dump -U supabase_admin postgres | gzip > $BACKUP_DIR/postgres-$DATE.sql.gz

# Alte Backups löschen (älter als 30 Tage)
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
```

```bash
chmod +x /etc/cron.daily/inclusions-backup.sh
```

### Manuelles Backup

```bash
# Postgres
docker exec inclusions-supabase-db pg_dump -U supabase_admin postgres > backup.sql

# Restore
docker exec -i inclusions-supabase-db psql -U supabase_admin postgres < backup.sql
```

## Monitoring

### Logs ansehen

```bash
# Alle Services
docker-compose logs -f

# Einzelner Service
docker-compose logs -f supabase-db
docker-compose logs -f umami
```

### Status prüfen

```bash
docker-compose ps
```

### Restart Services

```bash
docker-compose restart
```

## Troubleshooting

### Supabase startet nicht

```bash
# Prüfe Logs
docker-compose logs supabase-db

# Prüfe ob Ports belegt sind
netstat -tulpn | grep 54322
```

### Umami zeigt keine Daten

1. Prüfe ob Umami läuft: `docker-compose ps`
2. Prüfe Browser Console auf Fehler
3. Prüfe Umami Logs: `docker-compose logs umami`

### E-Mails werden nicht versendet

1. Prüfe Resend API Key in `.env`
2. Prüfe Domain-Verifizierung in Resend Dashboard
3. Prüfe Logs: `docker-compose logs` (nach E-Mail-Fehlern suchen)

## Sicherheit

### Wichtige Punkte

1. **Starke Passwörter** für alle Services
2. **Firewall** konfigurieren (nur notwendige Ports)
3. **HTTPS** für alle öffentlichen Services
4. **Regelmäßige Updates**:
   ```bash
   docker-compose pull
   docker-compose up -d
   ```
5. **Backups** täglich prüfen
6. **RLS Policies** in Supabase sind aktiv (kein öffentlicher Datenzugriff)

## Support & Dokumentation

- [Supabase Self-Hosting](https://supabase.com/docs/guides/self-hosting)
- [Umami Documentation](https://umami.is/docs)
- [Resend Documentation](https://resend.com/docs)

## Nächste Schritte

1. ✅ Backend Setup
2. ⏳ Frontend Integration (Formulare anpassen)
3. ⏳ Admin-UI testen
4. ⏳ E-Mail-Templates anpassen
5. ⏳ Analytics Events implementieren

