# Datenbank-Setup ausführen

## Einfacher Befehl (alles in einem Schritt)

Verbinde dich mit dem Server und führe diesen einen Befehl aus:

```bash
ssh incluzone@10.55.55.155 "cd ~/inclusions-2.0 && curl -s https://raw.githubusercontent.com/your-repo/inclusions-2.0/main/install-database.sh | bash"
```

**ODER** kopiere das Skript lokal und führe es aus:

```bash
# Auf deinem lokalen Rechner:
scp install-database.sh incluzone@10.55.55.155:~/install-database.sh

# Dann auf dem Server:
ssh incluzone@10.55.55.155
bash ~/install-database.sh
```

## Was das Skript macht

1. ✅ Installiert PostgreSQL (falls nicht vorhanden)
2. ✅ Erstellt Datenbank `inclusions_db`
3. ✅ Erstellt Benutzer `inclusions_user`
4. ✅ Erstellt alle Tabellen (contact_requests, newsletter_subscribers, vip_registrations, etc.)
5. ✅ Setzt Umgebungsvariablen in `.env`
6. ✅ Prüft ob alles korrekt erstellt wurde

## Nach dem Setup

```bash
cd ~/inclusions-2.0
pkill -f "next start"
npm start > /tmp/next.log 2>&1 &
```

## Testen

```bash
# Prüfe Logs
tail -f /tmp/next.log

# Prüfe Datenbank
sudo -u postgres psql -d inclusions_db -c "\dt"
```
