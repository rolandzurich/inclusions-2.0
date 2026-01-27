#!/usr/bin/expect -f

set timeout 30
set server "10.55.55.155"
set username "incluzone"
set password "13vor12!Asdf"
set local_file [lindex $argv 0]
set remote_path [lindex $argv 1]

if {$local_file == "" || $remote_path == ""} {
    puts "Usage: ./deploy-env.sh <local_file> <remote_path>"
    exit 1
}

# Datei kopieren
spawn scp -o StrictHostKeyChecking=no -o ConnectTimeout=10 $local_file $username@$server:$remote_path
expect {
    "password:" {
        send "$password\r"
        exp_continue
    }
    "Password:" {
        send "$password\r"
        exp_continue
    }
    "yes/no" {
        send "yes\r"
        exp_continue
    }
    eof {
        # Erfolgreich
    }
    timeout {
        puts "Timeout beim Kopieren"
        exit 1
    }
}

wait
set exit_code [wait]
if {[lindex $exit_code 3] == 0} {
    puts "✅ Datei erfolgreich kopiert"
    exit 0
} else {
    puts "❌ Fehler beim Kopieren"
    exit 1
}
