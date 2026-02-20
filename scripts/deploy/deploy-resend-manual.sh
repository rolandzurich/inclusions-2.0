#!/bin/bash

# Farben für Output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

SERVER="incluzone@10.55.55.155"
PASSWORD="13vor12!Asdf"
APP_DIR="/home/incluzone/inclusions-2.0"

echo -e "${YELLOW}🚀 Deploying Resend-Fix auf Server...${NC}"
echo ""
echo -e "${YELLOW}Das Passwort ist: 13vor12!Asdf${NC}"
echo ""

# 1. Contact Route hochladen
echo -e "${YELLOW}📤 Lade Contact Route hoch...${NC}"
scp app/api/contact/route.ts ${SERVER}:${APP_DIR}/app/api/contact/route.ts
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Contact Route hochgeladen${NC}"
else
  echo -e "${RED}❌ Fehler beim Hochladen der Contact Route${NC}"
  exit 1
fi

# 2. Newsletter Route hochladen
echo -e "${YELLOW}📤 Lade Newsletter Route hoch...${NC}"
scp app/api/newsletter/route.ts ${SERVER}:${APP_DIR}/app/api/newsletter/route.ts
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Newsletter Route hochgeladen${NC}"
else
  echo -e "${RED}❌ Fehler beim Hochladen der Newsletter Route${NC}"
  exit 1
fi

# 3. VIP Route hochladen
echo -e "${YELLOW}📤 Lade VIP Route hoch...${NC}"
scp app/api/vip/route.ts ${SERVER}:${APP_DIR}/app/api/vip/route.ts
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ VIP Route hochgeladen${NC}"
else
  echo -e "${RED}❌ Fehler beim Hochladen der VIP Route${NC}"
  exit 1
fi

# 4. App neu starten
echo ""
echo -e "${YELLOW}🔄 Starte App auf dem Server neu...${NC}"
echo -e "${YELLOW}Bitte gib das Passwort ein: 13vor12!Asdf${NC}"
echo ""

ssh ${SERVER} << 'ENDSSH'
cd /home/incluzone/inclusions-2.0
echo "📊 Aktueller PM2 Status:"
pm2 status
echo ""
echo "🔄 Starte App neu..."
pm2 restart all
echo ""
echo "📊 Neuer PM2 Status:"
pm2 status
echo ""
echo "✅ App neu gestartet!"
ENDSSH

if [ $? -eq 0 ]; then
  echo ""
  echo -e "${GREEN}✅ Deploy abgeschlossen!${NC}"
  echo -e "${GREEN}🌐 Teste jetzt: https://inclusions.zone${NC}"
else
  echo -e "${RED}❌ Fehler beim Neustarten der App${NC}"
  exit 1
fi
