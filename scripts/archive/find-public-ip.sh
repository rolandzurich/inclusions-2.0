#!/bin/bash
# Einfaches Skript: Prüft öffentliche IP und zeigt nächste Schritte

echo "=== Öffentliche IP herausfinden ==="
echo ""
echo "Führe auf dem Server aus:"
echo "curl ifconfig.me"
echo ""
echo "Das zeigt dir die öffentliche IP-Adresse."
echo ""
echo "Dann:"
echo "1. Gehe zu deinem Domain-Provider"
echo "2. Erstelle A-Record: inclusions.zone → [DEINE_IP]"
echo "3. Warte 15-30 Minuten"
echo "4. Teste: http://inclusions.zone"
echo ""
echo "Für detaillierte Anleitung siehe: DOMAIN_SETUP.md"
