# Einfache Anleitung: Seite wieder auf 10.55.55.155 ohne VPN erreichbar machen

## Ziel:
Die Seite soll wieder wie gestern auf `http://10.55.55.155` ohne VPN erreichbar sein.

## Was zu tun ist:

### Auf dem Server ausführen:

**1. Skript ausführen (einfachste Methode):**
```bash
cd ~/inclusions-2.0
./check-server-access.sh
```

Das Skript prüft und korrigiert automatisch:
- ✅ Nginx-Konfiguration (server_name)
- ✅ Firewall (Port 80)
- ✅ Next.js App (läuft sie?)
- ✅ Lädt Nginx neu

### Oder manuell:

**1. Nginx-Konfiguration prüfen:**
```bash
sudo nano /etc/nginx/sites-available/inclusions
```

**Stelle sicher, dass diese Zeile so aussieht:**
```
server_name 10.55.55.155 _;
```

**2. Nginx neu laden:**
```bash
sudo nginx -t
sudo systemctl reload nginx
```

**3. Firewall prüfen:**
```bash
sudo ufw allow 80/tcp
sudo ufw status
```

**4. Next.js App prüfen:**
```bash
cd ~/inclusions-2.0
pkill -f "next start"
npm start > /tmp/next.log 2>&1 &
```

## Wichtig:

Da `10.55.55.155` eine private IP ist, muss das **Data-Center** sicherstellen, dass:
- ✅ Port 80 von außen auf `10.55.55.155:80` weitergeleitet wird (NAT/Port-Forwarding)
- ✅ Die Firewall im Data-Center Port 80 erlaubt

**Frage deinen Freund vom Data-Center:**
- "Ist Port 80 auf 10.55.55.155 von außen erreichbar?"
- "Wird Port 80 weitergeleitet?"

## Testen:

**Ohne VPN öffnen:**
- `http://10.55.55.155`

## Falls es nicht funktioniert:

1. **Prüfe Nginx-Logs:**
   ```bash
   sudo tail -f /var/log/nginx/inclusions-error.log
   ```

2. **Prüfe Next.js-Logs:**
   ```bash
   tail -f /tmp/next.log
   ```

3. **Prüfe ob die App läuft:**
   ```bash
   ps aux | grep "next start"
   ```

4. **Teste lokal auf dem Server:**
   ```bash
   curl http://localhost:3000
   ```

## Zusammenfassung:

1. ✅ Nginx-Konfiguration: `server_name 10.55.55.155 _;`
2. ✅ Firewall: Port 80 öffnen
3. ✅ Next.js App: Läuft sie?
4. ⏳ Data-Center: Port 80 weiterleiten (dein Freund muss das machen)

**Führe das Skript aus oder mache es manuell - dann sollte es wieder funktionieren wie gestern!**
