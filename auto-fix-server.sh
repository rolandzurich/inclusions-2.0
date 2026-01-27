#!/usr/bin/expect -f
# Automatische Server-Konfiguration - alles in einem Durchlauf

set timeout 30
set server "10.55.55.155"
set user "incluzone"
set password "13vor12!Asdf"

puts "\n=== Starte automatische Konfiguration ===\n"

# SSH-Verbindung aufbauen
spawn ssh -o StrictHostKeyChecking=no ${user}@${server}

expect {
    "password:" {
        send "${password}\r"
        exp_continue
    }
    "$ " {
        puts "✅ Verbunden\n"
    }
    timeout {
        puts "❌ Zeitüberschreitung\n"
        exit 1
    }
}

# Schritt 1: Nginx-Konfiguration
puts "🔍 Schritt 1: Aktualisiere Nginx..."
send "sudo sed -i 's/server_name .*/server_name 10.55.55.155 _;/' /etc/nginx/sites-available/inclusions\r"
expect {
    "password" {
        send "${password}\r"
        exp_continue
    }
    "$ " {}
}

# Schritt 2: Nginx testen und neu laden
puts "🔍 Schritt 2: Prüfe und lade Nginx neu..."
send "sudo nginx -t\r"
expect {
    "password" {
        send "${password}\r"
        exp_continue
    }
    "successful" {
        puts "✅ Nginx-Konfiguration OK\n"
    }
    "$ " {}
}

send "sudo systemctl reload nginx\r"
expect {
    "password" {
        send "${password}\r"
        exp_continue
    }
    "$ " {}
}

# Schritt 3: Firewall
puts "🔍 Schritt 3: Öffne Port 80..."
send "sudo ufw allow 80/tcp 2>/dev/null || true\r"
expect {
    "password" {
        send "${password}\r"
        exp_continue
    }
    "$ " {}
}

# Schritt 4: Next.js App
puts "🔍 Schritt 4: Prüfe Next.js App..."
send "cd ~/inclusions-2.0\r"
expect "$ "

send "pgrep -f 'next start' > /dev/null && echo 'App läuft bereits' || (pkill -f 'next start' 2>/dev/null; npm start > /tmp/next.log 2>&1 & sleep 2; echo 'App gestartet')\r"
expect "$ "

puts "\n=== ✅ FERTIG ===\n"
puts "Die Seite sollte jetzt erreichbar sein unter:\n"
puts "  http://10.55.55.155\n"
puts "Teste es jetzt ohne VPN!\n"

send "exit\r"
expect eof
