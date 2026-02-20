#!/bin/bash
# Deployment aller Änderungen (Line-up, Event-Seite, DJ Pair) auf den Server
# Verwendet server.md Zugangsdaten

set -e

SERVER="10.55.55.155"
USER="incluzone"
PASSWORD="13vor12!Asdf"
REMOTE_DIR="/home/incluzone/inclusions-2.0"
SSH_KEY="$HOME/.ssh/inclusions_server"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

SSH_OPTS="-o StrictHostKeyChecking=no -o ConnectTimeout=15"
run_scp() {
    if [ -f "$SSH_KEY" ]; then
        scp -i "$SSH_KEY" $SSH_OPTS "$@"
    else
        sshpass -p "$PASSWORD" scp $SSH_OPTS "$@"
    fi
}
run_ssh() {
    if [ -f "$SSH_KEY" ]; then
        ssh -i "$SSH_KEY" $SSH_OPTS "$@"
    else
        sshpass -p "$PASSWORD" ssh $SSH_OPTS "$@"
    fi
}

[ -f "$SSH_KEY" ] && echo "Verwende SSH-Key" || echo "Verwende Passwort-Auth"

echo "═══════════════════════════════════════════"
echo "  Deploy: Line-up, Events, DJ Pair"
echo "═══════════════════════════════════════════"
echo ""

# 1. Dateien hochladen
echo "📤 1. Lade geänderte Dateien hoch..."
run_scp app/page.tsx ${USER}@${SERVER}:${REMOTE_DIR}/app/
run_scp app/events/page.tsx ${USER}@${SERVER}:${REMOTE_DIR}/app/events/
run_scp data/djs.json ${USER}@${SERVER}:${REMOTE_DIR}/data/
run_scp public/images/miniart-sandro.png ${USER}@${SERVER}:${REMOTE_DIR}/public/images/

echo "✅ Dateien hochgeladen"
echo ""

# 2. Auf Server bauen und neu starten
echo "📦 2. Baue auf Server und starte neu..."
run_ssh ${USER}@${SERVER} << 'ENDSSH'
cd /home/incluzone/inclusions-2.0
echo "npm run build (mit mehr Heap für Server mit wenig RAM)..."
NODE_OPTIONS="--max-old-space-size=1024" npm run build
echo "PM2 restart..."
pm2 restart all
sleep 2
pm2 status
echo ""
echo "✅ Deployment abgeschlossen!"
ENDSSH

echo ""
echo "═══════════════════════════════════════════"
echo "  ✅ Live: https://inclusions.zone"
echo "═══════════════════════════════════════════"
