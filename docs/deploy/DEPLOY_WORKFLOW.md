# Deployment: Mac → Server

## Schnell-Updates (Texte, Bilder) – kein Build

```bash
./deploy-content-only.sh
```

**Gilt für:** Line-up, Choreografie-Text, Event-Line-up, Bilder  
**Dateien:** `data/content.json`, `data/*.json`, `public/`  
**Dauer:** ~10–20 Sekunden

---

## Full Deploy (Code, neue Seiten, DJ-Daten)

```bash
./deploy-full-local-build.sh
```

**Gilt für:** Neue Seiten, CRM, Änderungen in `djs.json`, Layout/Code  
**Dauer:** ~2–3 Minuten (Build lokal, Upload per rsync)

---

## Inhalt bearbeiten

| Was | Datei |
|-----|-------|
| Startseite Line-up + Choreografie | `data/content.json` |
| Event-Seite Line-up | `data/content.json` → `eventsLineup` |
| Bilder | `public/images/` |
| DJ-Pairs, Events | `data/djs.json`, `data/events.json` → Full Deploy |
