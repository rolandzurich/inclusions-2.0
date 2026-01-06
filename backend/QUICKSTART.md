# Quick Start Guide

## Was wurde erstellt?

Ein vollständiges Backend-System für die Inclusions 2.0 Website mit:

✅ **Docker Compose Setup** - Supabase + Umami  
✅ **Datenbankschema** - Alle Tabellen mit RLS Policies  
✅ **API-Routen** - Contact, Newsletter, VIP, Content  
✅ **E-Mail-Integration** - Resend mit Templates  
✅ **Admin-UI** - Dashboard für Formular-Verwaltung  
✅ **Analytics** - Umami Integration  
✅ **Mini-CMS** - Content Blocks API  

## Nächste Schritte

### 1. Dependencies installieren

```bash
cd inclusions-2.0
npm install
```

Dies installiert:
- `@supabase/supabase-js` - Supabase Client
- `resend` - E-Mail Service

### 2. Backend starten

```bash
cd backend
cp env.example .env
# Bearbeite .env mit deinen Werten
docker-compose up -d
```

### 3. Supabase Keys holen

1. Öffne `http://localhost:54323` (Supabase Studio)
2. Gehe zu Settings → API
3. Kopiere Keys in `.env.local` (siehe README.md)

### 4. Umami Setup

1. Öffne `http://localhost:3000`
2. Erstelle Account + Website
3. Kopiere Website-ID in `.env.local`

### 5. Frontend anpassen

Siehe `FRONTEND_INTEGRATION.md` für Details.

**Wichtig:** Die bestehenden Formulare müssen angepasst werden, um die neuen API-Routen zu nutzen.

## Datei-Übersicht

```
backend/
├── docker-compose.yml          # Docker Setup
├── env.example                 # Umgebungsvariablen Template
├── supabase/
│   ├── migrations/            # SQL Migrationen
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_rls_policies.sql
│   │   └── 003_seed_data.sql
│   └── config.toml             # Supabase Config
├── README.md                   # Vollständige Dokumentation
├── DATENSCHUTZ.md             # Datenschutz-Infos
├── FRONTEND_INTEGRATION.md     # Frontend-Integration Guide
└── QUICKSTART.md              # Diese Datei

inclusions-2.0/
├── lib/
│   ├── supabase.ts            # Supabase Client
│   ├── resend.ts              # E-Mail Templates
│   ├── umami.ts               # Analytics Helper
│   └── form-helpers.ts        # Formular-Helper
├── app/
│   ├── api/
│   │   ├── contact/           # Kontakt-API
│   │   ├── newsletter/        # Newsletter-API
│   │   ├── vip/               # VIP-API
│   │   ├── content/           # CMS-API
│   │   └── admin/             # Admin-API
│   └── admin/                 # Admin-UI
│       ├── login/
│       ├── dashboard/
│       └── contact-requests/
└── components/
    └── UmamiScript.tsx        # Analytics Script
```

## Wichtige URLs (lokal)

- **Supabase Studio:** http://localhost:54323
- **Umami Dashboard:** http://localhost:3000
- **Admin-Bereich:** http://localhost:3000/admin/login
- **API:** http://localhost:3001 (PostgREST)

## Häufige Fragen

### Wie erstelle ich einen Admin-User?

Siehe README.md → "Admin User erstellen"

### Wo finde ich die Supabase Keys?

Supabase Studio → Settings → API

### Wie teste ich E-Mails?

Resend bietet einen Test-Modus. E-Mails werden im Dashboard angezeigt.

### Wie funktioniert das Newsletter Double-Opt-In?

1. User meldet sich an → Eintrag mit `status: 'pending'`
2. E-Mail mit Bestätigungslink wird gesendet
3. User klickt Link → `/api/newsletter/confirm?token=...`
4. Status wird auf `confirmed` gesetzt
5. Willkommens-E-Mail wird gesendet

### Wie aktiviere ich Analytics?

1. Umami starten (läuft automatisch mit Docker)
2. Website-ID in `.env.local` setzen
3. `UmamiScript` ist bereits im Layout integriert

## Support

Bei Fragen siehe:
- `README.md` - Vollständige Dokumentation
- `FRONTEND_INTEGRATION.md` - Frontend-Integration
- `DATENSCHUTZ.md` - Datenschutz-Infos

## Status

✅ Alle Core-Features implementiert  
⏳ Frontend-Integration (Formulare anpassen)  
⏳ Admin-Auth (aktuell nur Placeholder)  
⏳ Testing & Deployment  

