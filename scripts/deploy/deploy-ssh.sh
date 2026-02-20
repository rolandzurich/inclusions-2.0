#!/usr/bin/expect -f

set timeout 30
set server "10.55.55.155"
set username "incluzone"
set password "13vor12!Asdf"

spawn ssh $username@$server
expect {
    "password:" {
        send "$password\r"
        exp_continue
    }
    "yes/no" {
        send "yes\r"
        exp_continue
    }
    "$ " {
        # Erfolgreich eingeloggt
    }
    "# " {
        # Erfolgreich eingeloggt als root
    }
}

interact
