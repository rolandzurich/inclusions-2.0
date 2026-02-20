#!/usr/bin/expect -f

set timeout 30
set server "10.55.55.155"
set username "incluzone"
set password "13vor12!Asdf"
set pubkey_file "$env(HOME)/.ssh/inclusions_server.pub"

# Lese Public Key
set fp [open $pubkey_file r]
set pubkey [read $fp]
close $fp
set pubkey [string trimright $pubkey "\n"]

puts "\n🔑 Kopiere SSH-Key auf Server...\n"

# Verbinde und füge Key hinzu
spawn ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null $username@$server "mkdir -p ~/.ssh && chmod 700 ~/.ssh && echo '$pubkey' >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys && echo 'Key hinzugefügt'"

expect {
    "password:" {
        send "$password\r"
        exp_continue
    }
    "Password:" {
        send "$password\r"
        exp_continue
    }
    "(yes/no)?" {
        send "yes\r"
        exp_continue
    }
    "Key hinzugefügt" {
        puts "\n✅ SSH-Key erfolgreich auf Server kopiert!\n"
    }
    eof {
        puts "\n✅ SSH-Key kopiert\n"
    }
    timeout {
        puts "\n⚠️  Timeout - versuche manuell\n"
        exit 1
    }
}

wait

# Teste Verbindung
puts "\n🔍 Teste SSH-Verbindung mit Key...\n"
spawn ssh -i $env(HOME)/.ssh/inclusions_server -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ConnectTimeout=10 $username@$server "echo 'SSH-Verbindung erfolgreich!'"

expect {
    "SSH-Verbindung erfolgreich!" {
        puts "\n✅ SSH-Verbindung funktioniert!\n"
    }
    eof {
        puts "\n✅ Verbindung erfolgreich\n"
    }
    timeout {
        puts "\n⚠️  Verbindungstest fehlgeschlagen\n"
    }
}

wait

puts "\n💡 Du kannst jetzt ohne Passwort verbinden:\n"
puts "   ssh -i ~/.ssh/inclusions_server $username@$server\n"
