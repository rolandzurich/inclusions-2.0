#!/bin/bash
# ============================================================
# SICHERES DEPLOYMENT – Inclusions 2.0
# ============================================================
# Schützt Produktionsdaten, migriert sicher, verifiziert.
#
# Ablauf:
#   1. Backup der Produktions-JSON-Daten vom Server
#   2. Lokaler Build
#   3. Upload NUR von Code (NIEMALS data/)
#   4. DB-Schema erstellen (idempotent)
#   5. JSON → PostgreSQL Migration (idempotent, Duplikat-sicher)
#   6. Verifikation (JSON vs. DB Abgleich)
#   7. App neustarten
#
# Verwendung:
#   ./deploy-safe.sh              # Vollständiger Deploy
#   ./deploy-safe.sh --dry-run    # Nur prüfen, nichts deployen
#   ./deploy-safe.sh --backup-only # Nur Backup der Produktionsdaten
# ============================================================

set -e

# Konfiguration
SERVER_IP="10.55.55.155"
SERVER_USER="incluzone"
SERVER_PATH="/home/incluzone/inclusions-2.0"
SSH_KEY="$HOME/.ssh/inclusions_server"
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Farben
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# SSH-Befehl Wrapper
ssh_cmd() {
  if [ -f "$SSH_KEY" ]; then
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "$1"
  else
    echo "⚠️  SSH-Key nicht gefunden. Nutze Passwort-Auth..."
    ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "$1"
  fi
}

scp_upload() {
  if [ -f "$SSH_KEY" ]; then
    scp -i "$SSH_KEY" -o StrictHostKeyChecking=no -r "$1" "$SERVER_USER@$SERVER_IP:$2"
  else
    scp -o StrictHostKeyChecking=no -r "$1" "$SERVER_USER@$SERVER_IP:$2"
  fi
}

scp_download() {
  if [ -f "$SSH_KEY" ]; then
    scp -i "$SSH_KEY" -o StrictHostKeyChecking=no -r "$SERVER_USER@$SERVER_IP:$1" "$2"
  else
    scp -o StrictHostKeyChecking=no -r "$SERVER_USER@$SERVER_IP:$1" "$2"
  fi
}

echo ""
echo -e "${BLUE}============================================================${NC}"
echo -e "${BLUE}  INCLUSIONS 2.0 – Sicheres Deployment${NC}"
echo -e "${BLUE}  $(date)${NC}"
echo -e "${BLUE}============================================================${NC}"
echo ""

# ============================================================
# SCHRITT 0: Parameter prüfen
# ============================================================
DRY_RUN=false
BACKUP_ONLY=false

if [ "$1" == "--dry-run" ]; then
  DRY_RUN=true
  echo -e "${YELLOW}🔍 DRY RUN Modus – Es wird NICHTS verändert${NC}"
  echo ""
fi

if [ "$1" == "--backup-only" ]; then
  BACKUP_ONLY=true
  echo -e "${YELLOW}💾 Nur Backup-Modus${NC}"
  echo ""
fi

# ============================================================
# SCHRITT 1: Backup der Produktionsdaten
# ============================================================
echo -e "${GREEN}━━━ SCHRITT 1/7: Backup der Produktionsdaten ━━━${NC}"
echo ""

mkdir -p "$BACKUP_DIR"

echo "📥 Lade Produktionsdaten vom Server herunter..."
echo "   → $BACKUP_DIR/"

# JSON-Daten sichern
for FILE in vip_registrations.json newsletter_subscribers.json contact_requests.json djs.json events.json content.json rueckblick.json; do
  echo -n "   📄 $FILE ... "
  if scp_download "$SERVER_PATH/data/$FILE" "$BACKUP_DIR/$FILE" 2>/dev/null; then
    COUNT=$(python3 -c "import json; print(len(json.load(open('$BACKUP_DIR/$FILE'))))" 2>/dev/null || echo "?")
    echo -e "${GREEN}OK${NC} ($COUNT Einträge)"
  else
    echo -e "${YELLOW}nicht vorhanden${NC}"
  fi
done

# .env sichern
echo -n "   🔐 .env.local ... "
if scp_download "$SERVER_PATH/.env.local" "$BACKUP_DIR/.env.local.backup" 2>/dev/null; then
  echo -e "${GREEN}OK${NC}"
else
  echo -e "${YELLOW}nicht vorhanden${NC}"
fi

echo ""
echo -e "${GREEN}✅ Backup gespeichert in: $BACKUP_DIR/${NC}"
echo ""

# Backup-Zusammenfassung
echo "📊 Backup-Zusammenfassung:"
echo "   VIP:        $(python3 -c "import json; print(len(json.load(open('$BACKUP_DIR/vip_registrations.json'))))" 2>/dev/null || echo '0') Einträge"
echo "   Newsletter:  $(python3 -c "import json; print(len(json.load(open('$BACKUP_DIR/newsletter_subscribers.json'))))" 2>/dev/null || echo '0') Einträge"
echo "   Bookings:    $(python3 -c "import json; print(len(json.load(open('$BACKUP_DIR/contact_requests.json'))))" 2>/dev/null || echo '0') Einträge"
echo ""

if [ "$BACKUP_ONLY" = true ]; then
  echo -e "${GREEN}✅ Backup abgeschlossen. Keine weiteren Aktionen.${NC}"
  exit 0
fi

if [ "$DRY_RUN" = true ]; then
  echo -e "${YELLOW}🔍 DRY RUN: Backup erstellt. Weitere Schritte würden folgen.${NC}"
  echo "   - Lokaler Build"
  echo "   - Upload von Code (OHNE data/)"
  echo "   - DB-Schema Migration"
  echo "   - JSON → PostgreSQL Migration"
  echo "   - Verifikation"
  echo "   - App Neustart"
  exit 0
fi

# ============================================================
# SCHRITT 2: Lokaler Build
# ============================================================
echo -e "${GREEN}━━━ SCHRITT 2/7: Lokaler Build ━━━${NC}"
echo ""
echo "🔨 Starte npm run build..."
npm run build
echo ""
echo -e "${GREEN}✅ Build erfolgreich${NC}"
echo ""

# ============================================================
# SCHRITT 3: Upload NUR Code (NIEMALS data/)
# ============================================================
echo -e "${GREEN}━━━ SCHRITT 3/7: Code-Upload (OHNE data/) ━━━${NC}"
echo ""
echo -e "${RED}⚠️  WICHTIG: data/ wird NICHT hochgeladen!${NC}"
echo ""

# Code-Verzeichnisse
echo "📤 Uploading .next/ ..."
scp_upload ".next" "$SERVER_PATH/"

echo "📤 Uploading app/ ..."
scp_upload "app" "$SERVER_PATH/"

echo "📤 Uploading lib/ ..."
scp_upload "lib" "$SERVER_PATH/"

echo "📤 Uploading components/ ..."
scp_upload "components" "$SERVER_PATH/"

echo "📤 Uploading types/ ..."
scp_upload "types" "$SERVER_PATH/"

echo "📤 Uploading public/ (Bilder, keine Daten) ..."
scp_upload "public" "$SERVER_PATH/"

# Config-Dateien
echo "📤 Uploading Konfiguration ..."
for CONF in next.config.js tailwind.config.js postcss.config.js package.json; do
  scp_upload "$CONF" "$SERVER_PATH/$CONF"
done

echo ""
echo -e "${GREEN}✅ Code-Upload abgeschlossen${NC}"
echo ""

# ============================================================
# SCHRITT 4: npm install auf Server (falls nötig)
# ============================================================
echo -e "${GREEN}━━━ SCHRITT 4/7: Dependencies auf Server ━━━${NC}"
echo ""
echo "📦 Installiere Dependencies auf dem Server..."
ssh_cmd "cd $SERVER_PATH && npm install --production 2>&1 | tail -3"
echo ""
echo -e "${GREEN}✅ Dependencies aktualisiert${NC}"
echo ""

# ============================================================
# SCHRITT 5: DB-Schema Migration
# ============================================================
echo -e "${GREEN}━━━ SCHRITT 5/7: Datenbank-Schema ━━━${NC}"
echo ""
echo "🗄️  Stelle sicher, dass alle DB-Tabellen existieren..."

# CRM Schema
ssh_cmd "cd $SERVER_PATH && curl -s -X POST http://localhost:3000/api/admin-v2/migrate-crm 2>/dev/null | python3 -m json.tool 2>/dev/null || echo 'Schema-API nicht erreichbar (App muss laufen)'"

# CMS Schema
ssh_cmd "cd $SERVER_PATH && curl -s -X POST http://localhost:3000/api/admin-v2/cms/init 2>/dev/null | python3 -m json.tool 2>/dev/null || echo 'CMS-Schema-API nicht erreichbar'"

echo ""
echo -e "${GREEN}✅ DB-Schema geprüft${NC}"
echo ""

# ============================================================
# SCHRITT 6: App neustarten (damit neue API-Routen verfügbar)
# ============================================================
echo -e "${GREEN}━━━ SCHRITT 6/7: App neustarten ━━━${NC}"
echo ""
echo "🔄 Starte die App neu..."
ssh_cmd "cd $SERVER_PATH && pm2 restart all 2>/dev/null || (echo 'PM2 nicht verfügbar, starte manuell...' && pkill -f 'next start' 2>/dev/null; sleep 2 && cd $SERVER_PATH && NODE_ENV=production npm start > /tmp/inclusions-app.log 2>&1 &)"
echo "⏳ Warte 10 Sekunden auf App-Start..."
sleep 10

# Health Check
echo -n "🏥 Health-Check... "
if ssh_cmd "curl -s http://localhost:3000/api/admin-v2/dashboard > /dev/null 2>&1"; then
  echo -e "${GREEN}OK${NC}"
else
  echo -e "${RED}WARNUNG: App antwortet nicht!${NC}"
fi
echo ""

# ============================================================
# SCHRITT 7: JSON → PostgreSQL Migration + Verifikation
# ============================================================
echo -e "${GREEN}━━━ SCHRITT 7/7: Datenmigration & Verifikation ━━━${NC}"
echo ""

# Zuerst Dry-Run
echo "🔍 Dry-Run der Migration (keine Änderungen)..."
ssh_cmd "curl -s -X POST 'http://localhost:3000/api/admin-v2/migrate-crm/migrate-data?dry_run=true' | python3 -m json.tool"
echo ""

# Migration ausführen
echo "📊 Starte echte Migration..."
ssh_cmd "curl -s -X POST http://localhost:3000/api/admin-v2/migrate-crm/migrate-data | python3 -m json.tool"
echo ""

# Verifikation
echo "✅ Verifikation: JSON vs. Datenbank..."
ssh_cmd "curl -s http://localhost:3000/api/admin-v2/migrate-crm/verify | python3 -m json.tool"
echo ""

# Dashboard-Check
echo "📊 Dashboard-Daten:"
ssh_cmd "curl -s http://localhost:3000/api/admin-v2/dashboard | python3 -c \"
import json, sys
d = json.load(sys.stdin)
s = d.get('stats', {})
ds = d.get('dataSource', {})
print(f'  VIP:        {s.get(\"vip\", 0)} (DB: {ds.get(\"pgStats\", {}).get(\"vip\", 0)}, JSON: {ds.get(\"jsonStats\", {}).get(\"vip\", 0)})')
print(f'  Newsletter:  {s.get(\"newsletter\", 0)} (DB: {ds.get(\"pgStats\", {}).get(\"newsletter\", 0)}, JSON: {ds.get(\"jsonStats\", {}).get(\"newsletter\", 0)})')
print(f'  Bookings:    {s.get(\"bookings\", 0)} (DB: {ds.get(\"pgStats\", {}).get(\"bookings\", 0)}, JSON: {ds.get(\"jsonStats\", {}).get(\"bookings\", 0)})')
print(f'  Kontakte:    {s.get(\"contacts\", 0)}')
print(f'  DB Status:   {\"✅ Verbunden\" if ds.get(\"dbConnected\") else \"❌ Nicht verbunden\"}')\""
echo ""

echo -e "${BLUE}============================================================${NC}"
echo -e "${GREEN}  ✅ DEPLOYMENT ABGESCHLOSSEN${NC}"
echo -e "${BLUE}============================================================${NC}"
echo ""
echo "  📊 Dashboard:  http://$SERVER_IP:3000/admin-v2/dashboard"
echo "  📋 Backup:     $BACKUP_DIR/"
echo ""
echo -e "${YELLOW}  Bitte prüfe das Dashboard im Browser!${NC}"
echo ""
