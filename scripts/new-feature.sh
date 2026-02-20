#!/bin/bash
# ============================================
# INCLUSIONS – Neues Feature starten
# ============================================
# Erstellt einen Feature-Branch mit korrektem Naming.
#
# Nutzung:
#   ./scripts/new-feature.sh email-threads
#   ./scripts/new-feature.sh crm-tags
#   ./scripts/new-feature.sh admin-roles

set -euo pipefail

# Farben
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

if [ -z "${1:-}" ]; then
  echo "Nutzung: $0 <feature-name>"
  echo "Beispiel: $0 email-threads"
  exit 1
fi

FEATURE_NAME="$1"
BRANCH_NAME="feature/$FEATURE_NAME"

echo ""
echo -e "${GREEN}🌿 Neues Feature: ${FEATURE_NAME}${NC}"
echo "======================================"

# Sicherstellen, dass wir auf main sind
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
  echo -e "${YELLOW}⚠️  Aktueller Branch: $CURRENT_BRANCH${NC}"
  echo "   Wechsle zu main..."
  git checkout main
fi

# main aktualisieren
echo "📥 Hole neueste Änderungen..."
git pull origin main 2>/dev/null || echo "   (kein Remote verfügbar, übersprungen)"

# Branch erstellen
echo "🌿 Erstelle Branch: $BRANCH_NAME"
git checkout -b "$BRANCH_NAME"

echo ""
echo -e "${GREEN}✅ Feature-Branch erstellt!${NC}"
echo ""
echo "Nächste Schritte:"
echo "  1. Entwickle dein Feature"
echo "  2. Falls DB-Änderungen nötig: Erstelle eine Migration in backend/migrations/"
echo "  3. Committe mit aussagekräftigen Messages"
echo "  4. Push mit: git push -u origin $BRANCH_NAME"
echo ""
