#!/bin/bash

# Teste Resend direkt auf dem Server
# Führe aus: ssh incluzone@10.55.55.155 "bash -s" < test-resend-direct.sh

echo "🔍 Teste Resend-Konfiguration direkt auf Server..."
echo ""

cd ~/inclusions-2.0 || { echo "❌ Verzeichnis nicht gefunden!"; exit 1; }

# 1. Prüfe .env
echo "1️⃣ Prüfe Environment-Variablen..."
if [ -f .env ]; then
    RESEND_KEY=$(grep "^RESEND_API_KEY=" .env | cut -d'=' -f2)
    FROM_EMAIL=$(grep "^RESEND_FROM_EMAIL=" .env | cut -d'=' -f2)
    ADMIN_EMAIL=$(grep "^RESEND_ADMIN_EMAIL=" .env | cut -d'=' -f2)
    
    echo "   RESEND_API_KEY: ${RESEND_KEY:0:15}..."
    echo "   RESEND_FROM_EMAIL: $FROM_EMAIL"
    echo "   RESEND_ADMIN_EMAIL: $ADMIN_EMAIL"
else
    echo "❌ .env Datei nicht gefunden!"
    exit 1
fi
echo ""

# 2. Teste API direkt auf localhost
echo "2️⃣ Teste API-Endpoint direkt auf localhost:3000..."
RESPONSE=$(curl -s http://localhost:3000/api/debug-resend 2>&1)

if echo "$RESPONSE" | grep -q "resendIsNull"; then
    echo "✅ API-Endpoint antwortet!"
    echo ""
    echo "Response:"
    echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
else
    echo "❌ API-Endpoint antwortet nicht korrekt"
    echo "Response: ${RESPONSE:0:200}..."
fi
echo ""

# 3. Prüfe ob Next.js läuft
echo "3️⃣ Prüfe Next.js Status..."
if pgrep -f 'next start' > /dev/null; then
    PID=$(pgrep -f 'next start' | head -1)
    echo "✅ Next.js läuft (PID: $PID)"
    
    # Prüfe ob Environment-Variablen geladen sind
    if [ -f /proc/$PID/environ ]; then
        if grep -q "RESEND_API_KEY" /proc/$PID/environ 2>/dev/null; then
            echo "✅ RESEND_API_KEY ist im Prozess geladen"
        else
            echo "❌ RESEND_API_KEY ist NICHT im Prozess geladen!"
            echo "   → App muss neu gestartet werden"
        fi
    fi
else
    echo "❌ Next.js läuft NICHT!"
fi
echo ""

# 4. Prüfe Logs
echo "4️⃣ Letzte Log-Zeilen:"
tail -10 /tmp/next.log 2>/dev/null || echo "Keine Logs gefunden"
echo ""

echo "✅ Test abgeschlossen!"
