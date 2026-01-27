# Einfache Lösung: Wenn du bereits auf dem Server eingeloggt bist

## Kopiere diesen EINEN Befehl und füge ihn ein:

```bash
bash << 'EOF'
echo "=== Konfiguriere Server für 10.55.55.155 ==="
sudo sed -i 's/server_name .*/server_name 10.55.55.155 _;/' /etc/nginx/sites-available/inclusions
sudo nginx -t && sudo systemctl reload nginx && echo "✅ Nginx aktualisiert"
sudo ufw allow 80/tcp 2>/dev/null || true
cd ~/inclusions-2.0 && pgrep -f 'next start' > /dev/null || (pkill -f 'next start' 2>/dev/null; npm start > /tmp/next.log 2>&1 &)
echo "✅ Fertig! Teste: http://10.55.55.155"
EOF
```

**Das war's!** Ein Befehl, alles automatisch.
