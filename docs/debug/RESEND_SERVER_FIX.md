# Resend Newsletter-E-Mail Fix - Server Setup

## Problem
Newsletter-Anmeldung sendet keine Bestätigungsmail und keine Notification an info@inclusions.zone

## ✅ Domain ist verifiziert
Laut Screenshot ist `inclusions.zone` in Resend verifiziert:
- ✅ Domain Status: Verified
- ✅ DKIM: Verified  
- ✅ SPF: Verified
- ✅ Enable Sending: Aktiviert

## Prüfungen auf dem Server

### 1. Environment-Variablen prüfen

**Auf dem Server ausführen:**
```bash
ssh incluzone@10.55.55.155 "cd ~/inclusions-2.0 && cat .env | grep RESEND"
```

**Sollte zeigen:**
```env
RESEND_API_KEY=re_an8y4Hrw_J5bcb33jndu9cb2avtyd87vB
RESEND_FROM_EMAIL=noreply@inclusions.zone
RESEND_ADMIN_EMAIL=info@inclusions.zone
```

### 2. Automatische Diagnose ausführen

**Lokales Skript auf Server ausführen:**
```bash
# Vom lokalen Rechner aus:
./check-resend-server.sh | ssh incluzone@10.55.55.155 "bash"
```

**Oder direkt auf dem Server:**
```bash
ssh incluzone@10.55.55.155
cd ~/inclusions-2.0
bash check-resend-server.sh
```

### 3. Prüfe ob Next.js läuft

```bash
ssh incluzone@10.55.55.155 "pgrep -f 'next start'"
```

**Falls nicht läuft:**
```bash
ssh incluzone@10.55.55.155 "cd ~/inclusions-2.0 && npm start > /tmp/next.log 2>&1 &"
```

### 4. Prüfe ob Environment-Variablen geladen sind

**Wichtig:** Nach Änderungen an `.env` muss die App neu gestartet werden!

```bash
# Prüfe ob RESEND_API_KEY im Prozess geladen ist
ssh incluzone@10.55.55.155 "cat /proc/\$(pgrep -f 'next start' | head -1)/environ | grep RESEND_API_KEY"
```

**Falls nicht geladen:**
```bash
# App neu starten
ssh incluzone@10.55.55.155 "pkill -f 'next start' && cd ~/inclusions-2.0 && npm start > /tmp/next.log 2>&1 &"
```

### 5. Teste Resend API direkt

```bash
ssh incluzone@10.55.55.155 "cd ~/inclusions-2.0 && \
  RESEND_KEY=\$(grep '^RESEND_API_KEY=' .env | cut -d'=' -f2) && \
  curl -s -X GET 'https://api.resend.com/domains' \
    -H 'Authorization: Bearer '\$RESEND_KEY \
    -H 'Content-Type: application/json' | grep -i inclusions"
```

**Sollte `inclusions.zone` zurückgeben, wenn API Key korrekt ist.**

### 6. Teste Newsletter-API Endpoint

```bash
# Test-Endpoint aufrufen
curl https://inclusions.zone/api/debug-resend
```

**Sollte zeigen:**
- `resendIsNull: false`
- `apiKeyValid: true`
- `fromEmailSet: true`
- `adminEmailSet: true`

### 7. Prüfe Logs auf Fehler

```bash
ssh incluzone@10.55.55.155 "tail -50 /tmp/next.log | grep -iE '(resend|email|📧|❌)'"
```

**Häufige Fehler:**
- `Domain not verified` → Domain ist verifiziert, also nicht das Problem
- `Invalid API key` → API Key prüfen
- `Not authorized` → API Key oder Domain-Problem
- `Resend nicht konfiguriert` → RESEND_API_KEY nicht geladen

## Häufige Probleme und Lösungen

### Problem: Environment-Variablen werden nicht geladen

**Lösung:**
1. Prüfe `.env` Datei existiert: `ls -la ~/inclusions-2.0/.env`
2. Prüfe Format (keine Leerzeichen um `=`): `cat ~/inclusions-2.0/.env | grep RESEND`
3. **App neu starten** nach Änderungen:
   ```bash
   pkill -f 'next start'
   cd ~/inclusions-2.0
   npm start > /tmp/next.log 2>&1 &
   ```

### Problem: API Key ist ungültig

**Lösung:**
1. Prüfe Resend Dashboard: https://resend.com/api-keys
2. Erstelle neuen API Key falls nötig
3. Aktualisiere `.env` auf dem Server
4. App neu starten

### Problem: FROM-Email-Adresse nicht verifiziert

**Lösung:**
- Domain ist verifiziert → `noreply@inclusions.zone` sollte automatisch funktionieren
- Prüfe Resend Dashboard → Domains → inclusions.zone → sollte alle E-Mail-Adressen erlauben

### Problem: E-Mails kommen im Spam an

**Lösung:**
- Prüfe SPF/DKIM Records (sind verifiziert laut Screenshot)
- Prüfe DMARC Record (optional, aber empfohlen)

## Quick Fix Checkliste

- [ ] `.env` Datei existiert auf Server: `~/inclusions-2.0/.env`
- [ ] `RESEND_API_KEY` ist gesetzt und beginnt mit `re_`
- [ ] `RESEND_FROM_EMAIL=noreply@inclusions.zone`
- [ ] `RESEND_ADMIN_EMAIL=info@inclusions.zone`
- [ ] Next.js App läuft: `pgrep -f 'next start'`
- [ ] Environment-Variablen sind im Prozess geladen
- [ ] Domain ist in Resend verifiziert (✅ bereits erledigt)
- [ ] Test-Endpoint `/api/debug-resend` zeigt `resendIsNull: false`

## Nach dem Fix

1. Teste Newsletter-Anmeldung auf der Live-Seite
2. Prüfe Logs: `tail -f /tmp/next.log`
3. Prüfe Resend Dashboard: https://resend.com/emails (sollte versendete E-Mails zeigen)
