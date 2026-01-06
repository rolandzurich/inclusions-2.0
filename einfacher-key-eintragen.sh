#!/bin/bash

echo "🔑 API-Key eintragen - GANZ EINFACH"
echo ""
echo "Gib mir einfach deinen API-Key (den du von resend.com kopiert hast)"
echo "Er beginnt mit 're_' und ist lang"
echo ""
echo "Einfach hier einfügen und Enter drücken:"
read -r KEY

if [[ $KEY =~ ^re_ ]] && [ ${#KEY} -gt 20 ]; then
    echo ""
    echo "✅ Key sieht gut aus!"
    echo "📝 Trage ihn jetzt ein..."
    
    # Backup
    cp .env.local .env.local.backup 2>/dev/null
    
    # Ersetzen
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s|RESEND_API_KEY=.*|RESEND_API_KEY=$KEY|g" .env.local
    else
        sed -i "s|RESEND_API_KEY=.*|RESEND_API_KEY=$KEY|g" .env.local
    fi
    
    echo "✅ Fertig! Key wurde eingetragen."
    echo ""
    echo "🔄 Starte Server neu..."
    pkill -f "next dev" 2>/dev/null
    sleep 2
    npm run dev > /tmp/nextjs-dev.log 2>&1 &
    echo "⏳ Warte 10 Sekunden..."
    sleep 10
    echo ""
    echo "🧪 Teste jetzt..."
    curl -s "http://localhost:3000/api/test-email?email=test@example.com" | python3 -m json.tool 2>/dev/null | head -20
    echo ""
    echo "✅ FERTIG! Alles sollte jetzt funktionieren!"
else
    echo "❌ Der Key sieht nicht richtig aus. Bitte nochmal versuchen."
fi
