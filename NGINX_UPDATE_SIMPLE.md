# Einfache Anleitung: Nginx für öffentliche IP konfigurieren

## Öffentliche IP:
**82.192.247.193**

## Was zu tun ist:

### Option 1: Skript ausführen (einfachste Methode)

**Auf dem Server ausführen:**
```bash
cd ~/inclusions-2.0
./update-nginx-public.sh
```

Das Skript macht automatisch:
1. ✅ Erstellt Backup
2. ✅ Aktualisiert Nginx-Konfiguration
3. ✅ Prüft Konfiguration
4. ✅ Lädt Nginx neu
5. ✅ Öffnet Firewall (Port 80)

### Option 2: Manuell (falls Skript nicht funktioniert)

**1. Nginx-Konfiguration bearbeiten:**
```bash
sudo nano /etc/nginx/sites-available/inclusions
```

**2. Ändere diese Zeile:**
```
server_name 10.55.55.155 _;
```

**Zu:**
```
server_name 82.192.247.193 10.55.55.155 _;
```

**3. Speichern:** `Ctrl+O`, `Enter`, `Ctrl+X`

**4. Prüfen:**
```bash
sudo nginx -t
```

**5. Neu laden:**
```bash
sudo systemctl reload nginx
```

**6. Firewall öffnen (falls nötig):**
```bash
sudo ufw allow 80/tcp
```

## Nach der Konfiguration:

**Teste ohne VPN:**
- `http://82.192.247.193`

Die Seite sollte jetzt erreichbar sein!

## Zusammenfassung:

1. ✅ Öffentliche IP bekannt: `82.192.247.193`
2. ⏳ Nginx-Konfiguration aktualisieren (siehe oben)
3. ✅ Testen: `http://82.192.247.193`

**Führe einfach das Skript aus oder mache es manuell - dann sollte es wieder funktionieren wie gestern!**
