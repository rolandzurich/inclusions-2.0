#!/usr/bin/expect -f

set timeout 10
set server "10.55.55.155"
set username "incluzone"
set password "13vor12!Asdf"
set local_file [lindex $argv 0]
set remote_path [lindex $argv 1]

if {$local_file == "" || $remote_path == ""} {
    puts "Usage: ./deploy-file.sh <local_file> <remote_path>"
    exit 1
}

# Datei mit scp kopieren
spawn scp -o StrictHostKeyChecking=no -o ConnectTimeout=5 $local_file $username@$server:$remote_path
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
        # Erfolgreich kopiert
    }
    timeout {
        puts "Timeout beim Kopieren der Datei"
        exit 1
    }
}

wait

if {[lindex $expect_out(status) 0] == 0} {
    puts "Datei erfolgreich kopiert: $local_file -> $remote_path"
} else {
    puts "Fehler beim Kopieren der Datei"
    exit 1
}
