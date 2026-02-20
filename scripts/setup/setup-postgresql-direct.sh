#!/bin/bash

SERVER="10.55.55.155"
USERNAME="incluzone"
PASSWORD="13vor12!Asdf"
DB_NAME="inclusions_db"
DB_USER="inclusions_user"
DB_PASSWORD="inclusions_secure_password_2024!"

echo "=========================================="
echo "PostgreSQL vollständige Einrichtung"
echo "=========================================="
echo ""

# Erstelle Remote-Skript
cat > /tmp/postgresql_setup.sh << 'REMOTE_SCRIPT'
#!/bin/bash
set -e

DB_NAME="inclusions_db"
DB_USER="inclusions_user"
DB_PASSWORD="inclusions_secure_password_2024!"

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
REMOTE_SCRIPT

# Übertrage Skript mit scp und führe es aus
echo "Übertrage Setup-Skript zum Server..."
expect << 'EXPECT_SCRIPT'
set timeout 300
set server "10.55.55.155"
set username "incluzone"
set password "13vor12!Asdf"

# Übertrage Datei mit scp
spawn scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null /tmp/postgresql_setup.sh $username@$server:/tmp/postgresql_setup.sh
expect {
    "password:" { send "$password\r"; exp_continue }
    "Password:" { send "$password\r"; exp_continue }
    eof { }
}

# Führe Skript aus
spawn ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null $username@$server "bash /tmp/postgresql_setup.sh"
expect {
    "password:" { send "$password\r"; exp_continue }
    "Password:" { send "$password\r"; exp_continue }
    eof { }
}

wait
EXPECT_SCRIPT

# Aufräumen
rm -f /tmp/postgresql_setup.sh

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
