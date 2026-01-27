# Einfache Anleitung: Server konfigurieren

## Du musst nichts selbst machen - nur 2 Schritte:

### Schritt 1: Auf dem Server einloggen
**Wenn du noch nicht eingeloggt bist:**
- Öffne Terminal
- Verbinde dich mit dem VPN (Tunnelblick)
- Logge dich ein: `ssh incluzone@10.55.55.155`
- Passwort eingeben: `13vor12!Asdf`

### Schritt 2: Dieses eine Kommando ausführen

**Kopiere und füge ein:**

```bash
cd ~/inclusions-2.0 && curl -s https://raw.githubusercontent.com/your-repo/inclusions-2.0/main/server-setup-simple.sh | bash
```

**ODER (wenn du das Skript bereits hast):**

```bash
cd ~/inclusions-2.0
bash server-setup-simple.sh
```

**ODER (noch einfacher - alles in einem Befehl):**

```bash
cd ~/inclusions-2.0 && sudo sed -i 's/server_name .*/server_name 10.55.55.155 _;/' /etc/nginx/sites-available/inclusions && sudo nginx -t && sudo systemctl reload nginx && sudo ufw allow 80/tcp 2>/dev/null && pgrep -f "next start" > /dev/null || (pkill -f "next start" 2>/dev/null; npm start > /tmp/next.log 2>&1 &) && echo "✅ Fertig! Teste: http://10.55.55.155"
```

## Das war's!

Das Skript macht automatisch:
- ✅ Nginx-Konfiguration aktualisieren
- ✅ Nginx neu laden
- ✅ Firewall öffnen
- ✅ Next.js App prüfen/starten

**Danach einfach testen:** `http://10.55.55.155` (ohne VPN)
