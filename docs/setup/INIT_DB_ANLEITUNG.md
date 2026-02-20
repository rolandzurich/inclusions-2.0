# 🚀 Datenbank-Initialisierung via Browser

## Quick Start

1. **Development Server starten:**
   ```bash
   npm run dev
   ```

2. **Init-Seite öffnen:**
   ```
   http://localhost:3000/admin-v2/init-db
   ```

3. **Auf "Datenbank jetzt initialisieren" klicken**
   - Die Seite führt automatisch alle SQL-Befehle aus
   - Du siehst eine Erfolgsmeldung mit allen erstellten Tabellen
   - Status wird live aktualisiert

4. **Nach erfolgreicher Initialisierung:**
   - Gehe zum Dashboard: `http://localhost:3000/admin-v2/dashboard`
   - Die Init-Seite kann gelöscht werden (optional)

---

## Was wird erstellt?

Die Init-Seite führt das Schema aus `backend/schema_admin_v2_standalone.sql` aus und erstellt:

### CRM-Tabellen
- ✅ `companies` – Unternehmen
- ✅ `contacts` – Kontakte
- ✅ `deals` – Sales-Pipeline

### Projektmanagement
- ✅ `projects` – Projekte
- ✅ `project_tasks` – Aufgaben

### Kalender
- ✅ `events_v2` – Events
- ✅ `event_rsvps` – RSVP-Anmeldungen

### Buchhaltung
- ✅ `journal_entries` – Buchhaltungs-Journal (CHF)

---

## Funktionen der Init-Seite

### 1. Status-Check
- Prüft Datenbankverbindung
- Zeigt PostgreSQL-Version
- Listet vorhandene Tabellen auf

### 2. Schema-Initialisierung
- Liest `backend/schema_admin_v2_standalone.sql`
- Führt alle SQL-Statements aus
- Zeigt Erfolg oder Fehler an
- Listet erstellte Tabellen auf

### 3. Fehlerbehandlung
- Zeigt detaillierte Fehlermeldungen
- "Already exists"-Fehler werden als Warnung behandelt
- Technische Details zum Debuggen

---

## Troubleshooting

### Verbindungsfehler
```
❌ Datenbankverbindung fehlgeschlagen
```

**Lösung:**
1. Prüfe `.env.local`:
   ```env
   DB_HOST=10.55.55.155
   DB_PORT=5432
   DB_DATABASE=inclusions_db
   DB_USER=inclusions_user
   DB_PASSWORD=inclusions_secure_password_2024!
   ```

2. Stelle sicher, dass PostgreSQL auf dem Server läuft:
   ```bash
   ssh incluzone@10.55.55.155
   sudo systemctl status postgresql
   ```

### Tabellen bereits vorhanden
```
⚠️ relation "contacts" already exists
```

**Das ist OK!** Die Init-Seite behandelt dies als Warnung und fährt fort.

### Schema-Fehler
```
❌ Schema-Ausführung fehlgeschlagen
```

**Lösung:**
1. Prüfe die technischen Details (aufklappen)
2. Schaue in die Server-Logs: `npm run dev` Terminal
3. Teste manuell: `psql -h 10.55.55.155 -U inclusions_user -d inclusions_db`

---

## Nach der Initialisierung

### Seite löschen (optional)
```bash
rm -rf app/admin-v2/init-db
rm -rf app/api/admin-v2/init-db
```

### Dashboard öffnen
```
http://localhost:3000/admin-v2/dashboard
```

### API-Routen implementieren
Siehe `ADMIN_V2_README.md` für die nächsten Schritte.

---

## Technische Details

### Dateien
- `app/admin-v2/init-db/page.tsx` – UI-Seite
- `app/api/admin-v2/init-db/route.ts` – API-Route
- `lib/db-postgres.ts` – PostgreSQL-Client
- `backend/schema_admin_v2_standalone.sql` – SQL-Schema

### API-Endpoints
- `GET /api/admin-v2/init-db` – Status-Check
- `POST /api/admin-v2/init-db` – Initialisierung starten

### Sicherheit
- ⚠️ Diese Seite sollte in Produktion nicht verfügbar sein
- Nur für initiale Einrichtung gedacht
- Nach der Initialisierung löschen oder schützen

---

**Viel Erfolg! 🎉**
