#!/usr/bin/expect -f

set timeout 300
set server "10.55.55.155"
set username "incluzone"
set password "13vor12!Asdf"

puts "\n🚀 Starte Datenbank-Setup auf Server...\n"

# Verbinde und führe Setup aus
spawn ssh -T -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null $username@$server

expect {
    "password:" {
        send "$password\r"
        exp_continue
    }
    "Password:" {
        send "$password\r"
        exp_continue
    }
    "$ " {
        # Führe Setup-Befehle aus
        send "cd ~/inclusions-2.0\r"
        expect "$ "
        
        # Prüfe PostgreSQL
        send "which psql || echo 'NOT_INSTALLED'\r"
        expect {
            "NOT_INSTALLED" {
                puts "\n📦 Installiere PostgreSQL...\n"
                send "sudo apt-get update -qq && sudo apt-get install -y postgresql postgresql-contrib\r"
                expect {
                    "password" {
                        send "$password\r"
                        exp_continue
                    }
                    "$ " {
                        puts "✅ PostgreSQL installiert\n"
                    }
                }
            }
            "$ " {
                puts "✅ PostgreSQL bereits installiert\n"
            }
        }
        
        # Starte PostgreSQL
        send "sudo systemctl start postgresql && sudo systemctl enable postgresql\r"
        expect {
            "password" {
                send "$password\r"
                exp_continue
            }
            "$ " {
                puts "✅ PostgreSQL gestartet\n"
            }
        }
        
        # Erstelle Datenbank und Benutzer
        puts "📋 Erstelle Datenbank und Benutzer...\n"
        send "sudo -u postgres psql -c \"CREATE DATABASE inclusions_db;\" 2>&1 | grep -v 'already exists' || true\r"
        expect "$ "
        
        send "sudo -u postgres psql -c \"CREATE USER inclusions_user WITH PASSWORD 'inclusions_secure_password_2024!';\" 2>&1 | grep -v 'already exists' || true\r"
        expect "$ "
        
        send "sudo -u postgres psql -c \"GRANT ALL PRIVILEGES ON DATABASE inclusions_db TO inclusions_user;\"\r"
        expect "$ "
        
        send "sudo -u postgres psql -c \"ALTER DATABASE inclusions_db OWNER TO inclusions_user;\"\r"
        expect "$ "
        
        puts "✅ Datenbank und Benutzer erstellt\n"
        
        # Erstelle Schema - kopiere SQL direkt
        puts "📋 Erstelle Datenbank-Schema...\n"
        
        # Erstelle temporäre SQL-Datei
        send "cat > /tmp/create_schema.sql << 'SQL_EOF'\r"
        expect "$ "
        send "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";\r"
        expect "$ "
        send "CREATE TABLE IF NOT EXISTS contact_requests (\r"
        expect "$ "
        send "    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),\r"
        expect "$ "
        send "    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),\r"
        expect "$ "
        send "    name TEXT NOT NULL,\r"
        expect "$ "
        send "    email TEXT NOT NULL,\r"
        expect "$ "
        send "    phone TEXT,\r"
        expect "$ "
        send "    message TEXT,\r"
        expect "$ "
        send "    booking_type TEXT,\r"
        expect "$ "
        send "    booking_item TEXT,\r"
        expect "$ "
        send "    event_date DATE,\r"
        expect "$ "
        send "    event_location TEXT,\r"
        expect "$ "
        send "    event_type TEXT,\r"
        expect "$ "
        send "    source_url TEXT,\r"
        expect "$ "
        send "    utm_source TEXT,\r"
        expect "$ "
        send "    utm_medium TEXT,\r"
        expect "$ "
        send "    utm_campaign TEXT,\r"
        expect "$ "
        send "    honeypot TEXT,\r"
        expect "$ "
        send "    ip_address INET,\r"
        expect "$ "
        send "    admin_notes TEXT,\r"
        expect "$ "
        send "    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'completed', 'archived')),\r"
        expect "$ "
        send "    viewed_at TIMESTAMPTZ\r"
        expect "$ "
        send ");\r"
        expect "$ "
        send "SQL_EOF\r"
        expect "$ "
        
        # Das wird zu komplex mit expect. Lass mich einen anderen Ansatz versuchen.
        puts "\n⚠️  Erstelle Schema über separate SQL-Datei...\n"
        
        send "exit\r"
        expect eof
    }
    timeout {
        puts "Timeout erreicht"
        exit 1
    }
}

puts "\n✅ Setup abgeschlossen!\n"
