#!/bin/bash
# Optimiertes Deployment-Skript für inclusions-2.0
# Verwendet SSH-Key wenn verfügbar, sonst Passwort

SERVER="10.55.55.155"
USER="incluzone"
PASSWORD="13vor12!Asdf"
REMOTE_DIR="/home/incluzone/inclusions-2.0"
SSH_KEY="$HOME/.ssh/inclusions_server"

# Prüfe ob SSH-Key existiert
if [ -f "$SSH_KEY" ]; then
    SSH_OPTS="-i $SSH_KEY -o StrictHostKeyChecking=no -o ConnectTimeout=5"
    echo "Verwende SSH-Key für Authentifizierung"
else
    SSH_OPTS="-o StrictHostKeyChecking=no -o ConnectTimeout=5"
    echo "SSH-Key nicht gefunden, verwende Passwort-Authentifizierung"
fi

# Funktion: Datei kopieren
deploy_file() {
    local local_file=$1
    local remote_file=$2
    
    if [ ! -f "$local_file" ]; then
        echo "Fehler: Datei nicht gefunden: $local_file"
        return 1
    fi
    
    echo "Kopiere $local_file -> $remote_file"
    
    if [ -f "$SSH_KEY" ]; then
        # Mit SSH-Key (schnell)
        scp $SSH_OPTS "$local_file" "$USER@$SERVER:$remote_file" || return 1
    else
        # Mit Passwort (langsamer, aber funktioniert)
        sshpass -p "$PASSWORD" scp $SSH_OPTS "$local_file" "$USER@$SERVER:$remote_file" || {
            echo "sshpass nicht installiert. Installiere mit: brew install hudochenkov/sshpass/sshpass"
            echo "Oder richte SSH-Key ein für schnellere Verbindungen"
            return 1
        }
    fi
    
    echo "✓ Erfolgreich kopiert"
}

# Funktion: Befehl auf Server ausführen
run_command() {
    local cmd=$1
    
    if [ -f "$SSH_KEY" ]; then
        ssh $SSH_OPTS "$USER@$SERVER" "$cmd"
    else
        sshpass -p "$PASSWORD" ssh $SSH_OPTS "$USER@$SERVER" "$cmd" || {
            echo "sshpass nicht installiert. Verwende expect-Skript..."
            ./ssh-exec.sh "$cmd"
        }
    fi
}

# Hauptfunktion
case "$1" in
    file)
        deploy_file "$2" "$3"
        ;;
    cmd)
        run_command "$2"
        ;;
    restart)
        echo "Starte App neu..."
        run_command "cd $REMOTE_DIR && pkill -f 'next start' && sleep 2 && npm start > /tmp/next.log 2>&1 &"
        sleep 3
        run_command "ps aux | grep -E 'next|node' | grep -v grep"
        ;;
    setup-key)
        echo "Richte SSH-Key ein..."
        if [ ! -f "$SSH_KEY.pub" ]; then
            ssh-keygen -t ed25519 -f "$SSH_KEY" -N "" -q
        fi
        echo "Füge Public Key zum Server hinzu..."
        sshpass -p "$PASSWORD" ssh-copy-id -i "$SSH_KEY.pub" $SSH_OPTS "$USER@$SERVER" 2>/dev/null || {
            echo "Automatisches Setup fehlgeschlagen. Manuell:"
            echo "1. cat ~/.ssh/inclusions_server.pub"
            echo "2. ssh $USER@$SERVER"
            echo "3. echo 'PASTE_PUBLIC_KEY' >> ~/.ssh/authorized_keys"
        }
        ;;
    *)
        echo "Usage: $0 {file|cmd|restart|setup-key} [args...]"
        echo ""
        echo "Beispiele:"
        echo "  $0 file lib/geo-schema.ts /home/incluzone/inclusions-2.0/lib/geo-schema.ts"
        echo "  $0 cmd 'cd ~/inclusions-2.0 && ls -la'"
        echo "  $0 restart"
        echo "  $0 setup-key  # Einmalig: SSH-Key einrichten für schnellere Verbindungen"
        exit 1
        ;;
esac
