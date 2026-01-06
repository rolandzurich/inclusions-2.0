#!/bin/bash

echo "🔍 Prüfe RESEND_API_KEY..."

if grep -q "RESEND_API_KEY=re_your-resend-api-key-here" .env.local 2>/dev/null; then
    echo "❌ RESEND_API_KEY ist noch nicht gesetzt (Platzhalter gefunden)"
    echo ""
    echo "📝 Bitte:"
    echo "1. Öffne: https://resend.com/api-keys"
    echo "2. Erstelle einen neuen API Key"
    echo "3. Kopiere den Key"
    echo "4. Öffne .env.local und ersetze:"
    echo "   RESEND_API_KEY=re_your-resend-api-key-here"
    echo "   durch deinen echten Key"
    echo ""
    echo "5. Führe dann aus: ./check-resend-key.sh"
    exit 1
elif grep -q "RESEND_API_KEY=re_" .env.local 2>/dev/null; then
    KEY=$(grep "RESEND_API_KEY=" .env.local | cut -d'=' -f2)
    echo "✅ RESEND_API_KEY ist gesetzt: ${KEY:0:10}..."
    echo ""
    echo "🔄 Starte Server neu..."
    pkill -f "next dev" 2>/dev/null
    sleep 2
    npm run dev > /tmp/nextjs-dev.log 2>&1 &
    echo "✅ Server wird neu gestartet..."
    echo "⏳ Warte 10 Sekunden..."
    sleep 10
    echo ""
    echo "🧪 Teste E-Mail-Funktion..."
    curl -s "http://localhost:3000/api/test-email?email=test@example.com" | python3 -m json.tool 2>/dev/null | head -20
    echo ""
    echo "✅ Fertig! Server läuft auf http://localhost:3000"
else
    echo "⚠️ RESEND_API_KEY nicht gefunden in .env.local"
    exit 1
fi

