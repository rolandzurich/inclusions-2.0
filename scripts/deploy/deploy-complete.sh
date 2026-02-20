#!/bin/bash

# Vollständiges Deployment auf den Server
# Server-Zugangsdaten
SERVER="10.55.55.155"
USER="incluzone"
PASSWORD="13vor12!Asdf"
APP_DIR="/home/incluzone/inclusions-2.0"

# Farben
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   🚀 VOLLSTÄNDIGES DEPLOYMENT - INCLUSIONS 2.0${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo ""

# Schritt 1: Aktualisierte API-Routen hochladen
echo -e "${YELLOW}📤 Schritt 1: Lade aktualisierte API-Routen hoch...${NC}"
echo -e "${YELLOW}   Passwort: 13vor12!Asdf${NC}"
echo ""

scp -i ~/.ssh/inclusions_server -o StrictHostKeyChecking=no \
  app/api/contact/route.ts \
  app/api/newsletter/route.ts \
  app/api/vip/route.ts \
  ${USER}@${SERVER}:${APP_DIR}/app/api/

if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Fehler beim Hochladen der Dateien${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Dateien hochgeladen${NC}"
echo ""

# Schritt 2: Auf Server verbinden und App neu bauen
echo -e "${YELLOW}📦 Schritt 2: Baue App auf dem Server neu...${NC}"
echo -e "${YELLOW}   Passwort: 13vor12!Asdf${NC}"
echo ""

ssh -i ~/.ssh/inclusions_server -o StrictHostKeyChecking=no ${USER}@${SERVER} << 'ENDSSH'
cd /home/incluzone/inclusions-2.0

echo "🔍 Prüfe Node.js und npm..."
node --version
npm --version

echo ""
echo "📦 Installiere Dependencies (falls nötig)..."
npm install --production

echo ""
echo "🏗️  Baue Next.js App neu..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Build fehlgeschlagen!"
  exit 1
fi

echo ""
echo "✅ Build erfolgreich abgeschlossen!"

echo ""
echo "🔄 Starte App mit PM2 neu..."
pm2 restart all

echo ""
echo "⏳ Warte 3 Sekunden..."
sleep 3

echo ""
echo "📊 PM2 Status:"
pm2 status

echo ""
echo "📝 Letzte PM2 Logs (letzte 20 Zeilen):"
pm2 logs --lines 20 --nostream

echo ""
echo "✅ Deployment abgeschlossen!"
ENDSSH

if [ $? -eq 0 ]; then
  echo ""
  echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
  echo -e "${GREEN}   ✅ DEPLOYMENT ERFOLGREICH ABGESCHLOSSEN!${NC}"
  echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
  echo ""
  echo -e "${BLUE}🌐 Live-Seite: ${GREEN}https://inclusions.zone${NC}"
  echo ""
  echo -e "${YELLOW}📧 Teste jetzt die Formulare:${NC}"
  echo -e "   1. Contact-Formular → Bestätigung an Benutzer + Notification an info@inclusions.zone"
  echo -e "   2. Newsletter-Formular → Willkommen an Benutzer + Notification an info@inclusions.zone"
  echo -e "   3. VIP-Formular → Bestätigung an Benutzer + Notification an info@inclusions.zone"
  echo ""
else
  echo -e "${RED}❌ Deployment fehlgeschlagen!${NC}"
  exit 1
fi
