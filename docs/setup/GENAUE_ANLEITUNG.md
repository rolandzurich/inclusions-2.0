# GENAUE ANLEITUNG - Schritt für Schritt

## Du bist bereits im richtigen Verzeichnis! ✅

Dein Terminal zeigt: `MacBook-Air-2:inclusions-2.0 roland$`

Das ist perfekt! Du musst nur noch **1 Befehl** ausführen.

---

## JETZT AUSFÜHREN:

**Kopiere diesen Befehl und füge ihn im Terminal ein:**

```bash
./setup-voice-agent.sh
```

**Dann drücke Enter.**

---

## Was passiert:

1. Das Skript kopiert automatisch die Environment Variables auf den Server
2. Die App wird neu gestartet
3. Du siehst Ausgaben wie:
   - `📋 Kopiere Environment Variables auf Server...`
   - `✅ Environment Variables kopiert`
   - `🔄 Starte Next.js App neu...`
   - `✅ App gestartet`

**Das dauert ca. 10-20 Sekunden.**

---

## Nach dem Skript:

**Öffne deinen Browser** (Chrome oder Edge) und:

1. Gehe zu: `http://10.55.55.155`
2. Scrolle zur Voice Agent Box (INCLUSI mit pinkem Icon)
3. Klicke auf **"Mit INCLUSI sprechen"**
4. **Erlaube Mikrofon-Zugriff** (Browser fragt dich)
5. Stelle eine Frage, z.B.:
   - "Wann ist das nächste Event?"
   - "Was ist INCLUSIONS?"

**✅ Erwartung:** INCLUSI antwortet und spricht die Antwort vor.

---

## Falls Fehler auftreten:

**Falls das Skript einen Fehler zeigt** (z.B. "Permission denied" oder "Connection refused"):

**Alternative:** Wenn du bereits auf dem Server eingeloggt bist, führe dort aus:

```bash
cd ~/inclusions-2.0
cp .env.production .env
pkill -f 'next start'
npm start > /tmp/next.log 2>&1 &
```

**Dann warte 5 Sekunden** und teste im Browser.

---

## Zusammenfassung:

**JETZT:** Führe aus: `./setup-voice-agent.sh`

**DANN:** Browser öffnen → `http://10.55.55.155` → Voice Agent testen

**Das war's!** 🎉
