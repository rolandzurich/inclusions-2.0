#!/bin/bash

# Einfaches Script zum Kopieren des SSH-Keys auf den Server

SERVER="10.55.55.155"
USER="incluzone"
PASSWORD="13vor12!Asdf"
PUBKEY_FILE="$HOME/.ssh/inclusions_server.pub"

echo "🔑 Kopiere SSH-Key auf Server..."
echo ""

# Lese Public Key
if [ ! -f "$PUBKEY_FILE" ]; then
    echo "❌ Public Key nicht gefunden: $PUBKEY_FILE"
    exit 1
fi

PUBKEY=$(cat "$PUBKEY_FILE")

# Verwende Python für SSH mit Passwort
python3 << PYTHON_SCRIPT
import pexpect
import sys

server = "$SERVER"
user = "$USER"
password = "$PASSWORD"
pubkey = """$PUBKEY"""

print("📋 Verbinde mit Server...")
child = pexpect.spawn(f'ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null {user}@{server} "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys && echo DONE"', timeout=30)

child.expect(['password:', 'Password:', pexpect.EOF])
if child.after != pexpect.EOF:
    child.sendline(password)
    child.expect(['DONE', pexpect.EOF])
    
    # Füge Key hinzu
    child2 = pexpect.spawn(f'ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null {user}@{server} "echo \'{pubkey}\' >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys && echo DONE"', timeout=30)
    child2.expect(['password:', 'Password:', pexpect.EOF])
    if child2.after != pexpect.EOF:
        child2.sendline(password)
        child2.expect(['DONE', pexpect.EOF])
        print("✅ SSH-Key erfolgreich kopiert!")
    else:
        print("✅ Key hinzugefügt")
else:
    print("⚠️  Verbindung fehlgeschlagen")
    sys.exit(1)
PYTHON_SCRIPT

echo ""
echo "🔍 Teste SSH-Verbindung..."
if ssh -i ~/.ssh/inclusions_server -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ConnectTimeout=10 "$USER@$SERVER" "echo 'SSH-Verbindung erfolgreich!'" 2>&1; then
    echo "✅ SSH-Verbindung funktioniert!"
    echo ""
    echo "💡 Du kannst jetzt ohne Passwort verbinden:"
    echo "   ssh -i ~/.ssh/inclusions_server $USER@$SERVER"
else
    echo "⚠️  SSH-Verbindungstest fehlgeschlagen"
    echo "   Versuche manuell:"
    echo "   ssh-copy-id -i $PUBKEY_FILE $USER@$SERVER"
fi
