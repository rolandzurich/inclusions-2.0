# API Routes Fix - Schritt für Schritt

## Problem
Die API-Route `/api/debug-resend` gibt eine 404 zurück auf `https://inclusions.zone/api/debug-resend`

## Ursache
Die API-Route ist wahrscheinlich nicht im Build enthalten. Next.js muss neu gebaut werden.

## Lösung: App neu bauen

**Führe dieses Skript auf dem Server aus:**

```bash
cd ~/Curser/inclusions-2.0
cat rebuild-and-fix-api.sh | ssh incluzone@10.55.55.155 "bash"
```

**Oder direkt auf dem Server:**

```bash
ssh incluzone@10.55.55.155
cd ~/inclusions-2.0
bash rebuild-and-fix-api.sh
```

## Was das Skript macht:

1. ✅ Stoppt die laufende App
2. ✅ Prüft ob API-Route existiert
3. ✅ Löscht alten Build
4. ✅ Baut App neu (`npm run build`)
5. ✅ Prüft ob Route im Build enthalten ist
6. ✅ Startet App neu
7. ✅ Testet API lokal (localhost:3000)
8. ✅ Testet API über Domain (inclusions.zone)

## Nach dem Rebuild

1. **Teste API-Endpoint:**
   ```bash
   curl https://inclusions.zone/api/debug-resend
   ```
   Sollte JSON zurückgeben mit `resendIsNull: false`

2. **Teste Newsletter-Anmeldung:**
   - Gehe zu: https://inclusions.zone/newsletter
   - Fülle Formular aus
   - Prüfe ob Bestätigungsmail ankommt

3. **Prüfe Logs:**
   ```bash
   ssh incluzone@10.55.55.155 "tail -f /tmp/next.log"
   ```

## Falls es immer noch nicht funktioniert

1. **Prüfe Nginx-Konfiguration:**
   ```bash
   ssh incluzone@10.55.55.155 "sudo nginx -t"
   ssh incluzone@10.55.55.155 "sudo systemctl reload nginx"
   ```

2. **Prüfe ob Route wirklich im Build ist:**
   ```bash
   ssh incluzone@10.55.55.155 "ls -la ~/inclusions-2.0/.next/server/app/api/debug-resend/"
   ```

3. **Prüfe Next.js Konfiguration:**
   - `next.config.js` sollte keine speziellen Einstellungen haben, die API-Routes blockieren
