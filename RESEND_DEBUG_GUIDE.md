# 🔍 Resend E-Mail-Problem - Debug-Anleitung

## Problem: E-Mails werden nicht versendet

Basierend auf deiner Beschreibung ("Vermutung, dass ich bei resend.com anpassen muss") ist die **wahrscheinlichste Ursache**:

### 🎯 Hauptverdacht: Domain nicht verifiziert (Hypothese H1)

Resend erfordert, dass die Domain `inclusions.zone` verifiziert ist, bevor E-Mails von `noreply@inclusions.zone` versendet werden können.

---

## ✅ Schnell-Check: Resend-Konfiguration prüfen

### Schritt 1: Debug-Endpoint aufrufen

**Auf dem Server:**
```bash
ssh incluzone@10.55.55.155
cd ~/inclusions-2.0

# Erstelle Debug-Endpoint-Verzeichnis
mkdir -p app/api/debug-resend

# Erstelle die Datei (kopiere den Inhalt von debug-resend-route.txt)
nano app/api/debug-resend/route.ts
```

**Dann im Browser öffnen:**
```
http://10.55.55.155/api/debug-resend
```

Dies zeigt dir:
- Ob RESEND_API_KEY gesetzt ist
- Ob Resend-Instanz erstellt wurde
- Alle Environment-Variablen

### Schritt 2: Resend-Dashboard prüfen

1. **Öffne:** https://resend.com/domains
2. **Prüfe:** Ist `inclusions.zone` verifiziert?
3. **Falls nicht:**
   - Klicke auf "Add Domain"
   - Füge `inclusions.zone` hinzu
   - Füge die DNS-Records hinzu (werden angezeigt):
     - SPF Record
     - DKIM Records (mehrere)
     - DMARC Record (optional)
   - Warte auf Verifizierung (kann einige Minuten bis Stunden dauern)

### Schritt 3: API-Key prüfen

1. **Öffne:** https://resend.com/api-keys
2. **Prüfe:** Ist der API-Key aktiv?
3. **Prüfe:** Stimmt der Key mit dem auf dem Server überein?

---

## 🔧 Häufigste Probleme und Lösungen

### Problem 1: Domain nicht verifiziert ✅ **WAHRSCHEINLICH**

**Symptome:**
- E-Mails werden nicht versendet
- Keine Fehler in Logs (oder nur generische Fehler)
- Resend-Dashboard zeigt keine versendeten E-Mails

**Lösung:**
1. Gehe zu https://resend.com/domains
2. Füge `inclusions.zone` hinzu
3. Füge DNS-Records hinzu:
   ```
   # SPF Record
   TXT @ "v=spf1 include:resend.com ~all"
   
   # DKIM Records (von Resend bereitgestellt)
   TXT resend._domainkey "..." (mehrere Records)
   
   # DMARC (optional)
   TXT _dmarc "v=DMARC1; p=none; rua=mailto:admin@inclusions.zone"
   ```
4. Warte auf Verifizierung
5. Teste erneut

### Problem 2: From-Email nicht verifiziert

**Symptome:**
- Domain ist verifiziert, aber E-Mails kommen nicht an
- Fehler: "From email address is not verified"

**Lösung:**
- Wenn die Domain verifiziert ist, sind alle E-Mail-Adressen dieser Domain automatisch verifiziert
- Falls nicht: Prüfe Domain-Verifizierung erneut

### Problem 3: API-Key ungültig

**Symptome:**
- Fehler: "Invalid API Key"
- Resend-Instanz ist null

**Lösung:**
1. Prüfe `.env` Datei auf Server:
   ```bash
   ssh incluzone@10.55.55.155
   cd ~/inclusions-2.0
   cat .env | grep RESEND_API_KEY
   ```
2. Vergleiche mit Resend-Dashboard
3. Falls unterschiedlich: Aktualisiere `.env` und starte App neu

### Problem 4: Environment-Variablen nicht geladen

**Symptome:**
- API-Key ist in `.env`, aber App verwendet ihn nicht
- Resend-Instanz ist null

**Lösung:**
```bash
# Auf Server
cd ~/inclusions-2.0
pkill -f 'next start'
npm start > /tmp/next.log 2>&1 &
```

---

## 📋 Checkliste

- [ ] Domain `inclusions.zone` in Resend verifiziert
- [ ] DNS-Records (SPF, DKIM) hinzugefügt
- [ ] DNS-Verifizierung abgeschlossen (Status: "Verified")
- [ ] API-Key in Resend-Dashboard aktiv
- [ ] API-Key auf Server korrekt gesetzt (`.env` Datei)
- [ ] App nach `.env` Änderung neu gestartet
- [ ] Debug-Endpoint aufgerufen (`/api/debug-resend`)
- [ ] Test-E-Mail versendet

---

## 🧪 Test nach Fix

Nach der Domain-Verifizierung:

1. **Test-Endpoint:**
   ```
   http://10.55.55.155/api/test-email?email=deine@email.com
   ```

2. **Newsletter-Anmeldung:**
   ```
   http://10.55.55.155/newsletter
   ```

3. **Prüfe Resend-Dashboard:**
   - https://resend.com/emails
   - Sollte versendete E-Mails zeigen

---

## 📞 Nächste Schritte

1. **Prüfe Resend-Dashboard** (https://resend.com/domains)
2. **Falls Domain nicht verifiziert:** Füge sie hinzu und warte auf Verifizierung
3. **Teste erneut** nach Verifizierung

**Wichtig:** Domain-Verifizierung kann einige Minuten bis Stunden dauern, je nach DNS-Propagierung.
