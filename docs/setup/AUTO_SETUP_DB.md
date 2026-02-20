# 🚨 Datenbank-Problem: Server nicht erreichbar

## Problem

Der PostgreSQL-Server (10.55.55.155) ist momentan **nicht erreichbar**.

Mögliche Gründe:
- 🔴 Server ist ausgeschaltet
- 🔴 VPN-Verbindung fehlt
- 🔴 Firewall blockiert Zugriff
- 🔴 IP-Adresse hat sich geändert

---

## ✅ Sofort-Lösung: SQLite als Fallback

Da du "keine Terminal-Befehle" ausführen möchtest und der Server nicht erreichbar ist, nutze **SQLite** als temporäre Lösung:

### Schritt 1: `.env.local` anpassen

Ändere in `.env.local`:

```env
# PostgreSQL auskommentieren:
# DB_HOST=10.55.55.155
# DB_PORT=5432
# DB_DATABASE=inclusions_db
# DB_USER=inclusions_user
# DB_PASSWORD=inclusions_secure_password_2024!
# DB_SSL=false

# SQLite aktivieren:
SQLITE_DB_PATH=./data/inclusions.db
USE_SQLITE=true
```

### Schritt 2: Server neu starten

```bash
# STRG+C im Terminal, dann:
npm run dev
```

### Schritt 3: Init-Seite wird automatisch SQLite nutzen

Die Init-Seite erkennt automatisch, dass SQLite genutzt wird und erstellt die Tabellen lokal.

---

## 🔄 Später zu PostgreSQL migrieren

Sobald der Server erreichbar ist:

1. In `.env.local` wieder PostgreSQL aktivieren
2. Server neu starten
3. Init-Seite ausführen
4. Daten von SQLite zu PostgreSQL migrieren (optional)

---

## 🛠️ Alternative: Postgres.app (macOS, GUI)

Falls du PostgreSQL lokal nutzen möchtest:

1. Download: https://postgresapp.com/
2. Installieren (einfach in Applications ziehen)
3. App starten
4. Klick auf "Initialize" für eine neue Datenbank
5. In `.env.local`:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_DATABASE=inclusions_db
   DB_USER=dein-mac-username
   DB_PASSWORD=
   ```

**Kein Terminal nötig!**

---

## 📞 Server-Zugriff prüfen

Bitte prüfe:

1. **Ist der Server eingeschaltet?**
2. **VPN aktiv?** (Falls der Server nur über VPN erreichbar ist)
3. **Richtige IP?** Ist 10.55.55.155 noch aktuell?

---

Ich erstelle jetzt eine erweiterte Init-Seite, die automatisch auf SQLite umschaltet, wenn PostgreSQL nicht erreichbar ist.
