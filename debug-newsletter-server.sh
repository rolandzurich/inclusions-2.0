#!/bin/bash

# Debug-Skript für Newsletter E-Mail-Problem
# Führe dieses Skript auf dem Server aus

echo "🔍 Newsletter E-Mail Debug - Server-Check"
echo "=========================================="
echo ""

# 1. Prüfe ob Next.js läuft
echo "1️⃣ Prüfe ob Next.js läuft..."
if pgrep -f "next start" > /dev/null; then
    echo "✅ Next.js läuft (PID: $(pgrep -f 'next start'))"
else
    echo "❌ Next.js läuft NICHT!"
    echo "   Starte mit: cd ~/inclusions-2.0 && npm start > /tmp/next.log 2>&1 &"
fi
echo ""

# 2. Prüfe Environment-Variablen
echo "2️⃣ Prüfe Environment-Variablen..."
cd ~/inclusions-2.0 2>/dev/null || { echo "❌ Verzeichnis ~/inclusions-2.0 nicht gefunden!"; exit 1; }

if [ -f .env ]; then
    echo "✅ .env Datei gefunden"
    echo ""
    echo "RESEND_API_KEY:"
    grep RESEND_API_KEY .env | head -c 30 && echo "..."
    echo ""
    echo "RESEND_FROM_EMAIL:"
    grep RESEND_FROM_EMAIL .env
    echo ""
    echo "RESEND_ADMIN_EMAIL:"
    grep RESEND_ADMIN_EMAIL .env
    echo ""
    echo "GEMINI_API_KEY:"
    grep GEMINI_API_KEY .env | head -c 30 && echo "..."
    echo ""
    echo "NEXT_PUBLIC_SITE_URL:"
    grep NEXT_PUBLIC_SITE_URL .env
else
    echo "❌ .env Datei NICHT gefunden!"
    echo "   Erstelle sie mit: cp .env.production .env"
fi
echo ""

# 3. Prüfe Logs
echo "3️⃣ Prüfe Logs..."
if [ -f /tmp/next.log ]; then
    echo "✅ Log-Datei gefunden: /tmp/next.log"
    echo ""
    echo "Letzte 20 Zeilen (Newsletter-relevant):"
    echo "----------------------------------------"
    tail -20 /tmp/next.log | grep -E "(Newsletter|newsletter|RESEND|Resend|📧|❌|✅|Error sending)" || echo "Keine Newsletter-relevanten Logs gefunden"
    echo ""
    echo "Alle Fehler der letzten 50 Zeilen:"
    echo "-----------------------------------"
    tail -50 /tmp/next.log | grep -i error || echo "Keine Fehler gefunden"
else
    echo "⚠️  Log-Datei /tmp/next.log nicht gefunden"
    echo "   Next.js läuft möglicherweise ohne Logging"
fi
echo ""

# 4. Prüfe ob Resend konfiguriert ist
echo "4️⃣ Prüfe Resend-Konfiguration..."
if grep -q "RESEND_API_KEY=re_" .env 2>/dev/null && ! grep -q "RESEND_API_KEY=re_your-resend-api-key-here" .env 2>/dev/null; then
    echo "✅ RESEND_API_KEY ist gesetzt"
else
    echo "❌ RESEND_API_KEY ist NICHT korrekt gesetzt!"
    echo "   Prüfe .env Datei"
fi
echo ""

# 5. Teste API-Endpunkt lokal
echo "5️⃣ Teste Newsletter-API lokal..."
echo "   (Dies kann einen Moment dauern...)"
RESULT=$(curl -s -X POST http://localhost:3000/api/newsletter \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "first_name": "Test",
    "last_name": "User",
    "has_disability": false,
    "interests": ["Events"],
    "honeypot": ""
  }' 2>&1)

if [ $? -eq 0 ]; then
    echo "✅ API-Endpunkt antwortet"
    echo "Response: $RESULT"
else
    echo "❌ API-Endpunkt antwortet NICHT"
    echo "   Stelle sicher, dass Next.js läuft"
fi
echo ""

# 6. Zusammenfassung
echo "=========================================="
echo "📊 ZUSAMMENFASSUNG"
echo "=========================================="
echo ""
echo "Nächste Schritte:"
echo "1. Falls RESEND_API_KEY fehlt: Kopiere .env.production zu .env"
echo "2. Falls Next.js nicht läuft: npm start > /tmp/next.log 2>&1 &"
echo "3. Teste Newsletter-Anmeldung auf der Website"
echo "4. Prüfe Logs mit: tail -f /tmp/next.log"
echo "5. Prüfe Resend-Dashboard: https://resend.com/emails"
echo ""
