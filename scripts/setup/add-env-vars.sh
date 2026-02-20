#!/usr/bin/expect -f

set timeout 10
set server "10.55.55.155"
set username "incluzone"
set password "13vor12!Asdf"

# Datei-Inhalt als Argument übergeben
set file_content [lindex $argv 0]

spawn ssh -o StrictHostKeyChecking=no $username@$server
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
    "$ " {
        send "cd ~/inclusions-2.0 && cat >> .env << 'ENVEOF'\r"
        exp_continue
    }
    "> " {
        send "$file_content\r"
        exp_continue
    }
    "> " {
        send "ENVEOF\r"
        exp_continue
    }
    "$ " {
        send "cat .env | tail -6\r"
        exp_continue
    }
    "$ " {
        send "exit\r"
    }
}

wait
