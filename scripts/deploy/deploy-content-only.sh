#!/bin/bash
# Quick Deploy: Nur data/ + public/ (Texte, Bilder) – kein Build nötig
# Für: Line-up, content.json, Bilder
set -e

SERVER="10.55.55.155"
USER="incluzone"
REMOTE_DIR="/home/incluzone/inclusions-2.0"
SSH_KEY="$HOME/.ssh/inclusions_server"
cd "$(dirname "$0")"

REMOTE="${USER}@${SERVER}:${REMOTE_DIR}"
SSH_E="ssh -i $SSH_KEY -o StrictHostKeyChecking=no"

echo "📤 Lade data/ + public/ hoch..."
if command -v rsync &>/dev/null; then
  rsync -avz -e "$SSH_E" data/ "$REMOTE/data/"
  rsync -avz -e "$SSH_E" public/ "$REMOTE/public/"
else
  scp -i "$SSH_KEY" -o StrictHostKeyChecking=no -r data public ${USER}@${SERVER}:${REMOTE_DIR}/
fi

echo "🔄 PM2 restart..."
$SSH_E ${USER}@${SERVER} "cd ${REMOTE_DIR} && pm2 restart all"

echo "✅ Fertig: https://inclusions.zone"
