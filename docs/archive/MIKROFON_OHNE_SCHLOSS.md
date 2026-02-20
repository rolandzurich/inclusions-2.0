# Voice Agent - Mikrofon-Berechtigung ohne Schloss-Symbol

## Problem: Kein Schloss-Symbol vorhanden

Das liegt daran, dass die Seite über **HTTP** läuft (nicht HTTPS). Bei HTTP-Seiten gibt es kein Schloss-Symbol.

**Kein Problem!** Es gibt andere Wege, die Mikrofon-Berechtigung zu erteilen.

---

## Lösung 1: Browser-Einstellungen (Chrome)

### Schritt-für-Schritt:

1. **Klicke auf die 3 Punkte** oben rechts im Browser (⋮)
2. **Einstellungen** → **Datenschutz und Sicherheit**
3. **Website-Einstellungen** → **Mikrofon**
4. **Unter "Nicht erlaubt"** findest du `http://10.55.55.155`
5. **Klicke darauf** → **"Erlauben"** wählen
6. **Seite neu laden** (F5)

---

## Lösung 2: Direkt über die Website-Liste

### Chrome:

1. **Klicke auf die 3 Punkte** (⋮) oben rechts
2. **Einstellungen**
3. **In der Suche eingeben:** "Mikrofon" oder "Microphone"
4. **Klicke auf:** "Website-Einstellungen" → "Mikrofon"
5. **Suche nach:** `10.55.55.155`
6. **Ändere zu:** "Erlauben"
7. **Seite neu laden**

---

## Lösung 3: Inkognito-Modus (Schnelltest)

**Das ist die einfachste Methode:**

1. **Öffne Inkognito-Fenster:** 
   - Mac: **Cmd+Shift+N**
   - Windows: **Ctrl+Shift+N**
2. **Gehe zu:** `http://10.55.55.155`
3. **Klicke auf Voice Agent**
4. **Browser fragt automatisch:** "Mikrofon-Zugriff erlauben?"
5. **Klicke:** "Erlauben"

**Im Inkognito-Modus fragt der Browser IMMER nach Berechtigung!**

---

## Lösung 4: Safari (falls du Safari verwendest)

1. **Safari** → **Einstellungen**
2. **Websites** → **Mikrofon**
3. **Suche nach:** `10.55.55.155`
4. **Wähle:** "Erlauben"
5. **Seite neu laden**

---

## Lösung 5: Firefox

1. **Klicke auf das Info-Symbol** (i) links in der Adressleiste
2. **Berechtigungen** → **Mikrofon**
3. **Wähle:** "Erlauben"
4. **Seite neu laden**

---

## Test: Prüfe ob es funktioniert

Nachdem du die Berechtigung erteilt hast:

1. **Lade die Seite neu:** F5 oder Cmd+R
2. **Klicke auf "Mit INCLUSI sprechen"**
3. **Falls Browser fragt:** "Erlauben" klicken
4. **Stelle eine Frage**, z.B. "Wann ist das nächste Event?"

**✅ Erwartung:** INCLUSI antwortet und spricht die Antwort vor.

---

## Falls es immer noch nicht funktioniert:

### Prüfe Browser-Konsole:

1. **Drücke F12** (oder Cmd+Option+I auf Mac)
2. **Klicke auf "Console" Tab**
3. **Suche nach Fehlermeldungen** (rot markiert)
4. **Sende mir die Fehlermeldung**, dann kann ich helfen

---

## Zusammenfassung:

**Kein Schloss-Symbol? Kein Problem!**

**Einfachste Lösung:**
1. ✅ **Inkognito-Modus öffnen** (Cmd+Shift+N)
2. ✅ **Gehe zu:** `http://10.55.55.155`
3. ✅ **Voice Agent klicken**
4. ✅ **Mikrofon erlauben** (Browser fragt automatisch)

**Das sollte funktionieren!** 🎉
