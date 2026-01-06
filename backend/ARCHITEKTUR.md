# Backend-Architektur für Inclusions 2.0

## Übersicht

Selbst-gehostetes Backend mit Fokus auf Einfachheit, Wartbarkeit und Alltagstauglichkeit.

## Komponenten

### 1. Supabase (Self-Hosted)
- **Rolle:** PostgreSQL Datenbank + Auth + API
- **Docker:** Offizielle Supabase Docker-Images
- **Services:**
  - Postgres (Datenbank)
  - GoTrue (Authentication)
  - PostgREST (REST API)
  - Realtime (WebSocket)
  - Storage (optional, für Dateien)

### 2. Umami (Self-Hosted)
- **Rolle:** Privacy-freundliche Analytics
- **Docker:** Offizielles Umami Image
- **Features:**
  - Pageviews Tracking
  - Event Tracking (Form Submits)
  - DSGVO-konform (keine Cookies, anonymisiert)

### 3. Resend
- **Rolle:** E-Mail-Versand
- **Typ:** Externer Service (API)
- **Features:**
  - Transactional E-Mails
  - Templates
  - SPF/DKIM/DMARC Support

### 4. Next.js Backend (API Routes)
- **Rolle:** Business Logic + Admin-UI
- **Features:**
  - Formular-Handler
  - E-Mail-Integration
  - Admin-Dashboard
  - Mini-CMS API

## Datenbank-Schema

### Tabellen

#### `contact_requests`
- Formular-Einsendungen (Booking, Dance Crew, etc.)
- Felder: id, created_at, name, email, phone, message, source_url, utm_*

#### `newsletter_subscribers`
- Newsletter-Anmeldungen mit Double-Opt-In
- Felder: id, created_at, email, first_name, last_name, has_disability, interests, opt_in_token, opt_in_confirmed_at, source_url, utm_*

#### `vip_registrations`
- VIP/Event-Anmeldungen
- Felder: id, created_at, name, email, phone, event_date, event_location, message, source_url, utm_*

#### `content_blocks`
- Mini-CMS Inhalte
- Felder: id, key (unique), title, body_markdown, image_url, updated_at

#### `admin_notes`
- Interne Notizen zu Einträgen (optional)
- Felder: id, table_name, record_id, note, created_at, created_by

## Sicherheit

### Row Level Security (RLS)
- **Öffentlich:** INSERT auf contact_requests, newsletter_subscribers, vip_registrations
- **Öffentlich:** SELECT auf content_blocks (nur published)
- **Admin:** SELECT/UPDATE/DELETE auf alle Tabellen
- **Kein öffentliches SELECT** auf Formular-Daten

### Spam-Schutz
- Honeypot-Felder in Formularen
- Rate Limiting (IP-basiert)
- E-Mail-Validierung

## E-Mail-Flows

### 1. Kontaktformular
```
User → API → Supabase → Resend
                ↓
        [Bestätigung an User]
        [Notification an Admin]
```

### 2. Newsletter
```
User → API → Supabase (unconfirmed)
                ↓
        [Opt-In E-Mail via Resend]
                ↓
        User klickt Link → API → Supabase (confirmed)
                ↓
        [Willkommens-E-Mail]
```

### 3. VIP/Event
```
User → API → Supabase → Resend
                ↓
        [Bestätigung an User]
        [Notification an Admin]
```

## Admin-Bereich

### Struktur
- `/admin` - Login
- `/admin/dashboard` - Übersicht
- `/admin/contact-requests` - Formular-Einsendungen
- `/admin/newsletter` - Newsletter-Anmeldungen
- `/admin/vip` - VIP-Anmeldungen
- `/admin/content` - CMS-Inhalte

### Features
- Einfache Tabellen-Ansicht
- Filter nach Datum (optional)
- Löschen von Einträgen
- Notizen hinzufügen (optional)
- CSV-Export (optional, kein Fokus)

## Deployment

### Lokale Entwicklung
```bash
docker-compose up -d
# Supabase Studio: http://localhost:54323
# Umami: http://localhost:3000
```

### Produktion
- Docker Compose auf Server
- Reverse Proxy (Nginx/Traefik) für HTTPS
- ENV-Variablen via `.env` Datei
- Tägliche Backups (Postgres Dumps)

## Datei-Struktur

```
backend/
├── docker-compose.yml
├── supabase/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_rls_policies.sql
│   │   └── 003_seed_data.sql
│   └── config.toml
├── umami/
│   └── .env
├── .env.example
└── ARCHITEKTUR.md

inclusions-2.0/
├── app/
│   ├── api/
│   │   ├── contact/
│   │   ├── newsletter/
│   │   ├── vip/
│   │   └── content/
│   └── admin/
│       ├── layout.tsx
│       ├── login/
│       └── dashboard/
├── lib/
│   ├── supabase.ts
│   ├── resend.ts
│   └── umami.ts
└── components/
    └── admin/
```

## Technologie-Stack

- **Datenbank:** PostgreSQL (via Supabase)
- **Auth:** Supabase Auth (JWT)
- **API:** Next.js API Routes + PostgREST
- **E-Mail:** Resend
- **Analytics:** Umami
- **Frontend:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS (bereits vorhanden)

## Nächste Schritte

1. ✅ Architektur-Plan
2. ⏳ Docker Compose Setup
3. ⏳ Datenbankschema
4. ⏳ API-Routen
5. ⏳ Admin-UI
6. ⏳ Dokumentation

