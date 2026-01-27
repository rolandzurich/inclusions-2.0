# 📋 Kurzanleitung: Domain-Umleitung bei green.ch

## DNS-Einträge bei green.ch erstellen:

### 1. Hauptdomain (inclusions.zone)
- **Typ:** `A`
- **Name:** `@` (oder leer lassen)
- **Wert:** `10.55.55.155`
- **TTL:** `3600`

### 2. www-Subdomain (www.inclusions.zone)
- **Typ:** `A`
- **Name:** `www`
- **Wert:** `10.55.55.155`
- **TTL:** `3600`

**ODER alternativ:**
- **Typ:** `CNAME`
- **Name:** `www`
- **Wert:** `inclusions.zone`
- **TTL:** `3600`

---

## Nach DNS-Einträgen:

1. **Warte 15-60 Minuten** (DNS-Propagierung)
2. **Prüfe DNS:** https://dnschecker.org/#A/inclusions.zone
3. **Teste Website:** http://inclusions.zone
4. **Aktualisiere Nginx:** Siehe `nginx-inclusions-domain.conf`
5. **Installiere SSL:** `sudo certbot --nginx -d inclusions.zone -d www.inclusions.zone`

---

## Vollständige Anleitung:
Siehe `DOMAIN_UMLEITUNG_GREEN_CH.md`
