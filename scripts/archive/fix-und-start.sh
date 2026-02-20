#!/bin/bash
# Behebt weisse Seite: löscht korrupten .next-Cache und startet Dev-Server neu.
# WICHTIG: Stoppe vorher den laufenden Server mit Ctrl+C.

set -e
cd "$(dirname "$0")"

echo ">>> Lösche .next ..."
rm -rf .next

echo ">>> Starte npm run dev ..."
exec npm run dev
