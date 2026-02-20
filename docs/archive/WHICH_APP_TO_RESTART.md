# Welche App muss neu gestartet werden?

## Die Next.js App auf dem Server

**Was ist das?**
- Die inclusions-2.0 Website, die auf `http://10.55.55.155` läuft
- Läuft als `next start` Prozess auf dem Server
- Port 3000 (hinter Nginx auf Port 80)

**Warum neu starten?**
- Environment-Variablen werden beim Start geladen
- Neue Variablen (RESEND_API_KEY, GEMINI_API_KEY) werden erst nach Neustart erkannt
- Ohne Neustart funktionieren E-Mail und Chat-Features nicht

**Wie prüfe ich, ob die App läuft?**
```bash
ssh incluzone@10.55.55.155
ps aux | grep "next start"
```

**Wie starte ich die App neu?**
```bash
ssh incluzone@10.55.55.155
cd ~/inclusions-2.0
pkill -f 'next start'      # Stoppe alte App
npm start > /tmp/next.log 2>&1 &  # Starte neu im Hintergrund
```

**Oder ich mache es für dich:**
Sag einfach Bescheid, wenn die .env Datei kopiert ist, dann starte ich die App automatisch neu.
