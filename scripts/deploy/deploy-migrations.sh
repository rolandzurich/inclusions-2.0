#!/bin/bash
# ============================================================
# DB-MIGRATIONEN DEPLOYEN – Inclusions 2.0
# ============================================================
# Führt ausstehende Migrationen auf dem Server aus.
# Nutzt die API (App muss laufen) oder direkt psql.
#
# Verwendung:
#   ./scripts/deploy/deploy-migrations.sh              # Normal
#   ./scripts/deploy/deploy-migrations.sh --dry-run    # Simulation
# ============================================================

set -euo pipefail

# Konfiguration
SERVER_IP="10.55.55.155"
SERVER_USER="incluzone"
SERVER_PATH="/home/incluzone/inclusions-2.0"
SSH_KEY="$HOME/.ssh/inclusions_server"

# Farben
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

DRY_RUN=""
if [ "${1:-}" = "--dry-run" ]; then
  DRY_RUN="?dry_run=true"
  echo -e "${YELLOW}🔍 DRY RUN – Nur Simulation${NC}"
fi

ssh_cmd() {
  if [ -f "$SSH_KEY" ]; then
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "$1"
  else
    ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "$1"
  fi
}

echo ""
echo "=========================================="
echo "  📦 DB-Migrationen deployen"
echo "=========================================="
echo ""

# 1. Migrationsfiles hochladen
echo -e "${GREEN}1/3${NC} Migrationsfiles hochladen..."
if [ -f "$SSH_KEY" ]; then
  scp -i "$SSH_KEY" -o StrictHostKeyChecking=no -r backend/migrations/ "$SERVER_USER@$SERVER_IP:$SERVER_PATH/backend/"
else
  scp -o StrictHostKeyChecking=no -r backend/migrations/ "$SERVER_USER@$SERVER_IP:$SERVER_PATH/backend/"
fi
echo "  ✅ Migrationsfiles übertragen"

# 2. Status prüfen
echo -e "${GREEN}2/3${NC} Prüfe aktuellen Status..."
RESPONSE=$(ssh_cmd "curl -s http://localhost:3000/api/admin-v2/migrations")
echo "  Status: $RESPONSE" | head -c 200
echo ""

# 3. Migrationen ausführen
echo -e "${GREEN}3/3${NC} Führe Migrationen aus..."
RESULT=$(ssh_cmd "curl -s -X POST http://localhost:3000/api/admin-v2/migrations${DRY_RUN}")
echo "  Ergebnis: $RESULT" | head -c 500
echo ""

echo ""
echo -e "${GREEN}✅ Migrationen abgeschlossen!${NC}"
echo ""
