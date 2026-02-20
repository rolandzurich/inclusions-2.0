# Voice Agent Fehler-Diagnose

## Problem: "not-allowed" obwohl Mikrofon-Zugriff normalerweise funktioniert

Wenn du bisher immer Zugriff hattest, ist das Problem wahrscheinlich **NICHT** die Browser-Berechtigung.

---

## Schritt 1: Browser-Konsole prüfen (WICHTIG!)

**Das zeigt uns den echten Fehler:**

1. **Öffne:** `http://10.55.55.155`
2. **Drücke F12** (oder Cmd+Option+I auf Mac)
3. **Klicke auf "Console" Tab**
4. **Klicke auf Voice Agent Button**
5. **Suche nach roten Fehlermeldungen**

**Sende mir die Fehlermeldungen**, dann kann ich das Problem genau identifizieren.

---

## Schritt 2: Prüfe ob API funktioniert

**Öffne im Browser:** `http://10.55.55.155/api/test-gemini-key`

**Erwartung:**
- ✅ `{"keyExists": true, "keyLength": 39}` = API Key funktioniert
- ❌ `{"keyExists": false}` = API Key fehlt auf Server

**Falls `keyExists: false`:**
- Die Environment Variables wurden nicht korrekt kopiert
- Die App wurde nicht neu gestartet

---

## Schritt 3: Prüfe ob App läuft

**Falls du auf dem Server eingeloggt bist:**

```bash
pgrep -f 'next start'
```

**Sollte eine Zahl ausgeben** (z.B. `12345`). Falls nicht, läuft die App nicht.

---

## Mögliche Ursachen:

1. **App wurde nicht neu gestartet** nach dem Kopieren der Environment Variables
2. **Environment Variables wurden nicht korrekt kopiert**
3. **API Key ist ungültig oder gesperrt**
4. **Code-Fehler** in der Voice Agent Komponente

---

## Nächste Schritte:

**Bitte mache:**

1. ✅ **Browser-Konsole öffnen** (F12) → Console Tab
2. ✅ **Voice Agent klicken**
3. ✅ **Fehlermeldungen kopieren** und mir senden
4. ✅ **Test-API öffnen:** `http://10.55.55.155/api/test-gemini-key`
5. ✅ **Ergebnis senden**

**Dann kann ich das Problem genau identifizieren und beheben!**
