#!/bin/bash

# Resend-Konfiguration auf dem Server prüfen
# Führe dieses Skript auf dem Server aus: ssh incluzone@10.55.55.155 "bash -s" < check-resend-server.sh

echo "🔍 Resend-Konfiguration prüfen"
echo "================================"
echo ""

# 1. Prüfe .env Datei
echo "1️⃣ Prüfe .env Datei..."
cd ~/inclusions-2.0 2>/dev/null || { echo "❌ Verzeichnis nicht gefunden!"; exit 1; }

if [ -f .env ]; then
    echo "✅ .env Datei gefunden"
    echo ""
    
    # Prüfe RESEND_API_KEY
    RESEND_KEY=$(grep "^RESEND_API_KEY=" .env | cut -d'=' -f2)
    if [ -z "$RESEND_KEY" ]; then
        echo "❌ RESEND_API_KEY nicht gefunden in .env"
    elif [ "$RESEND_KEY" = "re_your-resend-api-key-here" ]; then
        echo "❌ RESEND_API_KEY ist noch der Platzhalter!"
    elif [[ "$RESEND_KEY" =~ ^re_ ]]; then
        echo "✅ RESEND_API_KEY ist gesetzt: ${RESEND_KEY:0:15}..."
    else
        echo "⚠️  RESEND_API_KEY Format sieht falsch aus (sollte mit 're_' beginnen)"
    fi
    
    # Prüfe RESEND_FROM_EMAIL
    FROM_EMAIL=$(grep "^RESEND_FROM_EMAIL=" .env | cut -d'=' -f2)
    if [ -z "$FROM_EMAIL" ]; then
        echo "⚠️  RESEND_FROM_EMAIL nicht gesetzt (wird default 'noreply@inclusions.zone' verwendet)"
    else
        echo "✅ RESEND_FROM_EMAIL: $FROM_EMAIL"
        if [[ "$FROM_EMAIL" != *"@inclusions.zone" ]]; then
            echo "⚠️  FROM_EMAIL sollte @inclusions.zone sein!"
        fi
    fi
    
    # Prüfe RESEND_ADMIN_EMAIL
    ADMIN_EMAIL=$(grep "^RESEND_ADMIN_EMAIL=" .env | cut -d'=' -f2)
    if [ -z "$ADMIN_EMAIL" ]; then
        echo "⚠️  RESEND_ADMIN_EMAIL nicht gesetzt (wird default 'info@inclusions.zone' verwendet)"
    else
        echo "✅ RESEND_ADMIN_EMAIL: $ADMIN_EMAIL"
    fi
    
    echo ""
else
    echo "❌ .env Datei nicht gefunden!"
    echo "   Erstelle sie mit: cp .env.production .env"
    exit 1
fi

# 2. Prüfe ob Next.js läuft und Environment-Variablen geladen sind
echo "2️⃣ Prüfe Next.js Prozess..."
if pgrep -f "next start" > /dev/null; then
    PID=$(pgrep -f "next start" | head -1)
    echo "✅ Next.js läuft (PID: $PID)"
    
    # Prüfe ob Environment-Variablen im Prozess vorhanden sind
    if [ -f /proc/$PID/environ ]; then
        echo ""
        echo "Environment-Variablen im Prozess:"
        if grep -q "RESEND_API_KEY" /proc/$PID/environ 2>/dev/null; then
            echo "✅ RESEND_API_KEY ist im Prozess geladen"
        else
            echo "❌ RESEND_API_KEY ist NICHT im Prozess geladen!"
            echo "   → App muss neu gestartet werden nach .env Änderungen"
        fi
    fi
else
    echo "❌ Next.js läuft NICHT!"
    echo "   Starte mit: cd ~/inclusions-2.0 && npm start > /tmp/next.log 2>&1 &"
fi
echo ""

# 3. Teste Resend API direkt
echo "3️⃣ Teste Resend API..."
if [ -n "$RESEND_KEY" ] && [[ "$RESEND_KEY" =~ ^re_ ]]; then
    echo "   Teste API Key mit Resend API..."
    
    # Teste API Key (ohne E-Mail zu senden)
    RESPONSE=$(curl -s -X GET "https://api.resend.com/domains" \
        -H "Authorization: Bearer $RESEND_KEY" \
        -H "Content-Type: application/json" 2>&1)
    
    if echo "$RESPONSE" | grep -q "inclusions.zone"; then
        echo "✅ API Key funktioniert - Domain inclusions.zone gefunden"
    elif echo "$RESPONSE" | grep -q "unauthorized\|Invalid\|401"; then
        echo "❌ API Key ist ungültig oder abgelaufen!"
    elif echo "$RESPONSE" | grep -q "error"; then
        echo "⚠️  API-Fehler: $RESPONSE"
    else
        echo "⚠️  Unerwartete Antwort von Resend API"
        echo "   Response: ${RESPONSE:0:200}..."
    fi
else
    echo "⚠️  Kann API nicht testen - RESEND_API_KEY fehlt oder ist ungültig"
fi
echo ""

# 4. Prüfe Logs auf Resend-Fehler
echo "4️⃣ Prüfe Logs auf Resend-Fehler..."
if [ -f /tmp/next.log ]; then
    echo "   Suche nach Resend-Fehlern in den letzten 50 Zeilen..."
    ERRORS=$(tail -50 /tmp/next.log | grep -iE "(resend|email|📧|❌)" | tail -10)
    if [ -n "$ERRORS" ]; then
        echo "   Gefundene Fehler:"
        echo "$ERRORS"
    else
        echo "   ✅ Keine Resend-Fehler in den Logs gefunden"
    fi
else
    echo "⚠️  Log-Datei /tmp/next.log nicht gefunden"
fi
echo ""

# 5. Teste Newsletter-API Endpoint
echo "5️⃣ Teste Newsletter-API Endpoint..."
if pgrep -f "next start" > /dev/null; then
    echo "   Sende Test-Request an /api/debug-resend..."
    RESPONSE=$(curl -s http://localhost:3000/api/debug-resend 2>&1)
    
    if echo "$RESPONSE" | grep -q "resendIsNull.*false"; then
        echo "✅ Resend ist korrekt initialisiert"
    elif echo "$RESPONSE" | grep -q "resendIsNull.*true"; then
        echo "❌ Resend ist NULL - API Key wird nicht geladen!"
    else
        echo "⚠️  Unerwartete Antwort: ${RESPONSE:0:200}..."
    fi
else
    echo "⚠️  Next.js läuft nicht - kann API nicht testen"
fi
echo ""

# 6. Zusammenfassung und Empfehlungen
echo "================================"
echo "📊 ZUSAMMENFASSUNG"
echo "================================"
echo ""
echo "Nächste Schritte:"
echo ""

if [ -z "$RESEND_KEY" ] || [ "$RESEND_KEY" = "re_your-resend-api-key-here" ]; then
    echo "1. ❌ RESEND_API_KEY in .env setzen"
    echo "   → Kopiere aus .env.production oder setze manuell"
fi

if ! pgrep -f "next start" > /dev/null; then
    echo "2. ❌ Next.js App starten"
    echo "   → cd ~/inclusions-2.0 && npm start > /tmp/next.log 2>&1 &"
elif [ -f /proc/$(pgrep -f "next start" | head -1)/environ ] && ! grep -q "RESEND_API_KEY" /proc/$(pgrep -f "next start" | head -1)/environ 2>/dev/null; then
    echo "2. ⚠️  App neu starten (Environment-Variablen wurden geändert)"
    echo "   → pkill -f 'next start' && cd ~/inclusions-2.0 && npm start > /tmp/next.log 2>&1 &"
fi

echo ""
echo "3. ✅ Prüfe Resend Dashboard:"
echo "   → https://resend.com/domains"
echo "   → Domain inclusions.zone sollte 'Verified' sein"
echo "   → Prüfe, ob noreply@inclusions.zone als verifizierte E-Mail-Adresse angezeigt wird"
echo ""
echo "4. ✅ Teste Newsletter-Anmeldung auf der Website"
echo ""
echo "5. ✅ Prüfe Logs live:"
echo "   → tail -f /tmp/next.log"
echo ""
