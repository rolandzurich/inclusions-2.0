#!/bin/bash

# Script zum Einrichten von SSH-Key-Authentifizierung für den Server

SERVER="10.55.55.155"
USER="incluzone"
PASSWORD="13vor12!Asdf"
SSH_KEY_PATH="$HOME/.ssh/inclusions_server"

echo "🔑 Richte SSH-Key-Authentifizierung ein..."
echo ""

# 1. Prüfe ob SSH-Key existiert
if [ ! -f "$SSH_KEY_PATH" ]; then
    echo "📝 Erstelle neuen SSH-Key..."
    ssh-keygen -t rsa -b 4096 -f "$SSH_KEY_PATH" -N "" -C "inclusions-server-key"
    echo "✅ SSH-Key erstellt"
else
    echo "✅ SSH-Key bereits vorhanden: $SSH_KEY_PATH"
fi

# 2. Kopiere Public Key auf Server
echo ""
echo "📋 Kopiere Public Key auf Server..."

# Verwende sshpass falls verfügbar, sonst expect
if command -v sshpass &> /dev/null; then
    sshpass -p "$PASSWORD" ssh-copy-id -i "$SSH_KEY_PATH.pub" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$USER@$SERVER" 2>&1 | grep -v "Warning" || true
else
    # Verwende expect für ssh-copy-id
    expect << EOF
set timeout 30
spawn ssh-copy-id -i $SSH_KEY_PATH.pub -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null $USER@$SERVER
expect {
    "password:" {
        send "$PASSWORD\r"
        exp_continue
    }
    "Password:" {
        send "$PASSWORD\r"
        exp_continue
    }
    "(yes/no)?" {
        send "yes\r"
        exp_continue
    }
    eof
}
wait
EOF
fi

echo "✅ Public Key auf Server kopiert"
echo ""

# 3. Teste Verbindung
echo "🔍 Teste SSH-Verbindung..."
if ssh -i "$SSH_KEY_PATH" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ConnectTimeout=10 "$USER@$SERVER" "echo 'SSH-Verbindung erfolgreich!'" 2>&1; then
    echo "✅ SSH-Verbindung funktioniert!"
    echo ""
    echo "💡 Du kannst jetzt ohne Passwort verbinden:"
    echo "   ssh -i $SSH_KEY_PATH $USER@$SERVER"
else
    echo "⚠️  SSH-Verbindungstest fehlgeschlagen"
    echo "   Versuche manuell: ssh-copy-id -i $SSH_KEY_PATH.pub $USER@$SERVER"
fi
