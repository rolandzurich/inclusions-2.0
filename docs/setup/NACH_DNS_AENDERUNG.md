# 📋 Nächste Schritte nach DNS-Änderung

## Schritt 1: DNS-Propagierung prüfen (15-60 Minuten warten)

### Online prüfen:
1. Öffne: https://dnschecker.org/#A/inclusions.zone
2. Warte, bis mehrere Server `10.55.55.155` zeigen
3. Oder: https://www.whatsmydns.net/#A/inclusions.zone

### Lokal prüfen:
```bash
# Auf deinem Mac
dig inclusions.zone
# oder
nslookup inclusions.zone
```

**Erwartetes Ergebnis:**
```
inclusions.zone.  IN  A  10.55.55.155
```

---

## Schritt 2: Nginx für Domain konfigurieren

### Auf dem Server:

```bash
ssh incluzone@10.55.55.155
cd ~/inclusions-2.0
```

### Nginx-Konfiguration aktualisieren:

```bash
# Kopiere die neue Konfiguration
sudo cp nginx-inclusions-domain.conf /etc/nginx/sites-available/inclusions-domain

# Erstelle Symlink (falls noch nicht vorhanden)
sudo ln -s /etc/nginx/sites-available/inclusions-domain /etc/nginx/sites-enabled/inclusions-domain

# Prüfe Konfiguration
sudo nginx -t

# Falls OK: Nginx neu laden
sudo systemctl reload nginx
```

**Falls die Datei nicht existiert, erstelle sie manuell:**

```bash
sudo nano /etc/nginx/sites-available/inclusions-domain
```

**Inhalt:**
```nginx
server {
    listen 80;
    server_name inclusions.zone www.inclusions.zone 10.55.55.155 _;

    access_log /var/log/nginx/inclusions-access.log;
    error_log /var/log/nginx/inclusions-error.log;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, immutable";
    }

    location /images {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 24h;
        add_header Cache-Control "public, max-age=86400";
    }
}
```

---

## Schritt 3: Website testen

Nach DNS-Propagierung (15-60 Minuten):

1. **Teste Hauptdomain:**
   ```
   http://inclusions.zone
   ```

2. **Teste www-Subdomain:**
   ```
   http://www.inclusions.zone
   ```

3. **Teste IP direkt (sollte auch funktionieren):**
   ```
   http://10.55.55.155
   ```

**Alle drei sollten die gleiche Website zeigen!**

---

## Schritt 4: Environment-Variable aktualisieren

Nach erfolgreichem Test:

```bash
# Auf Server
cd ~/inclusions-2.0
nano .env
```

**Ändere:**
```env
# Von:
NEXT_PUBLIC_SITE_URL=http://10.55.55.155

# Zu:
NEXT_PUBLIC_SITE_URL=http://inclusions.zone
```

**App neu starten:**
```bash
pkill -f 'next start'
npm start > /tmp/next.log 2>&1 &
```

---

## Schritt 5: SSL-Zertifikat installieren (HTTPS)

**WICHTIG:** Erst nach erfolgreichem HTTP-Test!

```bash
# Auf Server
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# SSL-Zertifikat installieren
sudo certbot --nginx -d inclusions.zone -d www.inclusions.zone
```

**Folge den Anweisungen:**
- E-Mail-Adresse eingeben
- Terms of Service akzeptieren
- Certbot konfiguriert Nginx automatisch

**Nach Installation:**
```bash
# Teste HTTPS
https://inclusions.zone
```

---

## Schritt 6: Environment-Variable auf HTTPS ändern

Nach SSL-Installation:

```bash
# Auf Server
cd ~/inclusions-2.0
nano .env
```

**Ändere:**
```env
# Von:
NEXT_PUBLIC_SITE_URL=http://inclusions.zone

# Zu:
NEXT_PUBLIC_SITE_URL=https://inclusions.zone
```

**App neu starten:**
```bash
pkill -f 'next start'
npm start > /tmp/next.log 2>&1 &
```

---

## Schritt 7: Resend Domain-Verifizierung

Nach HTTPS-Einrichtung:

1. **Gehe zu:** https://resend.com/domains
2. **Füge Domain hinzu:** `inclusions.zone`
3. **Füge DNS-Records hinzu** (werden angezeigt):
   - SPF Record (TXT @)
   - DKIM Records (TXT resend._domainkey)
   - DMARC Record (TXT _dmarc) - optional
4. **Warte auf Verifizierung** (kann einige Minuten dauern)
5. **Teste E-Mail-Versand** nach Verifizierung

---

## Checkliste

- [ ] DNS-Propagierung geprüft (dnschecker.org)
- [ ] Nginx für Domain konfiguriert
- [ ] Website testet: http://inclusions.zone
- [ ] NEXT_PUBLIC_SITE_URL auf http://inclusions.zone geändert
- [ ] SSL-Zertifikat installiert
- [ ] HTTPS testet: https://inclusions.zone
- [ ] NEXT_PUBLIC_SITE_URL auf https://inclusions.zone geändert
- [ ] Resend Domain-Verifizierung durchgeführt
- [ ] E-Mail-Versand getestet

---

## Troubleshooting

### Website lädt nicht:

```bash
# Prüfe DNS
dig inclusions.zone

# Prüfe Nginx
sudo nginx -t
sudo systemctl status nginx

# Prüfe Logs
sudo tail -f /var/log/nginx/error.log

# Prüfe ob Next.js läuft
ps aux | grep "next start"
```

### Nginx-Fehler:

```bash
# Prüfe Konfiguration
sudo nginx -t

# Prüfe ob Port 80 offen ist
sudo ufw status
sudo netstat -tulpn | grep :80
```

---

## Nächste Schritte

1. **Jetzt:** Warte 15-60 Minuten auf DNS-Propagierung
2. **Dann:** Prüfe DNS mit dnschecker.org
3. **Dann:** Konfiguriere Nginx (Schritt 2)
4. **Dann:** Teste Website (Schritt 3)
