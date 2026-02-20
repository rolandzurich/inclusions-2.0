# Admin-Backend auf Produktion deployen 🚀

## Schnell-Deployment (1 Befehl)

```bash
./deploy-admin-backend.sh
```

**Das war's!** Das Skript:
1. ✅ Lädt alle Admin-API-Routes auf den Server
2. ✅ Lädt Testdaten hoch (contact_requests, vip_registrations, newsletter_subscribers)
3. ✅ Baut die App neu
4. ✅ Startet die App mit PM2 neu

---

## Nach dem Deployment

### 🔐 Admin-Login URL:
**https://inclusions.zone/admin/login**

### 📋 Zugangsdaten:
- **E-Mail:** `info@inclusions.zone` oder `admin@inclusions.zone`
- **Passwort:** `Inclusions2026!`

### 📊 Verfügbare Admin-Bereiche:

| Bereich | URL |
|---------|-----|
| Dashboard | https://inclusions.zone/admin/dashboard |
| Booking-Anfragen | https://inclusions.zone/admin/contact-requests |
| VIP-Anmeldungen | https://inclusions.zone/admin/vip |
| Newsletter | https://inclusions.zone/admin/newsletter |

---

## Was passiert nach dem Deployment?

### ✅ Sofort verfügbar:

1. **Admin-Login** funktioniert auf https://inclusions.zone/admin/login
2. **Testdaten** sind vorhanden:
   - 3 Booking-Anfragen
   - 3 VIP-Anmeldungen
   - 4 Newsletter-Abonnenten
3. **Alle Features** funktionieren:
   - Dashboard mit Statistiken
   - Listen aller Einträge
   - "Neu"-Badge für ungesehene Einträge
   - CSV-Export
   - Duplikat-Erkennung
   - Löschen-Funktion

### 📝 Neue Formulareinträge:

Wenn Benutzer auf https://inclusions.zone Formulare ausfüllen:
- **Booking-Formular** → Eintrag in `/admin/contact-requests`
- **VIP-Formular** → Eintrag in `/admin/vip`
- **Newsletter-Formular** → Eintrag in `/admin/newsletter`

**Alle Einträge werden automatisch im Admin-Backend angezeigt!**

---

## Datenspeicherung auf dem Server

Alle Formulardaten werden gespeichert in:
```
/home/incluzone/inclusions-2.0/data/
├── contact_requests.json       ← Booking-Anfragen
├── vip_registrations.json      ← VIP-Anmeldungen
└── newsletter_subscribers.json ← Newsletter-Abonnenten
```

### Backup erstellen:

```bash
# Von lokal auf Server verbinden
ssh -i ~/.ssh/inclusions_server incluzone@10.55.55.155

# Backup erstellen
cd /home/incluzone/inclusions-2.0
tar -czf backup-data-$(date +%Y%m%d).tar.gz data/

# Backup herunterladen (auf lokalem Rechner)
scp -i ~/.ssh/inclusions_server incluzone@10.55.55.155:/home/incluzone/inclusions-2.0/backup-data-*.tar.gz ~/Downloads/
```

---

## Troubleshooting

### Problem: "SSH-Key nicht gefunden"

**Lösung:**
```bash
./deploy.sh setup-key
```

Dann erneut: `./deploy-admin-backend.sh`

### Problem: App läuft nicht

**Prüfen:**
```bash
ssh -i ~/.ssh/inclusions_server incluzone@10.55.55.155 "pm2 status"
```

**Logs ansehen:**
```bash
ssh -i ~/.ssh/inclusions_server incluzone@10.55.55.155 "pm2 logs --lines 50"
```

**Neu starten:**
```bash
./deploy.sh restart
```

### Problem: Admin-Login funktioniert nicht

**Prüfen Sie:**
1. URL korrekt: https://inclusions.zone/admin/login (nicht /admin/)
2. Zugangsdaten korrekt eingegeben
3. Browser-Console auf Fehler prüfen

### Problem: Keine Daten im Backend sichtbar

**Prüfen Sie:**
1. Sind die JSON-Dateien auf dem Server?
   ```bash
   ssh -i ~/.ssh/inclusions_server incluzone@10.55.55.155 "ls -la /home/incluzone/inclusions-2.0/data/"
   ```

2. Testdaten erneut hochladen:
   ```bash
   scp -i ~/.ssh/inclusions_server data/*.json incluzone@10.55.55.155:/home/incluzone/inclusions-2.0/data/
   ```

---

## Manuelle Schritte (falls Skript fehlschlägt)

### 1. Mit Server verbinden:
```bash
ssh -i ~/.ssh/inclusions_server incluzone@10.55.55.155
```

### 2. Ins App-Verzeichnis wechseln:
```bash
cd /home/incluzone/inclusions-2.0
```

### 3. App neu bauen:
```bash
npm run build
```

### 4. PM2 neu starten:
```bash
pm2 restart all
pm2 status
```

### 5. Logs prüfen:
```bash
pm2 logs --lines 50
```

---

## Wichtige Hinweise

### 🔒 Sicherheit:
- Die Zugangsdaten sind Test-Credentials
- **Für Produktion:** Ändern Sie das Passwort in `app/api/admin/auth/route.ts`
- **Für mehr Sicherheit:** Implementieren Sie JWT oder Supabase Auth

### 💾 Datenpersistenz:
- JSON-Dateien überleben Server-Neustarts
- Regelmäßige Backups empfohlen
- Bei vielen Einträgen (>1000) Migration zu Datenbank empfohlen

### 🚀 Performance:
- JSON-Dateien sind schnell für kleine bis mittlere Datenmengen
- Kein Datenbank-Setup erforderlich
- Einfach zu backupen und zu migrieren

---

## Support & Weiterentwicklung

### Passwort ändern:

Bearbeiten Sie: `app/api/admin/auth/route.ts`

Suchen Sie:
```typescript
const validCredentials = {
  'info@inclusions.zone': 'Inclusions2026!',
  'admin@inclusions.zone': 'Inclusions2026!',
};
```

Ändern Sie das Passwort und deployen Sie neu.

### Mehr Admin-Features hinzufügen:

1. Neue Seite erstellen: `app/admin/neue-seite/page.tsx`
2. Navigation erweitern: `app/admin/layout.tsx`
3. API-Route hinzufügen: `app/api/admin/neue-route/route.ts`

---

## Erfolgreiches Deployment überprüfen

Nach dem Deployment testen Sie:

✅ **Login:** https://inclusions.zone/admin/login  
✅ **Dashboard:** Statistiken werden angezeigt  
✅ **Booking-Anfragen:** 3 Testeinträge sichtbar  
✅ **VIP-Anmeldungen:** 3 Testeinträge sichtbar  
✅ **Newsletter:** 4 Testeinträge sichtbar  
✅ **CSV-Export:** Funktioniert in allen Bereichen  

**Alles funktioniert? Perfekt! Das Admin-Backend ist live! 🎉**
