# 🔒 SSL/HTTPS Setup für inclusions.zone

## Port für SSL/HTTPS

**SSL/HTTPS verwendet Port 443** (Standard-Port für verschlüsselte Verbindungen)

Du musst den Port **nicht manuell eintragen** - Certbot (Let's Encrypt) konfiguriert das automatisch!

---

## SSL-Zertifikat installieren (Let's Encrypt)

### Schritt 1: Certbot installieren

**Auf dem Server:**

```bash
sudo apt-get update
sudo apt-get install -y certbot python3-certbot-nginx
```

### Schritt 2: SSL-Zertifikat installieren

```bash
sudo certbot --nginx -d inclusions.zone -d www.inclusions.zone
```

**Was passiert:**
- Certbot installiert automatisch das SSL-Zertifikat
- Certbot konfiguriert Nginx automatisch für Port 443 (HTTPS)
- Certbot erstellt automatisch HTTP → HTTPS Redirect
- Certbot erneuert das Zertifikat automatisch

**Du wirst gefragt:**
- E-Mail-Adresse (für Benachrichtigungen)
- Terms of Service akzeptieren
- HTTP → HTTPS Redirect? (Empfehlung: Ja)

### Schritt 3: Prüfe ob es funktioniert

```bash
# Prüfe Nginx-Konfiguration
sudo nginx -t

# Prüfe ob Port 443 offen ist
sudo netstat -tulpn | grep :443
# oder
sudo ss -tulpn | grep :443
```

### Schritt 4: Teste HTTPS

```
https://inclusions.zone
```

---

## Port-Konfiguration

**Port 443** wird automatisch von Certbot konfiguriert. Die Nginx-Konfiguration sieht dann so aus:

```nginx
server {
    listen 80;
    server_name inclusions.zone www.inclusions.zone;
    # HTTP → HTTPS Redirect (wird von Certbot hinzugefügt)
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;  # ← Port 443 für HTTPS
    server_name inclusions.zone www.inclusions.zone;
    
    ssl_certificate /etc/letsencrypt/live/inclusions.zone/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/inclusions.zone/privkey.pem;
    
    # ... Rest der Konfiguration
}
```

**Du musst das NICHT manuell machen** - Certbot macht das automatisch!

---

## Firewall prüfen (falls Port 443 blockiert)

```bash
# Prüfe Firewall-Status
sudo ufw status

# Falls Port 443 nicht offen ist:
sudo ufw allow 443/tcp
sudo ufw reload
```

---

## Zusammenfassung

- **Port für SSL/HTTPS:** 443 (Standard)
- **Du musst nichts manuell konfigurieren** - Certbot macht alles automatisch
- **Einfach ausführen:** `sudo certbot --nginx -d inclusions.zone -d www.inclusions.zone`

---

## Nach SSL-Installation

1. **Environment-Variable ändern:**
   ```bash
   cd ~/inclusions-2.0
   nano .env
   # Ändere: NEXT_PUBLIC_SITE_URL=https://inclusions.zone
   ```

2. **App neu starten:**
   ```bash
   pkill -f 'next start'
   npm start > /tmp/next.log 2>&1 &
   ```

3. **Teste:** https://inclusions.zone
