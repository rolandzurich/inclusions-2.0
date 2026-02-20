#!/bin/bash
# Setup-Skript: Environment-Variablen auf Server kopieren und App neu starten

SERVER="10.55.55.155"
USER="incluzone"
REMOTE_DIR="/home/incluzone/inclusions-2.0"
LOCAL_ENV=".env.production"

echo "=== Environment-Variablen Setup ==="
echo ""

# 1. Prüfe ob lokale .env Datei existiert
if [ ! -f "$LOCAL_ENV" ]; then
    echo "❌ Fehler: $LOCAL_ENV nicht gefunden!"
    exit 1
fi

echo "✅ Lokale .env Datei gefunden"
echo ""

# 2. Kopiere .env auf Server
echo "📤 Kopiere .env auf Server..."
scp "$LOCAL_ENV" "$USER@$SERVER:$REMOTE_DIR/.env"

if [ $? -eq 0 ]; then
    echo "✅ .env erfolgreich kopiert"
else
    echo "❌ Fehler beim Kopieren!"
    exit 1
fi

echo ""

# 3. Prüfe ob Keys auf Server sind
echo "🔍 Prüfe Keys auf Server..."
ssh "$USER@$SERVER" "cd $REMOTE_DIR && grep -E 'RESEND_API_KEY|GEMINI_API_KEY' .env"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Keys gefunden auf Server"
else
    echo "❌ Keys nicht gefunden!"
    exit 1
fi

echo ""

# 4. App neu starten
echo "🔄 Starte App neu..."
ssh "$USER@$SERVER" "cd $REMOTE_DIR && pkill -f 'next start' && sleep 2 && npm start > /tmp/next.log 2>&1 &"

if [ $? -eq 0 ]; then
    echo "✅ App neu gestartet"
else
    echo "⚠️  Warnung: App-Neustart könnte fehlgeschlagen sein"
fi

echo ""
echo "=== Fertig! ==="
echo ""
echo "Prüfe ob es funktioniert:"
echo "1. Voice Agent: http://10.55.55.155 - Teste INCLUSI"
echo "2. E-Mail: Teste Kontaktformular"
echo ""
echo "Logs prüfen:"
echo "ssh $USER@$SERVER 'tail -f /tmp/next.log'"
