#!/bin/bash

# Komplettes SSH-Setup für den Server
# Führe aus, sobald die Netzwerkverbindung wieder funktioniert

SERVER="10.55.55.155"
USER="incluzone"
PASSWORD="13vor12!Asdf"
SSH_KEY_PATH="$HOME/.ssh/inclusions_server"

echo "🔑 SSH-Setup für Server $SERVER"
echo ""

# 1. Prüfe ob SSH-Key existiert
if [ ! -f "$SSH_KEY_PATH" ]; then
    echo "📝 Erstelle neuen SSH-Key..."
    ssh-keygen -t ed25519 -f "$SSH_KEY_PATH" -N "" -C "inclusions-server-$(date +%Y%m%d)"
    echo "✅ SSH-Key erstellt"
else
    echo "✅ SSH-Key bereits vorhanden: $SSH_KEY_PATH"
fi

# 2. Zeige Public Key
echo ""
echo "📋 Dein Public Key:"
cat "$SSH_KEY_PATH.pub"
echo ""

# 3. Kopiere Key auf Server (mit Passwort)
echo "📋 Kopiere Public Key auf Server..."
echo "   (Du wirst nach dem Passwort gefragt: $PASSWORD)"
echo ""

# Versuche verschiedene Methoden
if command -v sshpass &> /dev/null; then
    echo "   Verwende sshpass..."
    sshpass -p "$PASSWORD" ssh-copy-id -i "$SSH_KEY_PATH.pub" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$USER@$SERVER" 2>&1 | grep -v "Warning" || true
elif command -v expect &> /dev/null; then
    echo "   Verwende expect..."
    expect << EOF
set timeout 30
spawn ssh-copy-id -i $SSH_KEY_PATH.pub -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null $USER@$SERVER
expect {
    "password:" { send "$PASSWORD\r"; exp_continue }
    "Password:" { send "$PASSWORD\r"; exp_continue }
    "(yes/no)?" { send "yes\r"; exp_continue }
    eof
}
wait
EOF
else
    echo "   Manuelle Methode..."
    cat "$SSH_KEY_PATH.pub" | ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$USER@$SERVER" \
        "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
fi

echo ""
echo "✅ Public Key kopiert"
echo ""

# 4. Erstelle SSH-Config für einfacheren Zugriff
echo "📋 Erstelle SSH-Config..."
SSH_CONFIG="$HOME/.ssh/config"
mkdir -p ~/.ssh
chmod 700 ~/.ssh

if ! grep -q "Host inclusions-server" "$SSH_CONFIG" 2>/dev/null; then
    cat >> "$SSH_CONFIG" << EOF

# Inclusions Server
Host inclusions-server
    HostName $SERVER
    User $USER
    IdentityFile $SSH_KEY_PATH
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null
EOF
    chmod 600 "$SSH_CONFIG"
    echo "✅ SSH-Config erstellt"
    echo ""
    echo "💡 Du kannst jetzt einfach verbinden mit:"
    echo "   ssh inclusions-server"
else
    echo "✅ SSH-Config bereits vorhanden"
fi

# 5. Teste Verbindung
echo ""
echo "🔍 Teste SSH-Verbindung..."
if ssh -i "$SSH_KEY_PATH" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ConnectTimeout=10 "$USER@$SERVER" "echo 'SSH-Verbindung erfolgreich!'" 2>&1; then
    echo "✅ SSH-Verbindung funktioniert!"
    echo ""
    echo "🎉 Setup abgeschlossen!"
    echo ""
    echo "💡 Verwendung:"
    echo "   ssh inclusions-server"
    echo "   oder"
    echo "   ssh -i $SSH_KEY_PATH $USER@$SERVER"
else
    echo "⚠️  SSH-Verbindungstest fehlgeschlagen"
    echo ""
    echo "🔧 Mögliche Probleme:"
    echo "   1. Netzwerkverbindung nicht verfügbar"
    echo "   2. VPN muss aktiviert werden"
    echo "   3. Firewall blockiert Port 22"
    echo ""
    echo "💡 Manuelle Lösung:"
    echo "   1. Verbinde dich manuell: ssh $USER@$SERVER"
    echo "   2. Kopiere diesen Key:"
    cat "$SSH_KEY_PATH.pub"
    echo ""
    echo "   3. Füge ihn hinzu:"
    echo "      mkdir -p ~/.ssh"
    echo "      chmod 700 ~/.ssh"
    echo "      echo '$(cat $SSH_KEY_PATH.pub)' >> ~/.ssh/authorized_keys"
    echo "      chmod 600 ~/.ssh/authorized_keys"
fi
