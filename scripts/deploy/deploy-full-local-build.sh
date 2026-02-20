#!/bin/bash
# Full Deploy: Lokal bauen, dann hochladen (Server hat zu wenig RAM für Build)
set -e

SERVER="10.55.55.155"
USER="incluzone"
REMOTE_DIR="/home/incluzone/inclusions-2.0"
SSH_KEY="$HOME/.ssh/inclusions_server"
cd "$(dirname "$0")"

echo "📦 1. Baue lokal..."
npm run build

echo ""
echo "📤 2. Lade hoch (app, lib, data, public, .next)..."
echo "Hinweis: rsync auf Server prüfen – falls fehlt, wird scp verwendet"
scp -i "$SSH_KEY" -o StrictHostKeyChecking=no -r \
  app lib data public .next ${USER}@${SERVER}:${REMOTE_DIR}/

echo ""
echo "🔄 3. PM2 neu starten..."
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no ${USER}@${SERVER} \
  "cd ${REMOTE_DIR} && pm2 restart all"

echo ""
echo "✅ Live: https://inclusions.zone"
