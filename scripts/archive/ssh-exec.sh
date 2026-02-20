#!/usr/bin/expect -f

set timeout 300
set server "10.55.55.155"
set username "incluzone"
set password "13vor12!Asdf"

# Kommando als Argument übergeben
set command [lindex $argv 0]

# Verwende -T für non-interactive und -n für stdin redirection
spawn ssh -T -n -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null $username@$server $command
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
    "yes/no" {
        send "yes\r"
        exp_continue
    }
    eof {
        # Kommando beendet
    }
    timeout {
        puts "Timeout"
        exit 1
    }
}

wait
