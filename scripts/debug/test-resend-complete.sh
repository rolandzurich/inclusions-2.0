#!/bin/bash

# Vollständiger Resend-Test auf dem Server
# Verwendung: ssh incluzone@10.55.55.155 "bash -s" < test-resend-complete.sh

echo "================================"
echo "🔍 RESEND VOLLSTÄNDIGER TEST"
echo "================================"
echo ""

cd ~/inclusions-2.0 || { echo "❌ Verzeichnis nicht gefunden"; exit 1; }

# Farben für Ausgabe
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

SUCCESS=0
WARNINGS=0
ERRORS=0

echo "📋 Schritt 1/6: .env Datei prüfen"
echo "-----------------------------------"
if [ -f .env ]; then
    echo -e "${GREEN}✅ .env Datei gefunden${NC}"
    
    RESEND_KEY=$(grep "^RESEND_API_KEY=" .env | cut -d'=' -f2)
    FROM_EMAIL=$(grep "^RESEND_FROM_EMAIL=" .env | cut -d'=' -f2)
    ADMIN_EMAIL=$(grep "^RESEND_ADMIN_EMAIL=" .env | cut -d'=' -f2)
    
    echo ""
    if [[ "$RESEND_KEY" =~ ^re_ ]]; then
        echo -e "${GREEN}✅ RESEND_API_KEY: ${RESEND_KEY:0:15}...${NC}"
        ((SUCCESS++))
    else
        echo -e "${RED}❌ RESEND_API_KEY fehlt oder ist ungültig${NC}"
        ((ERRORS++))
    fi
    
    if [ -n "$FROM_EMAIL" ]; then
        echo -e "${GREEN}✅ RESEND_FROM_EMAIL: $FROM_EMAIL${NC}"
        ((SUCCESS++))
    else
        echo -e "${YELLOW}⚠️  RESEND_FROM_EMAIL nicht gesetzt${NC}"
        ((WARNINGS++))
    fi
    
    if [ -n "$ADMIN_EMAIL" ]; then
        echo -e "${GREEN}✅ RESEND_ADMIN_EMAIL: $ADMIN_EMAIL${NC}"
        ((SUCCESS++))
    else
        echo -e "${YELLOW}⚠️  RESEND_ADMIN_EMAIL nicht gesetzt${NC}"
        ((WARNINGS++))
    fi
else
    echo -e "${RED}❌ .env Datei nicht gefunden!${NC}"
    ((ERRORS++))
fi
echo ""

echo "📋 Schritt 2/6: Next.js Prozess prüfen"
echo "-----------------------------------"
if pgrep -f "next start" > /dev/null; then
    PID=$(pgrep -f "next start" | head -1)
    echo -e "${GREEN}✅ Next.js läuft (PID: $PID)${NC}"
    ((SUCCESS++))
    
    # Prüfe ob Environment-Variablen geladen sind
    if [ -f /proc/$PID/environ ]; then
        if grep -q "RESEND_API_KEY" /proc/$PID/environ 2>/dev/null; then
            echo -e "${GREEN}✅ RESEND_API_KEY ist im Prozess geladen${NC}"
            ((SUCCESS++))
        else
            echo -e "${RED}❌ RESEND_API_KEY ist NICHT im Prozess geladen${NC}"
            echo -e "${YELLOW}   → App muss neu gestartet werden!${NC}"
            ((ERRORS++))
        fi
    fi
else
    echo -e "${RED}❌ Next.js läuft NICHT!${NC}"
    echo -e "${YELLOW}   → Starte mit: npm start > /tmp/next.log 2>&1 &${NC}"
    ((ERRORS++))
fi
echo ""

echo "📋 Schritt 3/6: Debug-Endpoint testen"
echo "-----------------------------------"
if pgrep -f "next start" > /dev/null; then
    RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:3000/api/debug-resend 2>&1)
    HTTP_CODE=$(echo "$RESPONSE" | tail -1)
    BODY=$(echo "$RESPONSE" | head -n -1)
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✅ API-Endpoint antwortet (HTTP 200)${NC}"
        ((SUCCESS++))
        
        if echo "$BODY" | grep -q '"resendIsNull":false'; then
            echo -e "${GREEN}✅ Resend ist korrekt initialisiert${NC}"
            ((SUCCESS++))
        elif echo "$BODY" | grep -q '"resendIsNull":true'; then
            echo -e "${RED}❌ Resend ist NULL - API Key wird nicht geladen${NC}"
            ((ERRORS++))
        fi
        
        echo ""
        echo "Response:"
        echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
    elif [ "$HTTP_CODE" = "404" ]; then
        echo -e "${YELLOW}⚠️  Debug-Endpoint nicht gefunden (HTTP 404)${NC}"
        echo -e "${YELLOW}   → Endpoint muss erstellt werden: app/api/debug-resend/route.ts${NC}"
        ((WARNINGS++))
    else
        echo -e "${RED}❌ API-Endpoint antwortet nicht korrekt (HTTP $HTTP_CODE)${NC}"
        ((ERRORS++))
    fi
else
    echo -e "${YELLOW}⚠️  Next.js läuft nicht - kann API nicht testen${NC}"
    ((WARNINGS++))
fi
echo ""

echo "📋 Schritt 4/6: Resend API direkt testen"
echo "-----------------------------------"
if [ -n "$RESEND_KEY" ] && [[ "$RESEND_KEY" =~ ^re_ ]]; then
    echo "Teste API Key mit Resend API..."
    
    API_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "https://api.resend.com/domains" \
        -H "Authorization: Bearer $RESEND_KEY" \
        -H "Content-Type: application/json" 2>&1)
    
    API_HTTP_CODE=$(echo "$API_RESPONSE" | tail -1)
    API_BODY=$(echo "$API_RESPONSE" | head -n -1)
    
    if [ "$API_HTTP_CODE" = "200" ]; then
        if echo "$API_BODY" | grep -q "inclusions.zone"; then
            echo -e "${GREEN}✅ API Key funktioniert - Domain inclusions.zone gefunden${NC}"
            ((SUCCESS++))
            
            if echo "$API_BODY" | grep -q '"status":"verified"'; then
                echo -e "${GREEN}✅ Domain ist verifiziert${NC}"
                ((SUCCESS++))
            fi
        else
            echo -e "${YELLOW}⚠️  API funktioniert, aber Domain nicht gefunden${NC}"
            ((WARNINGS++))
        fi
    elif [ "$API_HTTP_CODE" = "401" ]; then
        echo -e "${RED}❌ API Key ist ungültig oder abgelaufen (HTTP 401)${NC}"
        ((ERRORS++))
    else
        echo -e "${RED}❌ Resend API Fehler (HTTP $API_HTTP_CODE)${NC}"
        ((ERRORS++))
    fi
else
    echo -e "${YELLOW}⚠️  Kann API nicht testen - RESEND_API_KEY fehlt${NC}"
    ((WARNINGS++))
fi
echo ""

echo "📋 Schritt 5/6: Logs prüfen"
echo "-----------------------------------"
if [ -f /tmp/next.log ]; then
    echo "Letzte Resend/E-Mail relevante Log-Einträge:"
    LOGS=$(tail -50 /tmp/next.log | grep -iE "(resend|email|📧|❌|✅)" | tail -15)
    
    if [ -n "$LOGS" ]; then
        echo "$LOGS"
        
        # Prüfe auf spezifische Fehler
        if echo "$LOGS" | grep -q "RESEND_API_KEY ist nicht gesetzt\|not authorized\|Invalid API key"; then
            echo ""
            echo -e "${RED}⚠️  FEHLER in Logs gefunden!${NC}"
            ((ERRORS++))
        fi
    else
        echo -e "${GREEN}✅ Keine Resend-Fehler in den Logs${NC}"
        ((SUCCESS++))
    fi
else
    echo -e "${YELLOW}⚠️  Log-Datei /tmp/next.log nicht gefunden${NC}"
    ((WARNINGS++))
fi
echo ""

echo "📋 Schritt 6/6: Test-E-Mail Bereitschaft"
echo "-----------------------------------"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ System ist bereit für Test-E-Mail${NC}"
    echo ""
    echo "Teste mit:"
    echo "  curl -X POST http://localhost:3000/api/newsletter \\"
    echo "    -H 'Content-Type: application/json' \\"
    echo "    -d '{\"email\":\"test@example.com\",\"first_name\":\"Test\"}'"
    ((SUCCESS++))
else
    echo -e "${RED}❌ System ist NICHT bereit - Fehler müssen behoben werden${NC}"
fi
echo ""

echo "================================"
echo "📊 ZUSAMMENFASSUNG"
echo "================================"
echo ""
echo -e "${GREEN}Erfolgreich: $SUCCESS${NC}"
echo -e "${YELLOW}Warnungen: $WARNINGS${NC}"
echo -e "${RED}Fehler: $ERRORS${NC}"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}🎉 ALLES OK! E-Mail-Versand sollte funktionieren.${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  System funktioniert mit kleinen Warnungen.${NC}"
    exit 0
else
    echo -e "${RED}❌ Fehler gefunden - siehe Details oben.${NC}"
    echo ""
    echo "Häufigste Lösungen:"
    echo "1. App neu starten: pkill -f 'next start' && npm start > /tmp/next.log 2>&1 &"
    echo "2. .env Datei prüfen: cat .env | grep RESEND"
    echo "3. Logs live verfolgen: tail -f /tmp/next.log"
    exit 1
fi
