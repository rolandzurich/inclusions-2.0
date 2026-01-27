# Zusammenfassung: Environment-Variablen & Datenbank

## ✅ Was du brauchst:

### 1. E-Mail-Versand (RESEND_API_KEY)
**Status:** ❌ Noch nicht gesetzt  
**Was:** API-Key von Resend.com  
**Wo holen:** https://resend.com/api-keys  
**Wichtig:** Formulare funktionieren ohne, aber keine E-Mails werden versendet

### 2. Chat-Features (GEMINI_API_KEY)
**Status:** ❌ Noch nicht gesetzt  
**Was:** Google Gemini API-Key für INCLUSI Chat-Feature  
**Wo holen:** https://aistudio.google.com/app/apikey  
**Wichtig:** Chat-Feature (INCLUSI) funktioniert ohne nicht

### 3. Analytics (Umami) - Optional, aber empfohlen
**Status:** ❌ Noch nicht gesetzt  
**Was:** Selbst-gehostete Analytics-Lösung  
**Dashboard:** http://10.55.55.155:3002 (nach Start)  
**Mehr Infos:** Siehe `UMAMI_INFO.md`

## 📊 Umami Analytics - Kurzinfo:

**Was ist Umami?**
- Privacy-freundliche, selbst-gehostete Analytics (Alternative zu Google Analytics)
- DSGVO-konform, keine Cookies, anonymisiert
- Daten bleiben auf deinem Server

**Dashboard:**
- Eigenes Web-Dashboard unter `http://10.55.55.155:3002`
- Zeigt: Pageviews, Besucher, Länder, Referrer, Browser, etc.
- Echtzeit-Daten, Custom Events (Formular-Submits)

**Einrichtung:**
1. Umami via Docker starten (docker-compose.yml vorhanden)
2. Website im Dashboard registrieren
3. Website-ID kopieren
4. Environment-Variablen setzen

**Sinnvoll?** ✅ **Ja!**
- Privacy-freundlich passt zu deiner Mission
- Du behältst Kontrolle über Daten
- Einfache Einrichtung

## 🗄️ Datenbank auf dem Server:

**Aktueller Status:**
- Docker-Container laufen nicht
- `docker-compose.yml` vorhanden mit:
  - PostgreSQL (Supabase)
  - Umami (mit eigener PostgreSQL-DB)

**Optionen:**

### Option 1: PostgreSQL direkt verwenden (ohne Supabase)
- Einfache PostgreSQL-Datenbank
- Direkter Zugriff via `lib/db-direct.ts`
- Keine Supabase-Abhängigkeit

### Option 2: Supabase weiter nutzen
- Vollständiges Supabase-Setup (Auth, REST API, etc.)
- Du sagtest: "Supabase werde ich nicht mehr brauchen"

### Option 3: SQLite (einfachste Lösung)
- Keine Docker-Container nötig
- Datei-basiert
- Für kleinere Projekte ausreichend

**Empfehlung:** Option 1 (PostgreSQL direkt) - einfacher, ohne Supabase-Overhead

## 🔧 Nächste Schritte:

1. **API-Keys hinzufügen:**
   ```bash
   # Auf dem Server .env erweitern:
   RESEND_API_KEY=dein-resend-key
   GEMINI_API_KEY=dein-gemini-key
   ```

2. **Umami starten (optional):**
   ```bash
   cd ~/inclusions-2.0/backend
   docker-compose up -d umami umami-db
   ```

3. **Datenbank einrichten:**
   - Entscheide: PostgreSQL direkt oder SQLite?
   - Docker-Container starten falls PostgreSQL

## 📝 Fragen:

1. **Hast du bereits Resend API-Key?** → Dann können wir ihn direkt hinzufügen
2. **Hast du bereits Gemini API-Key?** → Dann können wir ihn direkt hinzufügen
3. **Welche Datenbank möchtest du?** → PostgreSQL direkt oder SQLite?
