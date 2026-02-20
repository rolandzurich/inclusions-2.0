# Prüfung: Sind die API-Keys auf dem Server?

## Was benötigt wird:

### 1. RESEND_API_KEY
- **Für:** E-Mail-Versand (Newsletter, Kontaktformulare, VIP-Anmeldungen)
- **Sollte sein:** `re_an8y4Hrw_J5bcb33jndu9cb2avtyd87vB`

### 2. GEMINI_API_KEY  
- **Für:** Voice Agent (INCLUSI Chat-Features)
- **Sollte sein:** `AIzaSyBzJoEimC2cpaNIibF103zrZaPSFWZWdWg`

## So prüfst du es selbst:

```bash
# Verbinde dich mit dem Server
ssh incluzone@10.55.55.155

# Gehe ins Projekt-Verzeichnis
cd ~/inclusions-2.0

# Zeige die .env Datei
cat .env
```

**Du solltest sehen:**
```
NEXT_PUBLIC_SITE_URL=http://10.55.55.155

# E-Mail-Versand (Resend)
RESEND_API_KEY=re_an8y4Hrw_J5bcb33jndu9cb2avtyd87vB
RESEND_FROM_EMAIL=noreply@inclusions.zone
RESEND_ADMIN_EMAIL=info@inclusions.zone

# Chat-Features (Gemini)
GEMINI_API_KEY=AIzaSyBzJoEimC2cpaNIibF103zrZaPSFWZWdWg
```

## Falls die Keys fehlen:

**Option 1: Datei kopieren (wenn noch nicht gemacht)**
```bash
# Auf deinem Mac:
cd /Users/roland/Curser/inclusions-2.0
scp .env.server incluzone@10.55.55.155:~/inclusions-2.0/.env
```

**Option 2: Manuell hinzufügen**
```bash
ssh incluzone@10.55.55.155
cd ~/inclusions-2.0
nano .env
# Dann die Keys einfügen
```

## Nach dem Hinzufügen:

**App neu starten, damit die Keys geladen werden:**
```bash
ssh incluzone@10.55.55.155
cd ~/inclusions-2.0
pkill -f 'next start'
npm start > /tmp/next.log 2>&1 &
```

## Prüfen ob es funktioniert:

1. **Resend (E-Mail):** Teste ein Kontaktformular - sollte E-Mail versenden
2. **Gemini (Voice Agent):** Teste INCLUSI - sollte auf Fragen antworten
