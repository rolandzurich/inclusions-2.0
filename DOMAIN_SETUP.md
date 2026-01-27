# Seite ohne VPN erreichbar machen - Einfache Anleitung

## Problem:
Die Seite ist aktuell nur über VPN erreichbar (`10.55.55.155` ist eine private IP).

## Lösung: Domain auf Server zeigen lassen

Du hast die Domain `inclusions.zone` - wir müssen sie auf deinen Server zeigen lassen.

### Schritt 1: Öffentliche IP des Servers herausfinden

**Auf dem Server ausführen:**
```bash
curl ifconfig.me
```

Das zeigt dir die öffentliche IP-Adresse (z.B. `185.123.45.67`).

**Notiere dir diese IP!**

### Schritt 2: DNS-Einstellungen anpassen

**Gehe zu deinem Domain-Provider** (wo du `inclusions.zone` gekauft hast):

1. Öffne die DNS-Verwaltung für `inclusions.zone`
2. Erstelle oder ändere einen **A-Record**:
   - **Name:** `@` (oder leer für Hauptdomain) oder `server`
   - **Typ:** `A`
   - **Wert:** `[DEINE_ÖFFENTLICHE_IP]` (aus Schritt 1)
   - **TTL:** `3600` (1 Stunde)

**Beispiel:**
- Wenn deine öffentliche IP `185.123.45.67` ist:
  - Name: `@` → `inclusions.zone` zeigt auf `185.123.45.67`
  - Oder Name: `server` → `server.inclusions.zone` zeigt auf `185.123.45.67`

### Schritt 3: Nginx-Konfiguration anpassen

**Auf dem Server ausführen:**
```bash
sudo nano /etc/nginx/sites-available/inclusions
```

**Ändere diese Zeile:**
```nginx
server_name 10.55.55.155 _;
```

**Zu:**
```nginx
server_name inclusions.zone www.inclusions.zone;
```

**Oder falls du `server.inclusions.zone` nutzt:**
```nginx
server_name server.inclusions.zone;
```

**Speichern:** `Ctrl+O`, dann `Enter`, dann `Ctrl+X`

### Schritt 4: Nginx neu laden

```bash
sudo nginx -t  # Prüft ob alles OK ist
sudo systemctl reload nginx
```

### Schritt 5: Firewall öffnen (falls nötig)

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp  # Für HTTPS später
```

### Schritt 6: Warten und testen

**DNS-Änderungen brauchen Zeit:**
- Normalerweise: 5 Minuten bis 24 Stunden
- Meistens: 15-30 Minuten

**Testen:**
```bash
# Prüfe ob DNS funktioniert
nslookup inclusions.zone
# Sollte deine öffentliche IP zeigen
```

**Dann im Browser (ohne VPN):**
- `http://inclusions.zone` sollte jetzt funktionieren!

## Falls der Server keine öffentliche IP hat:

**Option A: Port-Weiterleitung im Router**
- Port 80 → Server (10.55.55.155)
- Dann öffentliche IP des Routers verwenden

**Option B: Server-Provider fragen**
- Frag deinen Server-Provider nach der öffentlichen IP
- Oder ob Port-Weiterleitung nötig ist

## Zusammenfassung:

1. ✅ Öffentliche IP herausfinden (`curl ifconfig.me`)
2. ✅ DNS A-Record erstellen (Domain → IP)
3. ✅ Nginx-Konfiguration anpassen
4. ✅ Nginx neu laden
5. ✅ Firewall öffnen
6. ✅ Warten (15-30 Min) und testen

**Nach 15-30 Minuten:** `http://inclusions.zone` sollte ohne VPN funktionieren!
