# 🌐 Domain-Umleitung: inclusions.zone → 10.55.55.155

## DNS-Konfiguration bei green.ch

### Schritt 1: Bei green.ch einloggen

1. Gehe zu https://www.green.ch
2. Logge dich in dein Kundenkonto ein
3. Gehe zu "Domain-Verwaltung" oder "DNS-Verwaltung"
4. Wähle die Domain `inclusions.zone`

---

## Schritt 2: DNS-Records erstellen

### A-Record für Hauptdomain (Pflicht)

**Eintrag:**
- **Typ:** `A`
- **Name/Host:** `@` oder leer lassen (bedeutet: Hauptdomain)
- **Wert/IP:** `10.55.55.155`
- **TTL:** `3600` (1 Stunde) oder Standard

**Ergebnis:** `inclusions.zone` → `10.55.55.155`

### A-Record für www-Subdomain (Empfohlen)

**Eintrag:**
- **Typ:** `A`
- **Name/Host:** `www`
- **Wert/IP:** `10.55.55.155`
- **TTL:** `3600` (1 Stunde) oder Standard

**Ergebnis:** `www.inclusions.zone` → `10.55.55.155`

**ODER alternativ CNAME:**
- **Typ:** `CNAME`
- **Name/Host:** `www`
- **Wert:** `inclusions.zone`
- **TTL:** `3600`

---

## Schritt 3: Bestehende Einträge prüfen

**WICHTIG:** Prüfe, ob es bereits Einträge gibt, die überschrieben werden müssen:

1. **A-Record** für `@` oder leer → sollte auf `10.55.55.155` zeigen
2. **CNAME** für `www` → sollte auf `inclusions.zone` zeigen oder direkt auf IP
3. **MX-Records** → Falls E-Mail über die Domain läuft, diese NICHT löschen!

---

## Schritt 4: DNS-Propagierung abwarten

Nach dem Speichern der DNS-Einträge:
- **DNS-Propagierung:** Kann 5 Minuten bis 48 Stunden dauern (meist 15-60 Minuten)
- **Prüfen:** Verwende https://dnschecker.org oder `dig inclusions.zone`

---

## Schritt 5: Testen

### DNS-Propagierung prüfen:

```bash
# Auf deinem Mac
dig inclusions.zone
# oder
nslookup inclusions.zone

# Sollte zeigen:
# inclusions.zone.  IN  A  10.55.55.155
```

**Online-Tools:**
- https://dnschecker.org/#A/inclusions.zone
- https://www.whatsmydns.net/#A/inclusions.zone

### Website testen:

Nach DNS-Propagierung:
```
http://inclusions.zone
```

**Sollte auf:** `http://10.55.55.155` zeigen

---

## Schritt 6: Nginx/Server konfigurieren

### Auf dem Server (10.55.55.155):

Der Server muss so konfiguriert sein, dass er Anfragen für `inclusions.zone` akzeptiert:

**Nginx-Konfiguration (Beispiel):**

```nginx
server {
    listen 80;
    server_name inclusions.zone www.inclusions.zone;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Prüfen:**
```bash
ssh incluzone@10.55.55.155
sudo nginx -t  # Prüft Konfiguration
sudo systemctl reload nginx  # Lädt Konfiguration neu
```

---

## Schritt 7: HTTPS einrichten (später)

Nach erfolgreicher DNS-Umleitung:

1. **SSL-Zertifikat installieren** (Let's Encrypt):
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d inclusions.zone -d www.inclusions.zone
   ```

2. **NEXT_PUBLIC_SITE_URL aktualisieren:**
   ```env
   NEXT_PUBLIC_SITE_URL=https://inclusions.zone
   ```

---

## Schritt 8: E-Mail-DNS-Records (für Resend)

**WICHTIG:** Nach der Domain-Umleitung musst du auch DNS-Records für E-Mail hinzufügen:

### SPF Record:
- **Typ:** `TXT`
- **Name/Host:** `@` oder leer
- **Wert:** `v=spf1 include:resend.com ~all`
- **TTL:** `3600`

### DKIM Records (von Resend):
- Gehe zu https://resend.com/domains
- Füge `inclusions.zone` hinzu
- Resend zeigt dir mehrere DKIM-Records
- Füge diese als `TXT` Records hinzu:
  - **Typ:** `TXT`
  - **Name/Host:** `resend._domainkey` (oder wie von Resend angegeben)
  - **Wert:** (von Resend bereitgestellt)
  - **TTL:** `3600`

### DMARC Record (optional):
- **Typ:** `TXT`
- **Name/Host:** `_dmarc`
- **Wert:** `v=DMARC1; p=none; rua=mailto:admin@inclusions.zone`
- **TTL:** `3600`

---

## Checkliste

- [ ] Bei green.ch eingeloggt
- [ ] A-Record für `@` → `10.55.55.155` erstellt
- [ ] A-Record oder CNAME für `www` → `10.55.55.155` erstellt
- [ ] DNS-Propagierung geprüft (dnschecker.org)
- [ ] Website testet: `http://inclusions.zone`
- [ ] Nginx konfiguriert für `inclusions.zone`
- [ ] Server akzeptiert Anfragen für die Domain
- [ ] Später: SSL-Zertifikat installiert
- [ ] Später: SPF/DKIM/DMARC Records für E-Mail hinzugefügt

---

## Troubleshooting

### Domain zeigt nicht auf Server:

1. **DNS-Propagierung prüfen:**
   ```bash
   dig inclusions.zone
   # Sollte 10.55.55.155 zeigen
   ```

2. **Nginx-Konfiguration prüfen:**
   ```bash
   ssh incluzone@10.55.55.155
   sudo nginx -t
   sudo systemctl status nginx
   ```

3. **Firewall prüfen:**
   ```bash
   # Auf Server
   sudo ufw status
   # Port 80 sollte offen sein
   ```

### Website lädt nicht:

1. **Server erreichbar?**
   ```bash
   curl http://10.55.55.155
   ```

2. **Next.js läuft?**
   ```bash
   ssh incluzone@10.55.55.155
   ps aux | grep "next start"
   ```

3. **Nginx-Logs prüfen:**
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

---

## Wichtige Hinweise

1. **DNS-Propagierung:** Kann bis zu 48 Stunden dauern (meist 15-60 Minuten)
2. **E-Mail-Records:** SPF/DKIM müssen nach Domain-Umleitung neu konfiguriert werden
3. **HTTPS:** Nach DNS-Umleitung SSL-Zertifikat installieren
4. **Backup:** Notiere dir die aktuellen DNS-Einträge vor Änderungen

---

## Nächste Schritte nach DNS-Umleitung

1. ✅ DNS-Propagierung abwarten
2. ✅ Website testen: `http://inclusions.zone`
3. ✅ SSL-Zertifikat installieren
4. ✅ `NEXT_PUBLIC_SITE_URL` auf `https://inclusions.zone` ändern
5. ✅ Resend Domain-Verifizierung durchführen (SPF/DKIM Records)
6. ✅ E-Mail-Versand testen
