#!/usr/bin/expect -f

set timeout 10
set server "10.55.55.155"
set username "incluzone"
set password "13vor12!Asdf"
set local_file [lindex $argv 0]
set remote_path [lindex $argv 1]

if {$local_file == "" || $remote_path == ""} {
    puts "Usage: ./quick-deploy.sh <local_file> <remote_path>"
    exit 1
}

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
        # Erfolgreich
    }
    timeout {
        puts "Timeout"
        exit 1
    }
}

wait

# Prüfe Exit-Code
set exit_code [lindex $expect_out(status) 0]
if {$exit_code == 0} {
    exit 0
} else {
    exit 1
}
