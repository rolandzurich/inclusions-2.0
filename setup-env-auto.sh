#!/bin/bash
# Automatisches Setup ohne expect - verwendet sshpass oder interaktive Eingabe

SERVER="10.55.55.155"
USER="incluzone"
PASSWORD="13vor12!Asdf"
REMOTE_DIR="/home/incluzone/inclusions-2.0"
LOCAL_ENV=".env.production"

echo "=== Automatisches Environment-Setup ==="
echo ""

# Prüfe ob sshpass verfügbar ist
if command -v sshpass &> /dev/null; then
    echo "✅ sshpass gefunden - verwende automatische Authentifizierung"
    USE_SSHPASS=true
else
    echo "⚠️  sshpass nicht gefunden - verwende interaktive Eingabe"
    echo "   (Du musst das Passwort einmal eingeben: $PASSWORD)"
    USE_SSHPASS=false
fi

# 1. Prüfe lokale Datei
if [ ! -f "$LOCAL_ENV" ]; then
    echo "❌ Fehler: $LOCAL_ENV nicht gefunden!"
    exit 1
fi

echo "✅ Lokale .env Datei gefunden"
echo ""

# 2. Kopiere .env auf Server
echo "📤 Kopiere .env auf Server..."

if [ "$USE_SSHPASS" = true ]; then
    cat "$LOCAL_ENV" | sshpass -p "$PASSWORD" scp -o StrictHostKeyChecking=no - "$USER@$SERVER:$REMOTE_DIR/.env"
else
    scp -o StrictHostKeyChecking=no "$LOCAL_ENV" "$USER@$SERVER:$REMOTE_DIR/.env"
fi

if [ $? -eq 0 ]; then
    echo "✅ .env erfolgreich kopiert"
else
    echo "❌ Fehler beim Kopieren!"
    exit 1
fi

echo ""

# 3. Prüfe Keys auf Server
echo "🔍 Prüfe Keys auf Server..."

if [ "$USE_SSHPASS" = true ]; then
    sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no "$USER@$SERVER" "cd $REMOTE_DIR && grep -E 'RESEND_API_KEY|GEMINI_API_KEY' .env"
else
    ssh -o StrictHostKeyChecking=no "$USER@$SERVER" "cd $REMOTE_DIR && grep -E 'RESEND_API_KEY|GEMINI_API_KEY' .env"
fi

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

if [ "$USE_SSHPASS" = true ]; then
    sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no "$USER@$SERVER" "cd $REMOTE_DIR && pkill -f 'next start' && sleep 2 && npm start > /tmp/next.log 2>&1 &"
else
    ssh -o StrictHostKeyChecking=no "$USER@$SERVER" "cd $REMOTE_DIR && pkill -f 'next start' && sleep 2 && npm start > /tmp/next.log 2>&1 &"
fi

if [ $? -eq 0 ]; then
    echo "✅ App neu gestartet"
else
    echo "⚠️  Warnung: App-Neustart könnte fehlgeschlagen sein"
fi

echo ""
echo "=== Fertig! ==="
echo ""
echo "Teste jetzt:"
echo "1. Voice Agent: http://10.55.55.155 - Teste INCLUSI"
echo "2. E-Mail: Teste Kontaktformular"
