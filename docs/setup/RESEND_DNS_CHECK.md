# Resend DNS-Konfiguration prüfen

## ✅ Domain Status (aus Screenshot)
- **Domain:** inclusions.zone
- **Status:** Verified ✅
- **DKIM:** Verified ✅
- **SPF:** Verified ✅
- **Enable Sending:** Aktiviert ✅

## DNS-Records die vorhanden sein sollten

### 1. Domain Verification (DKIM)
```
TXT resend._domainkey inclusions.zone
```
**Status:** ✅ Verified (laut Screenshot)

### 2. Enable Sending (SPF)
```
TXT send inclusions.zone
v=spf1 include:amazonses.com ~all
```
**Status:** ✅ Verified (laut Screenshot)

### 3. MX Record (für Sending)
```
MX send inclusions.zone
feedback-smtp.eu-west-1.amazonses.com (Priority: 10)
```
**Status:** ✅ Verified (laut Screenshot)

## Was noch geprüft werden muss

### 1. FROM-Email-Adresse prüfen

**In Resend Dashboard:**
1. Gehe zu: https://resend.com/domains
2. Klicke auf `inclusions.zone`
3. Prüfe unter "Verified Email Addresses" oder "Senders":
   - Ist `noreply@inclusions.zone` als verifizierte E-Mail-Adresse aufgelistet?
   - Falls nicht: Bei verifizierter Domain sollten alle `@inclusions.zone` Adressen automatisch funktionieren

**Wichtig:** Bei verifizierter Domain sollten **alle** E-Mail-Adressen der Domain (`*@inclusions.zone`) funktionieren, ohne dass jede einzeln verifiziert werden muss.

### 2. API Key Berechtigungen prüfen

**In Resend Dashboard:**
1. Gehe zu: https://resend.com/api-keys
2. Prüfe den API Key `re_an8y4Hrw_J5bcb33jndu9cb2avtyd87vB`:
   - Ist er aktiv?
   - Hat er Berechtigung für `inclusions.zone`?
   - Ist er nicht abgelaufen?

### 3. E-Mail-Logs prüfen

**In Resend Dashboard:**
1. Gehe zu: https://resend.com/emails
2. Prüfe ob Newsletter-E-Mails versucht wurden zu senden:
   - Falls ja: Prüfe Status (delivered, bounced, failed)
   - Falls nein: Problem liegt im Code/Server-Konfiguration

### 4. Domain-Region prüfen

**Aus Screenshot:** Region ist `Ireland (eu-west-1)`

**Prüfe:**
- Ist die Region korrekt für deinen Use-Case?
- Falls Probleme: Region kann in Resend Dashboard geändert werden

## Häufige DNS-Probleme (obwohl Domain verifiziert ist)

### Problem: FROM-Adresse wird nicht akzeptiert

**Symptom:** 
- Domain ist verifiziert
- Aber E-Mails mit `from: noreply@inclusions.zone` schlagen fehl

**Lösung:**
1. Prüfe ob `noreply@inclusions.zone` explizit als Sender hinzugefügt werden muss
2. In Resend Dashboard → Domains → inclusions.zone → "Add Email Address"
3. Oder: Verwende eine andere FROM-Adresse die definitiv funktioniert (z.B. `newsletter@inclusions.zone`)

### Problem: API Key hat keine Berechtigung für Domain

**Symptom:**
- API Key ist gültig
- Aber E-Mails schlagen mit "Not authorized" fehl

**Lösung:**
1. Prüfe API Key Berechtigungen in Resend Dashboard
2. Erstelle neuen API Key falls nötig
3. Stelle sicher, dass API Key für `inclusions.zone` berechtigt ist

### Problem: Region-Mismatch

**Symptom:**
- Domain ist verifiziert
- Aber E-Mails kommen nicht an oder werden verzögert

**Lösung:**
- Prüfe ob Region korrekt ist (eu-west-1 für Europa)
- Falls nötig: Region in Resend Dashboard ändern

## Quick Check Commands

### Prüfe DNS-Records extern
```bash
# DKIM Record prüfen
dig TXT resend._domainkey.inclusions.zone

# SPF Record prüfen  
dig TXT send.inclusions.zone

# MX Record prüfen
dig MX send.inclusions.zone
```

### Prüfe Resend API direkt
```bash
# Domain-Status prüfen
curl -X GET "https://api.resend.com/domains" \
  -H "Authorization: Bearer re_an8y4Hrw_J5bcb33jndu9cb2avtyd87vB" \
  -H "Content-Type: application/json" | jq '.data[] | select(.name=="inclusions.zone")'
```

## Nächste Schritte

1. ✅ Domain ist verifiziert (bereits erledigt)
2. ⏭️ Prüfe FROM-Adresse in Resend Dashboard
3. ⏭️ Prüfe API Key Berechtigungen
4. ⏭️ Prüfe E-Mail-Logs in Resend Dashboard
5. ⏭️ Teste Newsletter-Anmeldung und prüfe Logs

## Wichtigste Erkenntnis

**Domain ist verifiziert** → Das Problem liegt wahrscheinlich **nicht** an der DNS-Konfiguration, sondern an:
- Server-Konfiguration (Environment-Variablen nicht geladen)
- API Key Berechtigungen
- FROM-Adresse Konfiguration
- Code-Problem (E-Mails werden nicht versendet)

**Fokus sollte auf Server-Konfiguration liegen!**
