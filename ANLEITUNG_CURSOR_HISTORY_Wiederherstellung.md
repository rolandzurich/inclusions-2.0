# Cursor Local History – Wiederherstellung

Diese Anleitung erklärt, wie du über die **Cursor Local History** wiederhergestellst, was durch `git restore` und `git clean -fd` überschrieben bzw. gelöscht wurde.

---

## Voraussetzungen

- Projekt **inclusions-2.0** in Cursor geöffnet
- Cursor hat beim Bearbeiten Local-History-Einträge angelegt (Standard)

---

## Schritt 1: Trockenlauf (empfohlen)

Zeigt, **welche Dateien** wiederhergestellt würden, **ohne etwas zu ändern**:

```bash
cd /Users/roland/Curser/inclusions-2.0
node restore-from-cursor-history.js --dry-run
```

- Prüfe die Liste.
- Wenn etwas nicht passen würde, sag Bescheid, bevor du den nächsten Schritt machst.

---

## Schritt 2: Wiederherstellung ausführen

Führe das Skript **ohne** `--dry-run` aus:

```bash
node restore-from-cursor-history.js
```

Damit werden die **neuesten** in Cursors History gespeicherten Versionen von Dateien in  
`app/`, `lib/`, `components/`, `data/` in dein Projekt zurückkopiert.

---

## Schritt 3: Prüfen

- Geänderte/unterschiedene Dateien ansehen:
  ```bash
  git status
  git diff
  ```
- App lokal starten und grob durchklicken:
  ```bash
  npm run dev
  ```

---

## Was wird wiederhergestellt?

| Bereich | Inhalt |
|--------|--------|
| **app/** | `page.tsx`, `layout.tsx`, `globals.css`, API-Routes (`api/chat-gemini`, `api/contact`, `api/newsletter`, `api/vip`, `api/admin/djs`, `api/test-gemini-key`), `admin/`, `anmeldung/vip`, `booking`, `djs`, `events`, `ki-innovator`, `ueber-uns` usw. |
| **lib/** | z.B. `resend.ts`, `google-sheets.ts` |
| **components/** | z.B. `Footer.tsx`, `VoiceAgent.tsx` |
| **data/** | z.B. `djs.json`, `events.json`, `rueckblick.json` |

Es zählt immer die **letzte** in der History gespeicherte Version (höchster Zeitstempel).

---

## Was wird NICHT wiederhergestellt?

- **Breadcrumbs.tsx, FAQ.tsx, app/faq/**  
  Wenn sie nie gespeichert wurden, gibt es keinen History-Eintrag.
- **Neue Dateien**, die du nie in Cursor geöffnet/gespeichert hattest (z.B. manche Setup-Skripte, Migrations-SQL, Bilder).
- **.env / .env.local**  
  Enthalten oft Secrets; bewusst nicht im Skript.  
  Falls du sie aus der History holen willst: siehe Abschnitt „Andere Dateien (manuell)“.

---

## Andere Dateien (manuell) aus Cursor-History holen

1. **Datei in Cursor öffnen** (z.B. eine leere oder Platzhalter-Version, falls die echte weg ist).
2. **Timeline / Local History öffnen:**
   - Unten in der **„Timeline“**-Leiste auf den Verlauf klicken, **oder**
   - Rechter Mausklick in den Editor → **„Open Local History“** / **„Local History“**, **oder**
   - Command Palette (`Cmd+Shift+P`) → z.B. **„Local History: Find Entry to Restore“**.
3. Eintrag mit passendem Datum wählen und Inhalt wiederherstellen.

---

## Wo liegt Cursors Local History?

- Ordner:
  ```
  ~/Library/Application Support/Cursor/User/History/
  ```
- Darin pro Datei ein Unterordner (Hash) mit `entries.json` (Metadaten) und den gespeicherten Versionen (z.B. `xyz.tsx`).

Das Skript `restore-from-cursor-history.js` liest genau diese Struktur.

---

## Bei Problemen

- **„History-Ordner nicht gefunden“**  
  Pfad prüfen (z.B. `ls ~/Library/Application\ Support/Cursor/User/History`).  
  Wenn Cursor nie mit diesem Projekt genutzt wurde, gibt es ggf. keine Einträge.

- **Zu alte Version wiederhergestellt**  
  Das Skript nutzt immer die **neueste** History-Version.  
  Ältere Versionen nur manuell über „Open Local History“ / Timeline wählbar.

- **Datei fehlt in der Liste**  
  Nur `app/`, `lib/`, `components/`, `data/` sind einbezogen.  
  Andere Pfade: manuell über Timeline (siehe oben) oder Skript anpassen.

---

## Skript wieder entfernen (optional)

Wenn du es nicht mehr brauchst:

```bash
rm restore-from-cursor-history.js
```

Die Anleitung kannst du behalten oder löschen.
