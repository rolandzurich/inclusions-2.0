# Resend Newsletter-E-Mail Fix Checkliste

## Problem
Newsletter-Anmeldung sendet keine Bestätigungsmail und keine Notification an info@inclusions.zone

## Schritt-für-Schritt Lösung

### 1. ✅ Resend Dashboard prüfen

**Gehe zu:** https://resend.com/domains

**Prüfe:**
- [ ] Ist `inclusions.zone` als Domain hinzugefügt?
- [ ] Ist die Domain **verifiziert** (Status: "Verified" oder grüner Haken)?
- [ ] Wenn nicht verifiziert: DNS-Records hinzufügen (siehe unten)

### 2. ✅ DNS-Records für Domain-Verifizierung

Falls die Domain noch nicht verifiziert ist, füge diese DNS-Records hinzu:

**SPF Record:**
```
TXT @ "v=spf1 include:resend.com ~all"
```

**DKIM Records:**
- Resend zeigt dir im Dashboard die spezifischen DKIM-Records an
- Kopiere diese und füge sie als TXT-Records hinzu

**DMARC (optional, aber empfohlen):**
```
TXT _dmarc "v=DMARC1; p=none; rua=mailto:admin@inclusions.zone"
```

**Wichtig:** DNS-Änderungen können bis zu 48 Stunden dauern. Meistens geht es schneller (15-30 Minuten).

### 3. ✅ Resend API Key prüfen

**In Netlify:**
1. Gehe zu: Site settings → Environment variables
2. Prüfe: `RESEND_API_KEY` ist gesetzt
3. Format sollte sein: `re_...` (beginnt mit `re_`)

**Test-Endpoint aufrufen:**
```
https://inclusions.zone/api/debug-resend
```

Dies zeigt dir:
- Ob der API Key gesetzt ist
- Ob Resend korrekt initialisiert ist
- Die Konfiguration der E-Mail-Adressen

### 4. ✅ FROM-Email-Adresse verifizieren

**In Resend Dashboard:**
1. Gehe zu: https://resend.com/domains
2. Klicke auf `inclusions.zone`
3. Prüfe, ob `noreply@inclusions.zone` als verifizierte E-Mail-Adresse angezeigt wird
4. Falls nicht: Domain muss zuerst verifiziert sein (siehe Schritt 2)

### 5. ✅ Netlify Environment Variables prüfen

**Stelle sicher, dass diese Variablen gesetzt sind:**

```env
RESEND_API_KEY=re_an8y4Hrw_J5bcb33jndu9cb2avtyd87vB
RESEND_FROM_EMAIL=noreply@inclusions.zone
RESEND_ADMIN_EMAIL=info@inclusions.zone
```

**Nach Änderungen:** Redeploy in Netlify (oder warte auf automatischen Deploy)

### 6. ✅ Test-E-Mail senden

**Test-Endpoint:**
```
GET https://inclusions.zone/api/test-resend?email=deine-test-email@example.com
```

Dies sendet eine Test-E-Mail und zeigt dir:
- Ob der API Key funktioniert
- Ob die Domain verifiziert ist
- Eventuelle Fehlermeldungen

### 7. ✅ Netlify Function Logs prüfen

**In Netlify:**
1. Gehe zu: Site → Functions → Logs
2. Suche nach `/api/newsletter`
3. Prüfe auf Fehlermeldungen wie:
   - "Domain not verified"
   - "Invalid API key"
   - "Not authorized"

## Häufige Fehlermeldungen und Lösungen

### "Domain not verified" / "Not authorized"
**Lösung:** Domain in Resend Dashboard verifizieren (Schritt 1-2)

### "Invalid API key" / Status 401
**Lösung:** 
- API Key in Netlify prüfen
- Neuen API Key in Resend erstellen falls nötig
- In Netlify aktualisieren und redeploy

### E-Mails kommen im Spam an
**Lösung:**
- DMARC-Record hinzufügen (Schritt 2)
- SPF und DKIM prüfen
- Resend Dashboard zeigt Status der Records

### Keine Fehler, aber E-Mails kommen nicht an
**Lösung:**
- Prüfe Spam-Ordner
- Prüfe, ob die Empfänger-Adresse korrekt ist
- Prüfe Netlify Function Logs für Details

## Quick Check

```bash
# Test-Endpoint aufrufen (im Browser oder mit curl)
curl https://inclusions.zone/api/debug-resend

# Sollte zurückgeben:
# - resendIsNull: false
# - apiKeyValid: true
# - fromEmailSet: true
# - adminEmailSet: true
```

## Nach dem Fix

1. Teste Newsletter-Anmeldung auf der Live-Seite
2. Prüfe, ob Bestätigungsmail ankommt
3. Prüfe, ob Notification an info@inclusions.zone ankommt
4. Prüfe Netlify Logs für eventuelle Fehler
