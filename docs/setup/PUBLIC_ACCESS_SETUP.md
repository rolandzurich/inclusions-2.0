# Seite ohne VPN erreichbar machen - Einfache Anleitung

## Problem:
Die Seite ist aktuell nur über VPN erreichbar, weil `10.55.55.155` eine private IP-Adresse ist.

## Lösung: Öffentliche Domain oder IP einrichten

### Option 1: Domain einrichten (Empfohlen)

**Was du brauchst:**
- Eine Domain (z.B. `inclusions.zone` oder `server.inclusions.zone`)
- DNS-Einstellungen anpassen

**Schritte:**

1. **Domain auf Server-IP zeigen lassen**
   - Gehe zu deinem Domain-Provider (z.B. wo du `inclusions.zone` gekauft hast)
   - Erstelle einen A-Record:
     - Name: `server` (oder `@` für Hauptdomain)
     - Typ: `A`
     - Wert: `[ÖFFENTLICHE_IP_DES_SERVERS]`
   - TTL: `3600` (1 Stunde)

2. **Öffentliche IP des Servers herausfinden**
   - Auf dem Server ausführen:
     ```bash
     curl ifconfig.me
     ```
   - Oder: Frag deinen Server-Provider nach der öffentlichen IP

3. **Nginx-Konfiguration anpassen**
   - Auf dem Server:
     ```bash
     sudo nano /etc/nginx/sites-available/inclusions
     ```
   - Ändere `server_name 10.55.55.155 _;` zu:
     ```nginx
     server_name server.inclusions.zone inclusions.zone;
     ```
   - Oder falls du die Hauptdomain nutzt:
     ```nginx
     server_name inclusions.zone www.inclusions.zone;
     ```

4. **Nginx neu laden**
   ```bash
   sudo nginx -t  # Prüft Konfiguration
   sudo systemctl reload nginx
   ```

5. **Firewall öffnen (falls nötig)**
   ```bash
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp  # Für HTTPS später
   ```

### Option 2: Öffentliche IP direkt nutzen

**Wenn der Server eine öffentliche IP hat:**

1. **Öffentliche IP herausfinden**
   ```bash
   curl ifconfig.me
   ```

2. **Nginx-Konfiguration anpassen**
   ```bash
   sudo nano /etc/nginx/sites-available/inclusions
   ```
   - Ändere `server_name` zu:
     ```nginx
     server_name [DEINE_ÖFFENTLICHE_IP] _;
     ```

3. **Firewall öffnen**
   ```bash
   sudo ufw allow 80/tcp
   ```

4. **Nginx neu laden**
   ```bash
   sudo systemctl reload nginx
   ```

### Option 3: Port-Weiterleitung (wenn Server hinter Router)

**Wenn der Server hinter einem Router ist:**

1. **Port-Weiterleitung im Router einrichten**
   - Port 80 → Server IP (10.55.55.155)
   - Port 443 → Server IP (für HTTPS später)

2. **Dann Option 1 oder 2 verwenden**

## Nach der Einrichtung:

**Testen:**
- Ohne VPN: `http://server.inclusions.zone` (oder deine Domain/IP)
- Sollte jetzt funktionieren!

## Wichtig für Produktion:

**HTTPS einrichten (später):**
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d server.inclusions.zone
```

## Welche Option passt zu dir?

- **Hast du eine Domain?** → Option 1
- **Hat der Server eine öffentliche IP?** → Option 2  
- **Server hinter Router?** → Option 3 + Option 1 oder 2

Sag mir, welche Situation auf dich zutrifft, dann gebe ich dir genauere Anweisungen!
