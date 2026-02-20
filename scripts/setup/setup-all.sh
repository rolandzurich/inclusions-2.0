#!/bin/bash

# Komplettes Setup: SSH-Key + Datenbank
# Führe aus, sobald die Netzwerkverbindung funktioniert

SERVER="10.55.55.155"
USER="incluzone"
PASSWORD="13vor12!Asdf"
SSH_KEY_PATH="$HOME/.ssh/inclusions_server"

echo "🚀 Komplettes Setup: SSH + Datenbank"
echo ""

# 1. SSH-Key Setup
echo "📋 Schritt 1: SSH-Key Setup..."
if [ -f "$SSH_KEY_PATH" ]; then
    echo "✅ SSH-Key vorhanden"
    
    # Versuche Key zu kopieren
    echo "📋 Kopiere Key auf Server..."
    if command -v sshpass &> /dev/null; then
        sshpass -p "$PASSWORD" ssh-copy-id -i "$SSH_KEY_PATH.pub" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$USER@$SERVER" 2>&1 | grep -v "Warning" || true
    else
        cat "$SSH_KEY_PATH.pub" | ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$USER@$SERVER" \
            "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys" 2>&1 || true
    fi
else
    echo "⚠️  SSH-Key nicht gefunden. Erstelle neuen..."
    ssh-keygen -t ed25519 -f "$SSH_KEY_PATH" -N "" -C "inclusions-server-$(date +%Y%m%d)"
    cat "$SSH_KEY_PATH.pub" | ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$USER@$SERVER" \
        "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys" 2>&1 || true
fi

# 2. Teste SSH-Verbindung
echo ""
echo "🔍 Teste SSH-Verbindung..."
if ssh -i "$SSH_KEY_PATH" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ConnectTimeout=10 "$USER@$SERVER" "echo 'OK'" 2>&1 | grep -q "OK"; then
    echo "✅ SSH-Verbindung funktioniert!"
    SSH_WORKING=true
else
    echo "⚠️  SSH-Verbindung fehlgeschlagen - verwende Passwort-Authentifizierung"
    SSH_WORKING=false
fi

# 3. Datenbank-Setup auf Server ausführen
echo ""
echo "📋 Schritt 2: Datenbank-Setup auf Server..."

if [ "$SSH_WORKING" = true ]; then
    # Mit SSH-Key
    echo "   Verwende SSH-Key-Authentifizierung..."
    ssh -i "$SSH_KEY_PATH" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$USER@$SERVER" "bash -s" < install-database.sh
else
    # Mit Passwort
    echo "   Verwende Passwort-Authentifizierung..."
    if command -v sshpass &> /dev/null; then
        sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$USER@$SERVER" "bash -s" < install-database.sh
    else
        echo "⚠️  sshpass nicht verfügbar. Führe install-database.sh manuell auf dem Server aus."
        echo "   Oder installiere sshpass: brew install sshpass (macOS) oder apt-get install sshpass (Linux)"
    fi
fi

echo ""
echo "✅ Setup abgeschlossen!"
