# Deployment: GitHub + Netlify

## ⚠️ WICHTIG: Gemini API Key – niemals auf GitHub

**Der `GEMINI_API_KEY` darf NIEMALS ins Git-Repository committen.**

- Wenn der Key öffentlich wird, blockiert Google ihn → **Voice Agent funktioniert nicht mehr**.
- `.env`, `.env.local`, `.env.local.backup` und alle `.env*.backup` sind in `.gitignore` und `.netlifyignore`.
- **Nur in Netlify** unter „Site settings → Environment variables“ eintragen – nie in einer Datei, die gepusht wird.

---

## 0. Lokale Entwicklung

- `.env.example` als Vorlage: nach `.env.local` kopieren und Werte eintragen.
- **`.env.local` nie committen** – enthält deinen echten `GEMINI_API_KEY` und andere Secrets.

---

## 1. Vor dem ersten Push: Prüfen, dass keine Keys im Repo sind

```bash
# Prüfen, ob noch env-Dateien mit Keys getrackt werden
git status
git ls-files '*.env*' '.env*'

# Sollte leer sein bzw. keine .env, .env.local, .env.local.backup listen.
# Falls .env.local.backup erscheint: git rm --cached .env.local.backup
```

- **Falls `.env.local.backup` oder `.env` je nach GitHub gepusht wurden:**  
  Key in der [Google AI Console](https://aistudio.google.com/apikey) **regenerieren** und den neuen Key nur in Netlify eintragen.

---

## 2. GitHub: Repository anlegen und pushen

1. **Neues Repo auf GitHub** (z.B. `inclusions-2.0`) anlegen, **ohne** README/ .gitignore (du hast sie schon).

2. **Remote hinzufügen und pushen:**
   ```bash
   git remote add origin https://github.com/DEIN-USER/inclusions-2.0.git
   git branch -M main
   git push -u origin main
   ```

3. **Nie pushen:** `.env`, `.env.local`, `.env.local.backup` – diese bleiben lokal.

---

## 3. Netlify: Site aus GitHub verbinden

1. **[Netlify](https://app.netlify.com)** → **Add new site** → **Import an existing project**.
2. **GitHub** wählen, Repo `inclusions-2.0` auswählen.
3. **Build-Einstellungen** (werden i.d.R. aus `netlify.toml` gelesen):
   - Build command: `npm run build`
   - Publish directory: `.next` (wird durch `@netlify/plugin-nextjs` korrekt genutzt)
   - `netlify.toml` und `@netlify/plugin-nextjs` beibehalten.

4. **Umgebungsvariablen (vor dem ersten Deploy setzen):**

   | Variable | Beschreibung | Geheim? |
   |----------|--------------|---------|
   | `GEMINI_API_KEY` | Google Gemini API Key (Voice Agent) | **Ja** – nur in Netlify |
   | `RESEND_API_KEY` | Resend API Key (E-Mail) | Ja |
   | `RESEND_FROM_EMAIL` | Absender (z.B. `noreply@inclusions.zone`) | Nein |
   | `RESEND_ADMIN_EMAIL` | Admin-E-Mail für Benachrichtigungen (z.B. `info@inclusions.zone`) | Nein |
   | `NEXT_PUBLIC_SITE_URL` | Produktions-URL, z.B. `https://inclusions.zone` | Nein |

   **Für Backend (DB), Admin-Bereich und Google-Sheets – unbedingt setzen:**

   | Variable | Beschreibung |
   |----------|--------------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase-Projekt-URL (z.B. `https://xxxx.supabase.co`) |
   | `SUPABASE_SERVICE_ROLE_KEY` | Service-Role-Key aus Supabase (Project Settings → API) |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon-Key (für Auth/RLS) |

   Ohne diese werden **keine** Formulareinträge (VIP, Buchung, Newsletter) in der Datenbank gespeichert. Der Fallback „direkte DB“ funktioniert nur lokal, nicht auf Netlify.

   **Für Google-Sheets-Automation (optional, nach DB):**

   | Variable | Beschreibung |
   |----------|--------------|
   | `GOOGLE_SHEETS_CREDENTIALS` | JSON-String der Service-Account-Credentials |
   | `GOOGLE_SHEET_CONTACT_REQUESTS` | Spreadsheet-ID für Buchungs-/Kontaktanfragen |
   | `GOOGLE_SHEET_NEWSLETTER` | Spreadsheet-ID für Newsletter |
   | `GOOGLE_SHEET_VIP` | Spreadsheet-ID für VIP-Anmeldungen |

   Optional, falls genutzt:

   - `NEXT_PUBLIC_UMAMI_URL`, `NEXT_PUBLIC_UMAMI_WEBSITE_ID`
   - `NEXT_PUBLIC_AGENT_DEBUG` = `1` nur zum Debuggen, in Produktion weglassen.

5. **Deploy starten** – Netlify baut bei jedem Push auf `main` automatisch.

---

## 4. Nach dem Deploy

- **Voice Agent:** Funktioniert nur, wenn `GEMINI_API_KEY` in Netlify gesetzt ist (nicht in einer Datei im Repo).
- **API-Routen** (`/api/chat-gemini`, `/api/contact`, `/api/newsletter`, `/api/vip`, etc.) laufen über `@netlify/plugin-nextjs`.
- Es kann 1–2 Minuten dauern, bis nach dem ersten Deploy alles erreichbar ist.

---

## 5. Kontinuierliche Deployments

- Jeder **Push auf `main`** löst einen neuen Production-Deploy aus.
- **Deploy Previews:** In Netlify unter „Site settings → Build & deploy → Deploy contexts“ aktivieren → bei Pull Requests entsteht eine Preview-URL.

---

## 6. Alternative: Netlify CLI (ohne GitHub)

Falls du nur manuell deployen willst:

```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

Auch hier: **`GEMINI_API_KEY` und alle Secrets nur in Netlify unter Environment variables setzen**, nie in Projektdateien, die hochgeladen oder committed werden.

---

## Troubleshooting

| Problem | Lösung |
|--------|--------|
| Voice Agent / „GEMINI_API_KEY ist nicht konfiguriert“ | Key in Netlify unter Environment variables setzen, Redeploy. Key darf nicht im Repo stehen. |
| „API key not valid“ / Key gesperrt | Key war vermutlich öffentlich. Neuen Key in Google AI Studio erzeugen und nur in Netlify eintragen. |
| API-Routen 404 | `@netlify/plugin-nextjs` in `package.json` prüfen; Build-Command `npm run build` und `netlify.toml` verwenden. |
| Build schlägt fehl | Build-Logs in Netlify prüfen; `npm run build` lokal testen. |
| **Buchung/Newsletter: Keine Bestätigungs-Mail, keine Notification** | `RESEND_API_KEY` und `RESEND_FROM_EMAIL` prüfen. Domain in Resend verifizieren. Nach Code-Deploy: E-Mail-Promises werden nun mit `await` abgewartet (ohne das endet die Serverless-Funktion, bevor E-Mails gesendet sind). |
| **VIP: Bestätigung kommt, Notification an info@ nicht** | `RESEND_ADMIN_EMAIL=info@inclusions.zone` setzen. Resend-Dashboard und Netlify-Function-Logs prüfen (ob Fehler beim Senden an info@). Spam/Postfach prüfen. |
| **Einträge erscheinen nicht im Backend / in der DB** | `NEXT_PUBLIC_SUPABASE_URL` und `SUPABASE_SERVICE_ROLE_KEY` **müssen** in Netlify gesetzt sein. Ohne sie ist `supabaseAdmin` leer, und der DB-Fallback funktioniert in Production nicht. Nach Änderung: Redeploy. |
| **Keine Einträge in Google Sheets** | Erst DB prüfen (s. o.). Sheets-Export läuft nur nach erfolgreichem DB-Insert. Dann: `GOOGLE_SHEETS_CREDENTIALS` (JSON) sowie `GOOGLE_SHEET_CONTACT_REQUESTS`, `GOOGLE_SHEET_NEWSLETTER`, `GOOGLE_SHEET_VIP` setzen. |

---

## Kurz-Checkliste vor jedem Push

- [ ] Keine `.env`, `.env.local`, `.env.local.backup` (oder andere mit Keys) im Commit.
- [ ] `GEMINI_API_KEY` nur in Netlify hinterlegt, nirgends im Code oder in Dateien im Repo.
