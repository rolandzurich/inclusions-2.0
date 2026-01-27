# Einfache Anleitung: Seite ohne VPN erreichbar machen

## Problem:
Die Seite ist nur über VPN erreichbar, aber du möchtest sie ohne VPN testen können.

## Lösung: Einfaches Skript ausführen

**Auf dem Server ausführen:**
```bash
cd ~/inclusions-2.0
./setup-public-access.sh
```

**Oder falls das Skript nicht auf dem Server ist:**
```bash
# Kopiere es zuerst auf den Server, dann:
chmod +x setup-public-access.sh
./setup-public-access.sh
```

Das Skript macht automatisch:
1. ✅ Findet öffentliche IP heraus
2. ✅ Aktualisiert Nginx-Konfiguration
3. ✅ Öffnet Firewall (Port 80)
4. ✅ Lädt Nginx neu

**Danach:** Die Seite ist erreichbar unter `http://[ÖFFENTLICHE_IP]` (ohne VPN)

## Manuell (falls Skript nicht funktioniert):

**1. Öffentliche IP herausfinden:**
```bash
curl ifconfig.me
```

**2. Nginx-Konfiguration anpassen:**
```bash
sudo nano /etc/nginx/sites-available/inclusions
```

**Ändere:**
```
server_name 10.55.55.155 _;
```

**Zu:**
```
server_name [DEINE_ÖFFENTLICHE_IP] 10.55.55.155 _;
```

**3. Nginx neu laden:**
```bash
sudo nginx -t
sudo systemctl reload nginx
```

**4. Firewall öffnen:**
```bash
sudo ufw allow 80/tcp
```

**5. Testen:** `http://[DEINE_ÖFFENTLICHE_IP]` (ohne VPN)

## Was war gestern anders?

Möglicherweise:
- Nginx wurde neu gestartet und hat alte Konfiguration geladen
- Firewall wurde zurückgesetzt
- Server-IP hat sich geändert

Das Skript stellt alles wieder her!
