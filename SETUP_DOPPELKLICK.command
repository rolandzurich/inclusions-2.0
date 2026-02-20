#!/bin/bash
# Doppelklick mich! PostgreSQL wird automatisch eingerichtet.
# macOS .command Dateien können direkt doppelgeklickt werden

cd "$(dirname "$0")"

echo "═══════════════════════════════════════"
echo "  INCLUSIONS V2 - PostgreSQL Setup"
echo "═══════════════════════════════════════"
echo ""
echo "🚀 Richte PostgreSQL auf Server ein..."
echo "Server: 10.55.55.155"
echo ""

# Prüfe ob Setup-Skript existiert
if [ ! -f "postgresql-setup-server.sh" ]; then
    echo "❌ postgresql-setup-server.sh nicht gefunden!"
    exit 1
fi

# Kopiere Skript zum Server und führe aus
echo "📤 Kopiere Setup-Skript zum Server..."
echo ""

scp -o StrictHostKeyChecking=no postgresql-setup-server.sh incluzone@10.55.55.155:/tmp/pg_setup.sh

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Kopieren fehlgeschlagen"
    echo ""
    echo "📝 Manuelle Lösung:"
    echo "1. Öffne EINFACHE_LOESUNG.md"
    echo "2. Folge den Schritten dort (einmaliger Copy & Paste)"
    echo ""
    read -p "Drücke Enter zum Schließen..."
    exit 1
fi

echo ""
echo "🔧 Führe Setup auf Server aus..."
echo ""

ssh -o StrictHostKeyChecking=no incluzone@10.55.55.155 "bash /tmp/pg_setup.sh"

if [ $? -eq 0 ]; then
    echo ""
    echo "═══════════════════════════════════════"
    echo "✅ ERFOLG! PostgreSQL ist bereit!"
    echo "═══════════════════════════════════════"
    echo ""
    echo "📊 Verbindungs-Details:"
    echo "   Host: 10.55.55.155"
    echo "   Port: 5432"
    echo "   Datenbank: inclusions_db"
    echo "   User: inclusions_user"
    echo ""
    echo "🌐 Nächste Schritte:"
    echo "1. Starte Dev-Server: npm run dev"
    echo "2. Öffne: http://localhost:3000/admin-v2/init-db"
    echo "3. Klicke auf 'Datenbank jetzt initialisieren'"
    echo ""
else
    echo ""
    echo "❌ Setup fehlgeschlagen"
    echo ""
    echo "📝 Manuelle Lösung:"
    echo "Öffne EINFACHE_LOESUNG.md für Anleitung"
    echo ""
fi

read -p "Drücke Enter zum Schließen..."
