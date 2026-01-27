#!/bin/bash

# Farben für Output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

SERVER="10.55.55.155"
USER="incluzone"
PASSWORD="13vor12!Asdf"
APP_DIR="/home/incluzone/inclusions-2.0"

echo -e "${YELLOW}🚀 Deploying Resend-Fix auf Server...${NC}"

# 1. Erstelle temporäres Verzeichnis für die Dateien
TEMP_DIR=$(mktemp -d)
echo -e "${YELLOW}📦 Bereite Dateien vor...${NC}"

# Kopiere aktualisierte Dateien
cp app/api/contact/route.ts "$TEMP_DIR/contact-route.ts"
cp app/api/newsletter/route.ts "$TEMP_DIR/newsletter-route.ts"
cp app/api/vip/route.ts "$TEMP_DIR/vip-route.ts"

# 2. Lade Dateien hoch mit expect
echo -e "${YELLOW}📤 Lade Dateien auf Server hoch...${NC}"

for file in contact newsletter vip; do
  expect << EOF
    set timeout 30
    spawn scp "$TEMP_DIR/${file}-route.ts" ${USER}@${SERVER}:${APP_DIR}/app/api/${file}/route.ts
    expect {
      "password:" {
        send "${PASSWORD}\r"
        exp_continue
      }
      "yes/no" {
        send "yes\r"
        exp_continue
      }
      eof
    }
EOF
done

# 3. App neu starten
echo -e "${YELLOW}🔄 Starte App neu...${NC}"

expect << 'EOF'
  set timeout 30
  spawn ssh incluzone@10.55.55.155
  expect {
    "password:" {
      send "13vor12!Asdf\r"
      expect "$ "
    }
    "yes/no" {
      send "yes\r"
      exp_continue
    }
  }
  
  send "cd /home/incluzone/inclusions-2.0\r"
  expect "$ "
  
  send "pm2 restart all\r"
  expect "$ "
  
  send "pm2 status\r"
  expect "$ "
  
  send "exit\r"
  expect eof
EOF

# 4. Cleanup
rm -rf "$TEMP_DIR"

echo -e "${GREEN}✅ Deploy abgeschlossen!${NC}"
echo -e "${GREEN}🌐 Teste jetzt: https://inclusions.zone${NC}"
