#!/bin/bash

# Wrapper für SSH-Befehle - verwendet sshpass falls verfügbar, sonst expect
# Usage: ./execute-on-server.sh "command"

SERVER="10.55.55.155"
USER="incluzone"
PASSWORD="13vor12!Asdf"
COMMAND="$1"

if command -v sshpass &> /dev/null; then
    # Verwende sshpass (einfacher)
    sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$USER@$SERVER" "$COMMAND"
else
    # Fallback zu expect
    expect << EOF
set timeout 300
spawn ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null $USER@$SERVER $COMMAND
expect {
    "password:" { send "$PASSWORD\r"; exp_continue }
    "Password:" { send "$PASSWORD\r"; exp_continue }
    "(yes/no)?" { send "yes\r"; exp_continue }
    eof
}
wait
EOF
fi
