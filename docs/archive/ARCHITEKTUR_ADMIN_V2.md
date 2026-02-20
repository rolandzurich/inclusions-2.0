# INCLUSIONS V2 – AI-First CRM & Betriebssystem

## Architektur-Übersicht

Erweiterung der bestehenden inclusions.zone zu einem internen Betriebssystem mit:
- **CRM** (Kontakte, Unternehmen, Deals)
- **Projektmanagement** (Projekte, Aufgaben)
- **Kalender & RSVP** (Events, Teilnehmer)
- **Buchhaltungs-Journal** (Einfache Einnahmen/Ausgaben)

**USP:** Datenhoheit auf Schweizer Servern (10.55.55.155), KI-First Ansatz.

---

## Prinzipien

| Prinzip | Umsetzung |
|---------|-----------|
| **Security First** | Keine Hardcoded API-Keys, ausschließlich `.env` |
| **Staging-Strategie** | Neue Funktionen unter `/admin-v2/` oder neuen Routen |
| **Tech Stack** | Next.js 14, Tailwind, PostgreSQL (Schweizer Server) |
| **Schweizer Standards** | CHF, ISO-Datum, Europe/Zurich, de-CH |

---

## Rollen

| Rolle | Rechte |
|-------|--------|
| **Admin** | Vollzugriff, Buchhaltung, User-Verwaltung |
| **Crew-Member** | CRM, Projekte, Kalender (kein Buchhaltung) |
| **Partner** | Lesezugriff auf relevante Projekte/Events |

---

## Modul-Architektur

```
/admin-v2/
├── dashboard/          # Übersicht, KPIs
├── crm/
│   ├── contacts/       # Kontakte
│   ├── companies/      # Unternehmen
│   └── deals/          # Deals/Pipeline
├── projects/
│   ├── list/           # Projektliste
│   └── [id]/           # Projekt-Detail + Tasks
├── calendar/
│   ├── view/           # Kalender-Ansicht
│   └── events/         # Event-Verwaltung + RSVP
└── accounting/
    └── journal/        # Buchhaltungs-Journal (nur Admin)
```

---

## Datenmodell (Kern-Entitäten)

### CRM
- **contacts** – Personen (Name, E-Mail, Telefon, Firma, Rolle)
- **companies** – Unternehmen (Name, Adresse, UID, MWST-Nr.)
- **deals** – Deals/Pipeline (Kontakt, Betrag CHF, Status, Fälligkeit)

### Projektmanagement
- **projects** – Projekte (Name, Beschreibung, Status, Start/Ende)
- **project_tasks** – Aufgaben (Projekt, Titel, Status, Fälligkeit, Zugewiesen)

### Kalender & RSVP
- **events** – Events (Name, Datum, Ort, Kapazität, Status)
- **event_rsvps** – RSVPs (Event, Kontakt, Status: pending/confirmed/cancelled)

### Buchhaltung
- **journal_entries** – Buchungssätze (Datum, Betrag CHF, Typ, Beschreibung, Kategorie)

---

## Schweizer Standards (DB & App)

| Aspekt | Standard |
|--------|----------|
| **Währung** | CHF (DECIMAL(12,2)) |
| **Datum** | DATE (ISO 8601: YYYY-MM-DD), Anzeige: DD.MM.YYYY |
| **Zeitzone** | TIMESTAMPTZ, Default: Europe/Zurich |
| **MWST** | 8.1% Standard, 2.7% Reduziert, 0% Befreit |
| **UID** | CHE-XXX.XXX.XXX (Unternehmens-Identifikationsnummer) |

---

## API-Struktur (admin-v2)

```
/api/admin-v2/
├── contacts/
├── companies/
├── deals/
├── projects/
├── tasks/
├── events/
├── rsvps/
└── journal/          # Nur mit Admin-Rolle
```

---

## KI-Integration (geplant)

- **Chat-Assistent** für CRM-Abfragen, Projekt-Updates
- **Automatische Kategorisierung** von Buchungen
- **RSVP-Reminder** per E-Mail
- **Deal-Vorhersage** (Pipeline-Analyse)

---

## Deployment

- **Staging:** `/admin-v2/*` – neue Features zuerst hier
- **Live:** Bestehende `/admin/*` bleibt unverändert
- **Migration:** JSON-Daten → PostgreSQL nach Schema-Migration
