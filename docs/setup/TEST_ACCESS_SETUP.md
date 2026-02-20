# Test-URL ohne VPN einrichten

## Ziel:
Die Seite soll ohne VPN erreichbar sein für Tests, BEVOR sie auf `inclusions.zone` läuft.

## Optionen:

### Option 1: Test-Subdomain (z.B. test.inclusions.zone)

**Schritte:**

1. **DNS A-Record erstellen:**
   - Gehe zu Domain-Provider
   - Erstelle A-Record:
     - Name: `test`
     - Typ: `A`
     - Wert: `[ÖFFENTLICHE_IP_DES_SERVERS]`
     - TTL: `3600`

2. **Öffentliche IP herausfinden:**
   ```bash
   curl ifconfig.me
   ```

3. **Nginx-Konfiguration anpassen:**
   ```bash
   sudo nano /etc/nginx/sites-available/inclusions
   ```
   
   Ändere zu:
   ```nginx
   server_name test.inclusions.zone 10.55.55.155 _;
   ```

4. **Nginx neu laden:**
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

5. **Testen:** `http://test.inclusions.zone` (ohne VPN)

### Option 2: Öffentliche IP direkt nutzen

**Wenn der Server eine öffentliche IP hat:**

1. **Öffentliche IP herausfinden:**
   ```bash
   curl ifconfig.me
   ```

2. **Nginx-Konfiguration:**
   ```nginx
   server_name [ÖFFENTLICHE_IP] 10.55.55.155 _;
   ```

3. **Firewall prüfen:**
   ```bash
   sudo ufw status
   sudo ufw allow 80/tcp
   ```

4. **Testen:** `http://[ÖFFENTLICHE_IP]` (ohne VPN)

### Option 3: Port-Weiterleitung prüfen

**Falls der Server hinter einem Router ist:**

1. Prüfe ob Port 80 im Router weitergeleitet wird
2. Router → Port 80 → Server (10.55.55.155)

## Was war gestern anders?

**Mögliche Ursachen:**
- Nginx-Konfiguration wurde geändert
- Firewall wurde geändert
- Server-IP hat sich geändert
- Port-Weiterleitung wurde entfernt

**Prüfen:**
```bash
# Auf dem Server:
curl ifconfig.me  # Öffentliche IP
sudo ufw status   # Firewall-Status
sudo nginx -t     # Nginx-Konfiguration prüfen
```

## Schnellste Lösung:

**Falls du die öffentliche IP kennst:**
1. Nginx-Konfiguration anpassen (siehe oben)
2. Firewall öffnen: `sudo ufw allow 80/tcp`
3. Nginx neu laden: `sudo systemctl reload nginx`
4. Testen ohne VPN

**Welche öffentliche IP hat dein Server?** Dann kann ich dir die genaue Konfiguration geben.
