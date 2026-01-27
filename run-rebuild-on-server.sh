#!/usr/bin/expect -f

set timeout 600
set server "10.55.55.155"
set username "incluzone"
set password "13vor12!Asdf"

# Kopiere Skript auf Server
spawn scp -o StrictHostKeyChecking=no rebuild-and-fix-api.sh $username@$server:~/rebuild-and-fix-api.sh
expect {
    "password:" { send "$password\r"; exp_continue }
    "Password:" { send "$password\r"; exp_continue }
    eof
}
wait

# Führe Skript auf Server aus
spawn ssh -o StrictHostKeyChecking=no $username@$server "bash ~/rebuild-and-fix-api.sh"
expect {
    "password:" { send "$password\r"; exp_continue }
    "Password:" { send "$password\r"; exp_continue }
    eof
}
wait
