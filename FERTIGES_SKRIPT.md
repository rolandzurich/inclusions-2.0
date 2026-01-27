# FERTIGES SKRIPT - Kopiere alles ab "#!/bin/bash" bis "EOF"

## Auf dem Server ausführen:

```bash
cat > /tmp/fix-server.sh << 'EOF'
#!/bin/bash
set -e

echo "=== Konfiguriere Server für 10.55.55.155 ==="
echo ""

echo "🔍 Schritt 1: Aktualisiere Nginx-Konfiguration..."
sudo sed -i 's/server_name .*/server_name 10.55.55.155 _;/' /etc/nginx/sites-available/inclusions
echo "✅ Konfiguration aktualisiert"

echo ""
echo "🔍 Schritt 2: Prüfe Nginx-Konfiguration..."
if sudo nginx -t 2>&1 | grep -q "successful"; then
    echo "✅ Nginx-Konfiguration ist gültig"
    echo ""
    echo "🔄 Schritt 3: Lade Nginx neu..."
    sudo systemctl reload nginx
    echo "✅ Nginx neu geladen"
else
    echo "❌ Nginx-Konfiguration hat Fehler!"
    sudo nginx -t
    exit 1
fi

echo ""
echo "🔥 Schritt 4: Öffne Port 80..."
if command -v ufw &> /dev/null; then
    sudo ufw allow 80/tcp 2>/dev/null || true
    echo "✅ Port 80 geöffnet"
else
    echo "⚠️  UFW nicht verfügbar"
fi

echo ""
echo "🔍 Schritt 5: Prüfe Next.js App..."
cd ~/inclusions-2.0
if pgrep -f "next start" > /dev/null; then
    echo "✅ Next.js App läuft bereits"
else
    echo "⚠️  Starte App..."
    pkill -f "next start" 2>/dev/null || true
    npm start > /tmp/next.log 2>&1 &
    sleep 3
    if pgrep -f "next start" > /dev/null; then
        echo "✅ Next.js App gestartet"
    else
        echo "❌ App konnte nicht gestartet werden"
        echo "   Prüfe Logs: tail -20 /tmp/next.log"
    fi
fi

echo ""
echo "=== ✅ FERTIG ==="
echo ""
echo "Die Seite sollte jetzt erreichbar sein unter:"
echo "  http://10.55.55.155"
echo ""
echo "Teste es jetzt ohne VPN!"
EOF

chmod +x /tmp/fix-server.sh
bash /tmp/fix-server.sh
```

**Das war's!** Ein Befehl, alles automatisch.
