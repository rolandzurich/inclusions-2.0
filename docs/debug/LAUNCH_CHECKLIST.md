# 🚀 Production-Launch Checkliste

**Datum:** 26. Januar 2026  
**Server:** http://10.55.55.155

---

## ✅ Environment Variables - Status: ALLE KORREKT

### Geprüfte Variablen:

| Variable | Wert | Status | Verwendung |
|----------|------|--------|------------|
| `RESEND_API_KEY` | `re_an8y4Hrw_J5bcb33jndu9cb2avtyd87vB` | ✅ | E-Mail-Versand |
| `RESEND_FROM_EMAIL` | `noreply@inclusions.zone` | ✅ | Absender-E-Mail |
| `RESEND_ADMIN_EMAIL` | `info@inclusions.zone` | ✅ | Admin-Benachrichtigungen |
| `GEMINI_API_KEY` | `AIzaSyBzJoEimC2cpaNIibF103zrZaPSFWZWdWg` | ✅ | Voice Agent (INCLUSI) |
| `NEXT_PUBLIC_SITE_URL` | `http://10.55.55.155` | ✅ | Basis-URL (Server-IP) |

### Format-Prüfung:

- ✅ **RESEND_API_KEY**: Format korrekt (beginnt mit `re_`, Länge > 20 Zeichen)
- ✅ **GEMINI_API_KEY**: Format korrekt (beginnt mit `AIzaSy`, Länge > 30 Zeichen)
- ✅ **RESEND_FROM_EMAIL**: Domain korrekt (`@inclusions.zone`)
- ✅ **RESEND_ADMIN_EMAIL**: Domain korrekt (`@inclusions.zone`)

### Geprüfte Dateien:

- ✅ `.env.production` - Alle Variablen korrekt
- ✅ `.env.server` - Alle Variablen korrekt

---

## 🧪 Tests durchführen

### 1. API-Endpunkte testen

#### E-Mail-Funktionalität:
```bash
# Test-Endpoint aufrufen
curl "http://10.55.55.155/api/test-email?email=deine@email.com"
```

**Im Browser:**
```
http://10.55.55.155/api/test-email?email=deine@email.com
```

**Erwartetes Ergebnis:**
- Status: `success: true`
- Bestätigungs-E-Mail wird an die angegebene E-Mail gesendet
- Benachrichtigungs-E-Mail wird an `info@inclusions.zone` gesendet

#### Gemini API Key:
```bash
curl "http://10.55.55.155/api/test-gemini-key"
```

**Im Browser:**
```
http://10.55.55.155/api/test-gemini-key
```

**Erwartetes Ergebnis:**
```json
{
  "keyExists": true,
  "keyLength": 39,
  "keyPrefix": "AIzaSyBzJo..."
}
```

### 2. E-Mail-Funktionalität testen

#### Kontaktformular:
- ✅ Öffne: `http://10.55.55.155`
- ✅ Fülle das Kontaktformular aus
- ✅ Sende ab
- ✅ Prüfe E-Mail-Postfach (Bestätigung sollte ankommen)
- ✅ Prüfe `info@inclusions.zone` (Benachrichtigung sollte ankommen)

#### Buchungsformular:
- ✅ Öffne: `http://10.55.55.155/booking`
- ✅ Fülle das Formular aus
- ✅ Sende ab
- ✅ Prüfe E-Mail-Bestätigung

#### VIP-Anmeldung:
- ✅ Öffne: `http://10.55.55.155/anmeldung/vip`
- ✅ Fülle das Formular aus
- ✅ Sende ab
- ✅ Prüfe E-Mail-Bestätigung
- ✅ Prüfe Admin-Benachrichtigung

#### Newsletter-Anmeldung:
- ✅ Öffne: `http://10.55.55.155/newsletter`
- ✅ Fülle das Formular aus
- ✅ Sende ab
- ✅ Prüfe Bestätigungs-E-Mail
- ✅ Klicke auf Bestätigungs-Link
- ✅ Prüfe Willkommens-E-Mail

### 3. Voice Agent (INCLUSI) testen

- ✅ Öffne: `http://10.55.55.155`
- ✅ Klicke auf das Mikrofon-Symbol
- ✅ Stelle eine Frage (z.B. "Wann ist das nächste Event?")
- ✅ Prüfe, ob eine Antwort kommt
- ✅ Teste weitere Fragen:
  - "Wie kann ich mich anmelden?"
  - "Was ist INCLUSIONS?"
  - "Wo findet das Event statt?"

**Erwartetes Verhalten:**
- Mikrofon öffnet sich
- Frage wird erkannt
- Antwort kommt in einfacher Sprache (max. 2-3 Sätze)
- Antwort basiert auf Website-Daten

### 4. Server-Status prüfen

```bash
# Verbinde dich mit dem Server
ssh incluzone@10.55.55.155

# Prüfe ob die App läuft
ps aux | grep "next start"

# Prüfe die .env Datei
cd ~/inclusions-2.0
cat .env | grep -E "RESEND_API_KEY|GEMINI_API_KEY"

# Prüfe Logs (falls vorhanden)
tail -f /tmp/next.log
```

**Erwartetes Ergebnis:**
- Next.js-Prozess läuft
- Alle Environment-Variablen sind gesetzt
- Keine Fehler in den Logs

---

## ⚠️ WICHTIG: Für öffentlichen Launch

Wenn die Seite auf `https://inclusions.zone` läuft:

### 1. NEXT_PUBLIC_SITE_URL ändern

**In folgenden Dateien:**
- `.env.production`
- `.env.server`
- Server `.env` Datei (`~/inclusions-2.0/.env`)

**Von:** `http://10.55.55.155`  
**Zu:** `https://inclusions.zone`

### 2. HTTPS sicherstellen

- ✅ SSL/TLS-Zertifikat installiert (z.B. Let's Encrypt)
- ✅ Nginx/Reverse Proxy konfiguriert
- ✅ HTTP zu HTTPS Redirect eingerichtet

### 3. Domain-DNS prüfen

- ✅ A-Record zeigt auf Server-IP
- ✅ DNS-Propagierung abgeschlossen

---

## 📋 Vollständige Checkliste

### Environment Variables
- [x] RESEND_API_KEY gesetzt und korrekt
- [x] RESEND_FROM_EMAIL gesetzt und korrekt
- [x] RESEND_ADMIN_EMAIL gesetzt und korrekt
- [x] GEMINI_API_KEY gesetzt und korrekt
- [x] NEXT_PUBLIC_SITE_URL gesetzt und korrekt

### Tests
- [ ] E-Mail-Test-Endpoint funktioniert
- [ ] Gemini-Test-Endpoint funktioniert
- [ ] Kontaktformular sendet E-Mails
- [ ] Buchungsformular sendet E-Mails
- [ ] VIP-Anmeldung sendet E-Mails
- [ ] Newsletter-Anmeldung funktioniert
- [ ] Voice Agent (INCLUSI) funktioniert

### Server
- [ ] Next.js-App läuft auf Server
- [ ] Environment-Variablen auf Server gesetzt
- [ ] Keine Fehler in Server-Logs
- [ ] Server erreichbar unter http://10.55.55.155

### Für Launch
- [ ] Domain `inclusions.zone` konfiguriert
- [ ] SSL-Zertifikat installiert
- [ ] NEXT_PUBLIC_SITE_URL auf `https://inclusions.zone` geändert
- [ ] Alle Tests erfolgreich
- [ ] Performance getestet
- [ ] Mobile Ansicht getestet

---

## 🔧 Prüfskript ausführen

```bash
# Lokal prüfen
node check-production-env.js

# Auf Server prüfen
ssh incluzone@10.55.55.155 "cd ~/inclusions-2.0 && cat .env | grep -E 'RESEND_API_KEY|GEMINI_API_KEY|NEXT_PUBLIC_SITE_URL'"
```

---

## 📞 Support & Troubleshooting

### E-Mails kommen nicht an?
1. Prüfe Resend-Dashboard: https://resend.com/emails
2. Prüfe Spam-Ordner
3. Prüfe Server-Logs: `tail -f /tmp/next.log`
4. Teste mit `/api/test-email` Endpoint

### Voice Agent funktioniert nicht?
1. Prüfe Browser-Konsole (F12)
2. Prüfe Mikrofon-Berechtigung
3. Teste `/api/test-gemini-key` Endpoint
4. Prüfe Server-Logs

### App startet nicht?
1. Prüfe ob Node.js installiert ist: `node --version`
2. Prüfe ob npm installiert ist: `npm --version`
3. Installiere Dependencies: `npm install`
4. Starte App neu: `npm start`

---

**Letzte Aktualisierung:** 26. Januar 2026
