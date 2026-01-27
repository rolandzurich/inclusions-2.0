# ✅ Status-Check: Ist alles noch gut?

## Schnell-Check auf dem Server

**Du bist bereits auf dem Server eingeloggt. Führe diese Befehle aus:**

### 1. Prüfe ob Nginx läuft:
```bash
sudo systemctl status nginx --no-pager | head -10
```

**Erwartet:** `Active: active (running)`

### 2. Prüfe ob inclusions.zone konfiguriert ist:
```bash
sudo nginx -T 2>/dev/null | grep -A 3 "inclusions.zone"
```

**Erwartet:** Sollte `server_name inclusions.zone` zeigen

### 3. Prüfe ob Next.js läuft:
```bash
ps aux | grep "next start"
```

**Erwartet:** Sollte einen Prozess zeigen

### 4. Teste lokale Verbindung:
```bash
curl -I http://localhost:3000 2>&1 | head -5
```

**Erwartet:** Sollte HTTP-Status zeigen (200, 404, etc.)

### 5. Teste Nginx-Proxy:
```bash
curl -I http://localhost 2>&1 | head -5
```

**Erwartet:** Sollte HTTP-Status zeigen

---

## Alles OK?

Wenn alle Checks OK sind:
- ✅ Nginx läuft
- ✅ inclusions.zone ist konfiguriert
- ✅ Next.js läuft
- ✅ Verbindungen funktionieren

**Dann:** Warte auf DNS-Propagierung und teste dann http://inclusions.zone

---

## Falls Probleme:

**Nginx läuft nicht:**
```bash
sudo systemctl start nginx
sudo systemctl status nginx
```

**Next.js läuft nicht:**
```bash
cd ~/inclusions-2.0
npm start > /tmp/next.log 2>&1 &
```

**Konfiguration fehlt:**
```bash
cd ~/inclusions-2.0
sudo cp nginx-inclusions-domain.conf /etc/nginx/sites-available/inclusions-domain
sudo ln -sf /etc/nginx/sites-available/inclusions-domain /etc/nginx/sites-enabled/inclusions-domain
sudo nginx -t
sudo systemctl reload nginx
```
