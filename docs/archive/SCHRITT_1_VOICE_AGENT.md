# Schritt 1: Voice Agent aktivieren - Einfache Anleitung

## Was du machen musst:

### Schritt 1.1: Skript ausführen (1 Befehl)

**Öffne Terminal auf deinem Mac** und führe aus:

```bash
cd /Users/roland/Curser/inclusions-2.0
./setup-voice-agent.sh
```

**Das war's!** Das Skript macht automatisch:
- ✅ Kopiert Environment Variables auf Server
- ✅ Startet die App neu
- ✅ Voice Agent ist aktiviert

---

### Schritt 1.2: Testen (im Browser)

1. **Öffne Browser** (Chrome oder Edge funktioniert am besten)
2. **Gehe zu:** `http://10.55.55.155`
3. **Scrolle zur Voice Agent Box** (INCLUSI mit pinkem Icon)
4. **Klicke auf "Mit INCLUSI sprechen"**
5. **Erlaube Mikrofon-Zugriff** (Browser fragt dich)
6. **Stelle eine Frage**, z.B.:
   - "Wann ist das nächste Event?"
   - "Was ist INCLUSIONS?"
   - "Wie kann ich mich anmelden?"

**✅ Erwartung:** INCLUSI antwortet dir und spricht die Antwort vor.

---

## Falls das Skript nicht funktioniert:

### Alternative: Manuell auf dem Server

**Wenn du bereits auf dem Server eingeloggt bist:**

```bash
cd ~/inclusions-2.0
cp .env.production .env
pkill -f 'next start'
npm start > /tmp/next.log 2>&1 &
```

**Dann warte 5 Sekunden** und teste im Browser.

---

## Was passiert technisch?

1. Das Skript kopiert `.env.production` → Server `.env`
2. Die App wird neu gestartet
3. `GEMINI_API_KEY` ist jetzt aktiv
4. Voice Agent kann jetzt mit Google Gemini kommunizieren

---

## Probleme?

**Falls Voice Agent nicht funktioniert:**

1. **Prüfe Browser-Konsole:**
   - Drücke F12 → Console Tab
   - Suche nach Fehlermeldungen

2. **Prüfe ob App läuft:**
   ```bash
   ssh incluzone@10.55.55.155 "pgrep -f 'next start'"
   ```
   Sollte eine Zahl ausgeben (z.B. `12345`)

3. **Prüfe Logs:**
   ```bash
   ssh incluzone@10.55.55.155 "tail -20 /tmp/next.log"
   ```

**Falls Mikrofon nicht funktioniert:**
- Browser-Einstellungen → Mikrofon erlauben
- Seite neu laden (F5)

---

## Zusammenfassung:

1. ✅ Terminal öffnen
2. ✅ `cd /Users/roland/Curser/inclusions-2.0`
3. ✅ `./setup-voice-agent.sh` ausführen
4. ✅ Browser öffnen: `http://10.55.55.155`
5. ✅ Voice Agent testen

**Das war's!** 🎉
