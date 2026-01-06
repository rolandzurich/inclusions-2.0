# Netlify Deployment Anleitung

## Vorbereitung

1. **Dependencies installieren:**
   ```bash
   npm install
   ```

2. **Umgebungsvariablen konfigurieren:**
   - Erstelle eine `.env` Datei basierend auf `.env.example`
   - Oder konfiguriere die Umgebungsvariablen direkt in Netlify:
     - `GEMINI_API_KEY`: Dein Google Gemini API Key

## Deployment auf Netlify

### Option 1: Via Netlify CLI (Empfohlen)

1. **Netlify CLI installieren:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login:**
   ```bash
   netlify login
   ```

3. **Deploy:**
   ```bash
   netlify deploy --prod
   ```

### Option 2: Via Git (Empfohlen für kontinuierliche Deployments)

1. **Repository zu GitHub/GitLab/Bitbucket pushen**

2. **In Netlify Dashboard:**
   - Neue Site erstellen
   - Git Repository verbinden
   - Build-Einstellungen:
     - Build command: `npm run build`
     - Publish directory: `.next`
   - Umgebungsvariablen hinzufügen:
     - `GEMINI_API_KEY`: Dein API Key
     - `RESEND_API_KEY`: Dein Resend API Key (falls verwendet)
     - Weitere benötigte Variablen

3. **Deploy starten** - Netlify baut automatisch bei jedem Push

4. **Preview-Deployments für Pull Requests aktivieren:**
   - Site settings → Build & deploy → Deploy contexts
   - "Deploy previews" aktivieren
   - Bei jedem Pull Request erstellt Netlify automatisch eine Preview-URL
   - Die Preview-URL erscheint als Kommentar im GitHub Pull Request

### Option 3: Manueller Upload (Drag & Drop)

**WICHTIG:** Für manuellen Upload müssen Sie zuerst lokal bauen:

```bash
npm install
npm run build
```

Dann können Sie das gesamte Projekt-Verzeichnis (ohne `node_modules` und `.next`) als ZIP hochladen. Netlify wird dann automatisch `npm install` und `npm run build` ausführen.

**Dateien die hochgeladen werden müssen:**
- Alle Source-Dateien (`app/`, `components/`, `lib/`, `public/`, etc.)
- `package.json` und `package-lock.json`
- `netlify.toml`
- `next.config.js`
- `tsconfig.json`
- `tailwind.config.js`
- `postcss.config.js`

**NICHT hochladen:**
- `node_modules/`
- `.next/`
- `.env` (Umgebungsvariablen in Netlify Dashboard setzen)
- `out/` (wird nicht benötigt)

## Wichtige Hinweise

- Die API-Routes (`/api/booking` und `/api/chat-gemini`) funktionieren nur mit dem `@netlify/plugin-nextjs` Plugin
- Stelle sicher, dass `GEMINI_API_KEY` in den Netlify Umgebungsvariablen gesetzt ist
- Nach dem ersten Deploy kann es 1-2 Minuten dauern, bis alles funktioniert

## Troubleshooting

- **API-Routes funktionieren nicht:** Überprüfe, ob `@netlify/plugin-nextjs` in `package.json` installiert ist
- **Build-Fehler:** Überprüfe die Build-Logs im Netlify Dashboard
- **Umgebungsvariablen:** Stelle sicher, dass alle benötigten Variablen im Netlify Dashboard gesetzt sind

