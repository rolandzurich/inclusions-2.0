# Voice Agent Fehler beheben - Schritt für Schritt

## Problem: "Spracherkennungsfehler: not-allowed"

Dieser Fehler bedeutet: **Der Browser erlaubt keinen Mikrofon-Zugriff.**

Das ist **KEIN Server-Problem** - die App läuft korrekt. Du musst nur die Browser-Berechtigung erteilen.

---

## Lösung: Browser-Berechtigung erteilen

### Option 1: Direkt im Browser (Einfachste Methode)

1. **Öffne:** `http://10.55.55.155`
2. **Klicke auf das Schloss-Symbol** in der Adressleiste (links neben der URL)
3. **Klicke auf "Berechtigungen"** oder "Permissions"
4. **Bei "Mikrofon"** wähle: **"Erlauben"** oder **"Allow"**
5. **Lade die Seite neu** (F5 oder Cmd+R)

**Dann sollte es funktionieren!**

---

### Option 2: Browser-Einstellungen (Chrome)

1. **Chrome öffnen**
2. **Einstellungen** (Chrome → Einstellungen)
3. **Datenschutz und Sicherheit** → **Website-Einstellungen**
4. **Mikrofon** → **Erlauben** für `http://10.55.55.155`

---

### Option 3: Inkognito-Modus (Schnelltest)

1. **Öffne Inkognito-Fenster:** Cmd+Shift+N (Mac) oder Ctrl+Shift+N (Windows)
2. **Gehe zu:** `http://10.55.55.155`
3. **Klicke auf Voice Agent**
4. **Erlaube Mikrofon** (Browser fragt dich)

**Im Inkognito-Modus fragt der Browser immer nach Berechtigung.**

---

## Zusätzlich: Browser-Cache leeren

Falls es immer noch nicht funktioniert:

1. **Hard Reload:** Cmd+Shift+R (Mac) oder Ctrl+Shift+R (Windows)
2. **Oder:** Browser-Einstellungen → Datenschutz → **Cache leeren**

---

## Test: Prüfe ob API funktioniert

Öffne im Browser: `http://10.55.55.155/api/test-gemini-key`

**Erwartung:**
- ✅ `{"keyExists": true}` = API Key funktioniert
- ❌ `{"keyExists": false}` = API Key fehlt

---

## Zusammenfassung:

**Das Problem ist NICHT der Server** - es ist die Browser-Berechtigung!

**Lösung:**
1. ✅ Schloss-Symbol in Adressleiste → Mikrofon erlauben
2. ✅ Seite neu laden (F5)
3. ✅ Voice Agent testen

**Das sollte jetzt funktionieren!** 🎉
