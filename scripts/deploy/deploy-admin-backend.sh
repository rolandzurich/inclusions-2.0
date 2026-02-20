#!/bin/bash

# Admin-Backend Deployment
# Deployed alle Admin-Backend-Komponenten auf den Server

SERVER="10.55.55.155"
USER="incluzone"
APP_DIR="/home/incluzone/inclusions-2.0"
SSH_KEY="$HOME/.ssh/inclusions_server"

# Farben
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   🔐 ADMIN-BACKEND DEPLOYMENT${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo ""

# Prüfe SSH-Key
if [ ! -f "$SSH_KEY" ]; then
    echo -e "${RED}❌ SSH-Key nicht gefunden: $SSH_KEY${NC}"
    echo -e "${YELLOW}Führe aus: ./deploy.sh setup-key${NC}"
    exit 1
fi

SSH_OPTS="-i $SSH_KEY -o StrictHostKeyChecking=no"

echo -e "${YELLOW}📤 Schritt 1: Lade Admin-API-Routes hoch...${NC}"

# Admin API Routes
scp $SSH_OPTS \
  app/api/admin/stats/route.ts \
  app/api/admin/contact-requests/route.ts \
  app/api/admin/vip/route.ts \
  app/api/admin/newsletter/route.ts \
  ${USER}@${SERVER}:${APP_DIR}/app/api/admin/ 2>/dev/null

# Admin API Routes mit ID-Parameter
scp $SSH_OPTS \
  app/api/admin/contact-requests/\[id\]/route.ts \
  ${USER}@${SERVER}:${APP_DIR}/app/api/admin/contact-requests/\[id\]/ 2>/dev/null

scp $SSH_OPTS \
  app/api/admin/vip/\[id\]/route.ts \
  ${USER}@${SERVER}:${APP_DIR}/app/api/admin/vip/\[id\]/ 2>/dev/null

scp $SSH_OPTS \
  app/api/admin/newsletter/\[id\]/route.ts \
  ${USER}@${SERVER}:${APP_DIR}/app/api/admin/newsletter/\[id\]/ 2>/dev/null

if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Fehler beim Hochladen der API-Routes${NC}"
  exit 1
fi

echo -e "${GREEN}✅ API-Routes hochgeladen${NC}"
echo ""

echo -e "${YELLOW}📤 Schritt 2: Lade Testdaten hoch...${NC}"

# Erstelle data-Verzeichnis auf Server falls nicht vorhanden
ssh $SSH_OPTS ${USER}@${SERVER} "mkdir -p ${APP_DIR}/data"

# Lade JSON-Dateien hoch
scp $SSH_OPTS \
  data/contact_requests.json \
  data/vip_registrations.json \
  data/newsletter_subscribers.json \
  ${USER}@${SERVER}:${APP_DIR}/data/

if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Fehler beim Hochladen der Daten${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Testdaten hochgeladen${NC}"
echo ""

echo -e "${YELLOW}📦 Schritt 3: Baue App auf dem Server neu...${NC}"

ssh $SSH_OPTS ${USER}@${SERVER} << 'ENDSSH'
cd /home/incluzone/inclusions-2.0

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
echo "⏳ Warte 5 Sekunden..."
sleep 5

echo ""
echo "📊 PM2 Status:"
pm2 status

echo ""
echo "📝 Letzte PM2 Logs (letzte 30 Zeilen):"
pm2 logs --lines 30 --nostream

ENDSSH

if [ $? -eq 0 ]; then
  echo ""
  echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
  echo -e "${GREEN}   ✅ ADMIN-BACKEND ERFOLGREICH DEPLOYED!${NC}"
  echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
  echo ""
  echo -e "${BLUE}🔐 Admin-Login: ${GREEN}https://inclusions.zone/admin/login${NC}"
  echo ""
  echo -e "${YELLOW}📋 Zugangsdaten:${NC}"
  echo -e "   E-Mail: ${GREEN}info@inclusions.zone${NC}"
  echo -e "   Passwort: ${GREEN}Inclusions2026!${NC}"
  echo ""
  echo -e "${YELLOW}📊 Verfügbare Admin-Bereiche:${NC}"
  echo -e "   • Dashboard:          ${GREEN}https://inclusions.zone/admin/dashboard${NC}"
  echo -e "   • Booking-Anfragen:   ${GREEN}https://inclusions.zone/admin/contact-requests${NC}"
  echo -e "   • VIP-Anmeldungen:    ${GREEN}https://inclusions.zone/admin/vip${NC}"
  echo -e "   • Newsletter:         ${GREEN}https://inclusions.zone/admin/newsletter${NC}"
  echo ""
  echo -e "${BLUE}💡 Das Backend enthält bereits Testdaten zum Ausprobieren!${NC}"
  echo ""
else
  echo -e "${RED}❌ Deployment fehlgeschlagen!${NC}"
  exit 1
fi
