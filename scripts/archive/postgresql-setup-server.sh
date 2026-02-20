#!/bin/bash
# PostgreSQL vollständige Einrichtung auf Server
# Dieses Skript muss direkt auf dem Server ausgeführt werden

set -e

DB_NAME="inclusions_db"
DB_USER="inclusions_user"
DB_PASSWORD="inclusions_secure_password_2024!"

echo "=========================================="
echo "PostgreSQL vollständige Einrichtung"
echo "=========================================="
echo ""

echo "Schritt 1: Prüfe PostgreSQL Installation..."
which psql || echo "PostgreSQL nicht gefunden"

echo ""
echo "Schritt 2: Installiere PostgreSQL..."
sudo apt-get update -qq
sudo apt-get install -y postgresql postgresql-contrib

echo ""
echo "Schritt 3: Starte und aktiviere PostgreSQL..."
sudo systemctl start postgresql
sudo systemctl enable postgresql

echo ""
echo "Schritt 4: Prüfe PostgreSQL Version..."
sudo -u postgres psql --version

echo ""
echo "Schritt 5: Erstelle Datenbank und User..."
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;" 2>&1 | grep -v "already exists" || true
sudo -u postgres psql -c "CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASSWORD';" 2>&1 | grep -v "already exists" || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
sudo -u postgres psql -d $DB_NAME -c "GRANT ALL ON SCHEMA public TO $DB_USER;"

echo ""
echo "Schritt 6: Konfiguriere externe Verbindungen..."
for conf in /etc/postgresql/*/main/postgresql.conf; do
    if [ -f "$conf" ]; then
        sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/g" "$conf" 2>/dev/null || true
        sudo sed -i "s/listen_addresses = 'localhost'/listen_addresses = '*'/g" "$conf" 2>/dev/null || true
        if ! sudo grep -q "^listen_addresses = '\*'" "$conf"; then
            echo "listen_addresses = '*'" | sudo tee -a "$conf" > /dev/null
        fi
        echo "Konfiguriert: $conf"
    fi
done

for hba in /etc/postgresql/*/main/pg_hba.conf; do
    if [ -f "$hba" ]; then
        if ! sudo grep -q "host $DB_NAME $DB_USER" "$hba"; then
            echo "host $DB_NAME $DB_USER 0.0.0.0/0 md5" | sudo tee -a "$hba" > /dev/null
            echo "HBA konfiguriert: $hba"
        else
            echo "HBA Eintrag existiert bereits in: $hba"
        fi
    fi
done

echo ""
echo "Schritt 7: Öffne Firewall für PostgreSQL..."
sudo ufw allow 5432/tcp 2>&1 || echo "Firewall-Regel existiert bereits oder ufw nicht aktiv"

echo ""
echo "Schritt 8: Starte PostgreSQL neu..."
sudo systemctl restart postgresql

sleep 3

echo ""
echo "=========================================="
echo "Status-Prüfung"
echo "=========================================="
echo ""

echo "PostgreSQL Version:"
sudo -u postgres psql --version

echo ""
echo "Service Status:"
sudo systemctl status postgresql --no-pager -l | head -15

echo ""
echo "Datenbank-Liste:"
sudo -u postgres psql -c "\l"

echo ""
echo "Verbindungstest:"
sudo -u postgres psql -d $DB_NAME -c "SELECT version();"

echo ""
echo "Prüfe listen_addresses Konfiguration:"
for conf in /etc/postgresql/*/main/postgresql.conf; do
    if [ -f "$conf" ]; then
        echo "=== $conf ==="
        sudo grep -E "^listen_addresses" "$conf" || echo "Nicht gefunden"
    fi
done

echo ""
echo "Prüfe pg_hba.conf Einträge:"
for hba in /etc/postgresql/*/main/pg_hba.conf; do
    if [ -f "$hba" ]; then
        echo "=== $hba ==="
        sudo grep -E "host.*$DB_NAME.*$DB_USER" "$hba" || echo "Kein Eintrag gefunden"
    fi
done

echo ""
echo "=========================================="
echo "Einrichtung abgeschlossen!"
echo "=========================================="
echo ""
echo "Datenbank-Details:"
echo "  Host: $(hostname -I | awk '{print $1}')"
echo "  Port: 5432"
echo "  Datenbank: $DB_NAME"
echo "  User: $DB_USER"
echo "  Password: $DB_PASSWORD"
echo ""
