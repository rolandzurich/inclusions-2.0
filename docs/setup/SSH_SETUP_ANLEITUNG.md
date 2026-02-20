# SSH-Key-Setup für Server

## Status

✅ SSH-Key vorhanden: `~/.ssh/inclusions_server`
⚠️  Netzwerkverbindung blockiert ("Operation not permitted")

## Manuelles Setup

### Schritt 1: SSH-Key kopieren

Führe diesen Befehl aus (wenn die Verbindung wieder funktioniert):

```bash
# Option 1: Mit sshpass (falls installiert)
sshpass -p "13vor12!Asdf" ssh-copy-id -i ~/.ssh/inclusions_server.pub -o StrictHostKeyChecking=no incluzone@10.55.55.155

# Option 2: Manuell
cat ~/.ssh/inclusions_server.pub | ssh -o StrictHostKeyChecking=no incluzone@10.55.55.155 \
  "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
```

### Schritt 2: SSH-Config erstellen

Erstelle `~/.ssh/config` mit folgendem Inhalt:

```
# Inclusions Server
Host inclusions-server
    HostName 10.55.55.155
    User incluzone
    IdentityFile ~/.ssh/inclusions_server
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null
```

Dann kannst du einfach verbinden mit:
```bash
ssh inclusions-server
```

### Schritt 3: Testen

```bash
ssh -i ~/.ssh/inclusions_server incluzone@10.55.55.155 "echo 'Verbindung erfolgreich!'"
```

## Automatisches Setup

Sobald die Netzwerkverbindung wieder funktioniert, führe aus:

```bash
bash setup-ssh-complete.sh
```

## Dein Public Key

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIPtEOWgCkdo+TP3bQudYAF+f9OR+CRAQLSbh/TXwHu6i roland@MacBook-Air-2.local
```

Du kannst diesen Key auch manuell auf dem Server hinzufügen:

```bash
# Auf dem Server:
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIPtEOWgCkdo+TP3bQudYAF+f9OR+CRAQLSbh/TXwHu6i roland@MacBook-Air-2.local" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```
