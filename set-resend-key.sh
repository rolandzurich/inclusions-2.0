#!/bin/bash

echo "🔑 RESEND_API_KEY eintragen"
echo ""
echo "Bitte gib deinen Resend API-Key ein (beginnt mit 're_'):"
read -r API_KEY

if [[ ! $API_KEY =~ ^re_ ]]; then
    echo "❌ Fehler: Der Key muss mit 're_' beginnen"
    exit 1
fi

if [ ${#API_KEY} -lt 20 ]; then
    echo "❌ Fehler: Der Key scheint zu kurz zu sein"
    exit 1
fi

echo ""
echo "📝 Trage Key in .env.local ein..."

# Backup erstellen
cp .env.local .env.local.backup 2>/dev/null

# Key ersetzen
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s|RESEND_API_KEY=re_your-resend-api-key-here|RESEND_API_KEY=$API_KEY|g" .env.local
else
    # Linux
    sed -i "s|RESEND_API_KEY=re_your-resend-api-key-here|RESEND_API_KEY=$API_KEY|g" .env.local
fi

if grep -q "RESEND_API_KEY=$API_KEY" .env.local; then
    echo "✅ Key erfolgreich eingetragen!"
    echo ""
    echo "🔄 Starte Server neu..."
    pkill -f "next dev" 2>/dev/null
    sleep 2
    npm run dev > /tmp/nextjs-dev.log 2>&1 &
    echo "⏳ Warte 10 Sekunden auf Server-Start..."
    sleep 10
    echo ""
    echo "🧪 Teste E-Mail-Funktion..."
    curl -s "http://localhost:3000/api/test-email?email=test@example.com" | python3 -m json.tool 2>/dev/null | head -20
    echo ""
    echo "✅ Fertig! Server läuft auf http://localhost:3000"
    echo "✅ E-Mails sollten jetzt funktionieren!"
else
    echo "❌ Fehler beim Eintragen des Keys"
    exit 1
fi


