#!/bin/bash

echo "👀 Überwache .env.local auf RESEND_API_KEY Änderungen..."
echo "Drücke Ctrl+C zum Beenden"
echo ""

while true; do
    if grep -q "RESEND_API_KEY=re_" .env.local 2>/dev/null && ! grep -q "RESEND_API_KEY=re_your-resend-api-key-here" .env.local 2>/dev/null; then
        KEY=$(grep "RESEND_API_KEY=" .env.local | cut -d'=' -f2)
        if [ ${#KEY} -gt 20 ]; then
            echo "✅ RESEND_API_KEY wurde gesetzt!"
            echo "🔄 Starte Server neu..."
            pkill -f "next dev" 2>/dev/null
            sleep 2
            npm run dev > /tmp/nextjs-dev.log 2>&1 &
            echo "⏳ Warte 10 Sekunden auf Server-Start..."
            sleep 10
            echo ""
            echo "🧪 Teste E-Mail-Funktion..."
            curl -s "http://localhost:3000/api/test-email?email=test@example.com" | python3 -m json.tool 2>/dev/null | head -15
            echo ""
            echo "✅ Fertig! Server läuft auf http://localhost:3000"
            echo "✅ E-Mails sollten jetzt funktionieren!"
            break
        fi
    fi
    sleep 2
done


