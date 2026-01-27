#!/bin/bash

# All-in-One Fix Script für Newsletter-E-Mail Problem
# Führe aus: bash fix-all-now.sh

SERVER="10.55.55.155"
USER="incluzone"
PASSWORD="13vor12!Asdf"

echo "🔧 Fix Newsletter E-Mail Problem"
echo "================================"
echo ""

# Erstelle temporäres expect Skript
cat > /tmp/ssh-fix.expect << 'EXPECT_EOF'
#!/usr/bin/expect -f
set timeout 600
set server [lindex $argv 0]
set username [lindex $argv 1]
set password [lindex $argv 2]
set command [lindex $argv 3]

spawn ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null $username@$server $command
expect {
    "password:" { send "$password\r"; exp_continue }
    "Password:" { send "$password\r"; exp_continue }
    "(yes/no)?" { send "yes\r"; exp_continue }
    eof
}
wait
EXPECT_EOF

chmod +x /tmp/ssh-fix.expect

echo "1️⃣ Kopiere Rebuild-Skript auf Server..."
/tmp/ssh-fix.expect "$SERVER" "$USER" "$PASSWORD" "cat > ~/rebuild-and-fix-api.sh << 'SCRIPT_EOF'
$(cat rebuild-and-fix-api.sh)
SCRIPT_EOF
"

echo ""
echo "2️⃣ Führe Rebuild auf Server aus..."
/tmp/ssh-fix.expect "$SERVER" "$USER" "$PASSWORD" "bash ~/rebuild-and-fix-api.sh"

echo ""
echo "3️⃣ Teste API..."
/tmp/ssh-fix.expect "$SERVER" "$USER" "$PASSWORD" "curl -s http://localhost:3000/api/debug-resend | head -c 500"

echo ""
echo "✅ Fertig!"
echo ""
echo "Teste jetzt: curl https://inclusions.zone/api/debug-resend"

# Aufräumen
rm -f /tmp/ssh-fix.expect
