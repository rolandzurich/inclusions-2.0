# 🚀 Admin V2 – Setup abgeschlossen!

## ✅ Was wurde erstellt?

### 1. Architektur & Dokumentation
- `ARCHITEKTUR_ADMIN_V2.md` – Vollständige System-Architektur
- `SCHEMA_DEPLOYMENT.md` – Deployment-Anleitung für PostgreSQL
- `.env.example` – Erweitert mit allen neuen Variablen
- `.env.local` – Lokale Entwicklungsumgebung (bereits konfiguriert)

### 2. Datenbank-Schema
- `backend/supabase/migrations/005_admin_v2_crm_os.sql` – Supabase-Migration
- `backend/schema_admin_v2_standalone.sql` – Standalone PostgreSQL-Schema

**Tabellen:**
- ✅ `companies` – Unternehmen (UID, MWST)
- ✅ `contacts` – Kontakte (Personen)
- ✅ `deals` – Sales-Pipeline (CHF)
- ✅ `projects` – Projekte
- ✅ `project_tasks` – Aufgaben
- ✅ `events_v2` – Events (mit Zeitzone)
- ✅ `event_rsvps` – RSVP-Anmeldungen
- ✅ `journal_entries` – Buchhaltungs-Journal (CHF, MWST)

### 3. Admin-V2 Interface
**Routen:**
- ✅ `/admin-v2/dashboard` – Übersicht & KPIs
- ✅ `/admin-v2/crm/contacts` – Kontakte
- ✅ `/admin-v2/crm/companies` – Unternehmen
- ✅ `/admin-v2/crm/deals` – Deals & Pipeline
- ✅ `/admin-v2/projects` – Projekte (Placeholder)
- ✅ `/admin-v2/calendar` – Events & RSVP (Placeholder)
- ✅ `/admin-v2/accounting` – Buchhaltungs-Journal (Placeholder)

**Features:**
- Moderne UI mit Tailwind CSS
- Sidebar-Navigation
- Responsive Design
- Schweizer Standards (CHF, de-CH, Europe/Zurich)

---

## 🔧 Nächste Schritte

### Schritt 1: Schema deployen (Server)

Wähle eine Option:

**Option A: Automatisch (empfohlen)**
```bash
./deploy-schema-v2-simple.sh
```

**Option B: Manuell (siehe `SCHEMA_DEPLOYMENT.md`)**
```bash
scp backend/schema_admin_v2_standalone.sql incluzone@10.55.55.155:/tmp/
ssh incluzone@10.55.55.155
sudo -u postgres psql -d inclusions_db -f /tmp/schema_admin_v2_standalone.sql
```

**Option C: Lokal entwickeln**
```bash
brew install postgresql@14
createdb inclusions_db
psql -d inclusions_db -f backend/schema_admin_v2_standalone.sql
```

### Schritt 2: Development Server starten

```bash
npm run dev
```

Dann öffne: **http://localhost:3000/admin-v2/dashboard**

### Schritt 3: API-Routen implementieren

Erstelle API-Routen für CRUD-Operationen:

```
/api/admin-v2/
├── contacts/
│   ├── route.ts (GET, POST)
│   └── [id]/route.ts (GET, PATCH, DELETE)
├── companies/
│   ├── route.ts
│   └── [id]/route.ts
├── deals/
│   ├── route.ts
│   └── [id]/route.ts
└── ... (weitere Module)
```

**Beispiel:** `app/api/admin-v2/contacts/route.ts`
```typescript
import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true',
});

export async function GET() {
  try {
    const result = await pool.query(
      'SELECT * FROM contacts ORDER BY created_at DESC'
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
```

### Schritt 4: Authentifizierung implementieren

- [ ] Session-Management mit JWT
- [ ] Login-Seite für `/admin-v2/`
- [ ] Rollen-Checks (Admin, Crew, Partner)
- [ ] Middleware für geschützte Routen

### Schritt 5: Daten migrieren

Migriere bestehende Daten aus JSON-Dateien:

```bash
node scripts/migrate-json-to-postgres.js
```

**Migration umfasst:**
- `data/contact_requests.json` → `contacts`
- `data/vip_registrations.json` → `contacts` / `event_rsvps`
- `data/newsletter_subscribers.json` → `contacts`

---

## 🇨🇭 Schweizer Standards

Alle Module verwenden:

| Standard | Wert |
|----------|------|
| **Währung** | CHF (Schweizer Franken) |
| **Locale** | de-CH |
| **Zeitzone** | Europe/Zurich |
| **Datumsformat** | DD.MM.YYYY (Anzeige), YYYY-MM-DD (DB) |
| **MWST** | 8.1% Standard, 2.7% Reduziert, 0% Befreit |
| **UID** | CHE-XXX.XXX.XXX |

---

## 📁 Projektstruktur

```
inclusions-2.0/
├── app/
│   ├── admin/                  # Bestehendes Admin (bleibt unverändert)
│   └── admin-v2/              # Neues System (Staging)
│       ├── layout.tsx
│       ├── dashboard/
│       ├── crm/
│       ├── projects/
│       ├── calendar/
│       └── accounting/
├── backend/
│   ├── schema_admin_v2_standalone.sql
│   └── supabase/migrations/
├── lib/
│   └── db-postgres.ts         # TODO: PostgreSQL-Client
├── .env.local                 # Lokale Konfiguration
├── ARCHITEKTUR_ADMIN_V2.md
└── SCHEMA_DEPLOYMENT.md
```

---

## 🎯 Roadmap

### Phase 1: MVP (Woche 1-2)
- [x] Architektur & Schema
- [x] Admin-V2 Interface
- [ ] API-Routen (CRUD)
- [ ] Authentifizierung
- [ ] CRM: Kontakte & Unternehmen

### Phase 2: Erweiterte Features (Woche 3-4)
- [ ] Deals & Pipeline
- [ ] Projektmanagement
- [ ] Kalender & RSVP
- [ ] Buchhaltungs-Journal

### Phase 3: KI-Integration (Woche 5+)
- [ ] Chat-Assistent (Gemini)
- [ ] Automatische Kategorisierung
- [ ] RSVP-Reminder
- [ ] Deal-Vorhersage

---

## 🔒 Sicherheit

- ✅ Keine Hardcoded API-Keys
- ✅ `.env.local` in `.gitignore`
- ✅ Row Level Security (RLS) in Schema
- ⏳ Session-Management (JWT)
- ⏳ Rollen-basierte Zugriffskontrolle (RBAC)

---

## 📚 Weiterführende Dokumentation

- `ARCHITEKTUR_ADMIN_V2.md` – System-Design
- `SCHEMA_DEPLOYMENT.md` – Datenbank-Setup
- `.env.example` – Umgebungsvariablen
- `ENV_VARIABLES.md` – Alle Variablen erklärt

---

## 🆘 Support

Bei Fragen oder Problemen:
1. Prüfe die Logs: `tail -f .next/server-*.log`
2. Teste Datenbank: `psql -h 10.55.55.155 -U inclusions_user -d inclusions_db`
3. Dokumentation lesen: `SCHEMA_DEPLOYMENT.md`

**Server-Zugang:**
- IP: `10.55.55.155`
- User: `incluzone`
- Passwort: siehe `server.md`

---

**Viel Erfolg mit Inclusions V2!** 🎉
