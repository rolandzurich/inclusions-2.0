#!/usr/bin/expect -f
# Einzelnes Skript für alle Konfigurationsschritte

set timeout 60
set server "10.55.55.155"
set user "incluzone"
set password "13vor12!Asdf"

puts "\n=== Konfiguriere Server für 10.55.55.155 ===\n"

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

# 1. Nginx-Konfiguration
puts "🔍 Aktualisiere Nginx..."
send "sudo sed -i 's/server_name .*/server_name 10.55.55.155 _;/' /etc/nginx/sites-available/inclusions\r"
expect {
    "password" {
        send "${password}\r"
        exp_continue
    }
    "$ " {}
}

# 2. Nginx prüfen und neu laden
send "sudo nginx -t && sudo systemctl reload nginx\r"
expect {
    "password" {
        send "${password}\r"
        exp_continue
    }
    "$ " {}
}

# 3. Firewall
send "sudo ufw allow 80/tcp 2>/dev/null || true\r"
expect {
    "password" {
        send "${password}\r"
        exp_continue
    }
    "$ " {}
}

# 4. Next.js App
send "cd ~/inclusions-2.0\r"
expect "$ "

send "pgrep -f 'next start' > /dev/null || (pkill -f 'next start' 2>/dev/null; npm start > /tmp/next.log 2>&1 &)\r"
expect "$ "

puts "\n=== Fertig! ===\n"
puts "Teste: http://10.55.55.155\n"

send "exit\r"
expect eof
