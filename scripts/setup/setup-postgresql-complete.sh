#!/bin/bash

# PostgreSQL vollständige Einrichtung auf Server
# Server: 10.55.55.155
# User: incluzone

SERVER="10.55.55.155"
USERNAME="incluzone"
PASSWORD="13vor12!Asdf"
DB_NAME="inclusions_db"
DB_USER="inclusions_user"
DB_PASSWORD="inclusions_secure_password_2024!"

SSH_SCRIPT="./ssh-exec-improved.sh"

echo "=========================================="
echo "PostgreSQL vollständige Einrichtung"
echo "=========================================="
echo ""

# Funktion zum Ausführen von SSH-Kommandos
run_ssh() {
    local cmd="$1"
    echo "[EXEC] $cmd"
    $SSH_SCRIPT "$cmd"
    echo ""
}

# 1. Prüfe ob PostgreSQL bereits installiert ist
echo "Schritt 1: Prüfe PostgreSQL Installation..."
run_ssh "which psql || echo 'PostgreSQL nicht gefunden'"

# 2. System aktualisieren und PostgreSQL installieren
echo "Schritt 2: Installiere PostgreSQL..."
run_ssh "sudo apt-get update -qq"
run_ssh "sudo apt-get install -y postgresql postgresql-contrib"

# 3. PostgreSQL starten und aktivieren
echo "Schritt 3: Starte und aktiviere PostgreSQL..."
run_ssh "sudo systemctl start postgresql"
run_ssh "sudo systemctl enable postgresql"

# 4. Prüfe PostgreSQL Version
echo "Schritt 4: Prüfe PostgreSQL Version..."
run_ssh "sudo -u postgres psql --version"

# 5. Erstelle Datenbank und User
echo "Schritt 5: Erstelle Datenbank und User..."
run_ssh "sudo -u postgres psql -c \"CREATE DATABASE $DB_NAME;\" 2>&1 | grep -v 'already exists' || true"
run_ssh "sudo -u postgres psql -c \"CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASSWORD';\" 2>&1 | grep -v 'already exists' || true"
run_ssh "sudo -u postgres psql -c \"GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;\""
run_ssh "sudo -u postgres psql -d $DB_NAME -c \"GRANT ALL ON SCHEMA public TO $DB_USER;\""

# 6. Konfiguriere externe Verbindungen
echo "Schritt 6: Konfiguriere externe Verbindungen..."

# Finde PostgreSQL Config-Verzeichnis und konfiguriere
run_ssh "for conf in /etc/postgresql/*/main/postgresql.conf; do if [ -f \"\$conf\" ]; then sudo sed -i \"s/#listen_addresses = 'localhost'/listen_addresses = '*'/g\" \"\$conf\" 2>/dev/null; sudo sed -i \"s/listen_addresses = 'localhost'/listen_addresses = '*'/g\" \"\$conf\" 2>/dev/null; if ! sudo grep -q \"^listen_addresses = '\*'\" \"\$conf\"; then echo \"listen_addresses = '*'\" | sudo tee -a \"\$conf\" > /dev/null; fi; echo \"Konfiguriert: \$conf\"; fi; done"

# Konfiguriere pg_hba.conf
run_ssh "for hba in /etc/postgresql/*/main/pg_hba.conf; do if [ -f \"\$hba\" ]; then if ! sudo grep -q \"host $DB_NAME $DB_USER\" \"\$hba\"; then echo \"host $DB_NAME $DB_USER 0.0.0.0/0 md5\" | sudo tee -a \"\$hba\" > /dev/null; echo \"HBA konfiguriert: \$hba\"; else echo \"HBA Eintrag existiert bereits in: \$hba\"; fi; fi; done"

# 7. Firewall öffnen
echo "Schritt 7: Öffne Firewall für PostgreSQL..."
run_ssh "sudo ufw allow 5432/tcp 2>&1 || echo 'Firewall-Regel existiert bereits oder ufw nicht aktiv'"

# 8. PostgreSQL neu starten
echo "Schritt 8: Starte PostgreSQL neu..."
run_ssh "sudo systemctl restart postgresql"

# 9. Warte kurz
sleep 3

# 10. Status prüfen
echo ""
echo "=========================================="
echo "Status-Prüfung"
echo "=========================================="
echo ""

echo "PostgreSQL Version:"
run_ssh "sudo -u postgres psql --version"

echo ""
echo "Service Status:"
run_ssh "sudo systemctl status postgresql --no-pager -l | head -15"

echo ""
echo "Datenbank-Liste:"
run_ssh "sudo -u postgres psql -c \"\\l\""

echo ""
echo "Verbindungstest:"
run_ssh "sudo -u postgres psql -d $DB_NAME -c \"SELECT version();\""

echo ""
echo "Prüfe listen_addresses Konfiguration:"
run_ssh "for conf in /etc/postgresql/*/main/postgresql.conf; do if [ -f \"\$conf\" ]; then echo \"=== \$conf ===\"; sudo grep -E '^listen_addresses' \"\$conf\" || echo 'Nicht gefunden'; fi; done"

echo ""
echo "Prüfe pg_hba.conf Einträge:"
run_ssh "for hba in /etc/postgresql/*/main/pg_hba.conf; do if [ -f \"\$hba\" ]; then echo \"=== \$hba ===\"; sudo grep -E 'host.*$DB_NAME.*$DB_USER' \"\$hba\" || echo 'Kein Eintrag gefunden'; fi; done"

echo ""
echo "=========================================="
echo "Einrichtung abgeschlossen!"
echo "=========================================="
echo ""
echo "Datenbank-Details:"
echo "  Host: $SERVER"
echo "  Port: 5432"
echo "  Datenbank: $DB_NAME"
echo "  User: $DB_USER"
echo "  Password: $DB_PASSWORD"
echo ""
echo "Verbindungsstring:"
echo "  postgresql://$DB_USER:$DB_PASSWORD@$SERVER:5432/$DB_NAME"
echo ""
