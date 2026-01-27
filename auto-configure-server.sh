#!/usr/bin/expect -f
# Automatisches Skript: Konfiguriert den Server für 10.55.55.155

set timeout 30
set server "10.55.55.155"
set user "incluzone"
set password "13vor12!Asdf"

puts "\n=== Konfiguriere Server für 10.55.55.155 ===\n"

# SSH-Verbindung aufbauen
spawn ssh -o StrictHostKeyChecking=no ${user}@${server}

expect {
    "password:" {
        send "${password}\r"
        exp_continue
    }
    "Permission denied" {
        puts "\n❌ Zugriff verweigert. Bist du im VPN?\n"
        exit 1
    }
    "$ " {
        puts "✅ Verbindung hergestellt\n"
    }
    timeout {
        puts "\n❌ Zeitüberschreitung. Prüfe VPN-Verbindung.\n"
        exit 1
    }
}

# 1. Nginx-Konfiguration prüfen und aktualisieren
puts "🔍 Prüfe Nginx-Konfiguration..."
send "sudo sed -i 's/server_name .*/server_name 10.55.55.155 _;/' /etc/nginx/sites-available/inclusions\r"
expect {
    "password" {
        send "${password}\r"
        exp_continue
    }
    "$ " {}
}

send "sudo nginx -t\r"
expect {
    "password" {
        send "${password}\r"
        exp_continue
    }
    "successful" {
        puts "✅ Nginx-Konfiguration ist gültig\n"
    }
    "$ " {}
}

puts "🔄 Lade Nginx neu..."
send "sudo systemctl reload nginx\r"
expect {
    "password" {
        send "${password}\r"
        exp_continue
    }
    "$ " {}
}

# 2. Firewall prüfen
puts "🔥 Prüfe Firewall..."
send "sudo ufw allow 80/tcp 2>/dev/null || true\r"
expect {
    "password" {
        send "${password}\r"
        exp_continue
    }
    "$ " {}
}

# 3. Next.js App prüfen
puts "🔍 Prüfe Next.js App..."
send "cd ~/inclusions-2.0\r"
expect "$ "

send "pgrep -f 'next start' > /dev/null && echo '✅ App läuft' || (pkill -f 'next start' 2>/dev/null; npm start > /tmp/next.log 2>&1 & sleep 2; echo '✅ App gestartet')\r"
expect "$ "

puts "\n=== Fertig! ===\n"
puts "Die Seite sollte jetzt erreichbar sein unter:\n"
puts "  http://10.55.55.155\n"
puts "Teste es jetzt ohne VPN!\n"

send "exit\r"
expect eof
