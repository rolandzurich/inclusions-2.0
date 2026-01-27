#!/usr/bin/env python3
"""
Automatisches Environment-Setup für inclusions-2.0 Server
Verwendet paramiko für bessere SSH-Verbindungsverwaltung
"""

import os
import sys
import time
import subprocess

SERVER = "10.55.55.155"
USER = "incluzone"
PASSWORD = "13vor12!Asdf"
REMOTE_DIR = "/home/incluzone/inclusions-2.0"
LOCAL_ENV = ".env.production"

def run_ssh_command(command):
    """Führt einen SSH-Befehl aus mit automatischer Passwort-Eingabe"""
    try:
        # Verwende ssh mit expect-ähnlichem Verhalten
        ssh_cmd = f'ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 {USER}@{SERVER} "{command}"'
        
        # Erstelle ein expect-Script temporär
        expect_script = f'''#!/usr/bin/expect -f
set timeout 30
spawn {ssh_cmd}
expect {{
    "password:" {{
        send "{PASSWORD}\\r"
        exp_continue
    }}
    "Password:" {{
        send "{PASSWORD}\\r"
        exp_continue
    }}
    "yes/no" {{
        send "yes\\r"
        exp_continue
    }}
    eof {{
    }}
}}
wait
'''
        
        with open('/tmp/ssh_temp.exp', 'w') as f:
            f.write(expect_script)
        os.chmod('/tmp/ssh_temp.exp', 0o755)
        
        result = subprocess.run(['/tmp/ssh_temp.exp'], capture_output=True, text=True, timeout=60)
        os.remove('/tmp/ssh_temp.exp')
        return result.returncode == 0, result.stdout, result.stderr
    except Exception as e:
        return False, "", str(e)

def copy_env_file():
    """Kopiert die .env Datei auf den Server"""
    if not os.path.exists(LOCAL_ENV):
        print(f"❌ Fehler: {LOCAL_ENV} nicht gefunden!")
        return False
    
    print("📤 Kopiere .env auf Server...")
    
    # Lese lokale Datei
    with open(LOCAL_ENV, 'r') as f:
        env_content = f.read()
    
    # Erstelle remote .env Datei
    # Escaped für Shell
    escaped_content = env_content.replace('$', '\\$').replace('"', '\\"').replace('`', '\\`')
    
    command = f'cd {REMOTE_DIR} && cat > .env << \'ENVEOF\'\n{env_content}ENVEOF'
    
    success, stdout, stderr = run_ssh_command(command)
    
    if success:
        print("✅ .env erfolgreich kopiert")
        return True
    else:
        print(f"❌ Fehler beim Kopieren: {stderr}")
        return False

def verify_keys():
    """Prüft ob Keys auf Server sind"""
    print("🔍 Prüfe Keys auf Server...")
    command = f'cd {REMOTE_DIR} && grep -E "RESEND_API_KEY|GEMINI_API_KEY" .env'
    success, stdout, stderr = run_ssh_command(command)
    
    if success and stdout:
        print(stdout)
        print("✅ Keys gefunden")
        return True
    else:
        print("❌ Keys nicht gefunden")
        return False

def restart_app():
    """Startet die App neu"""
    print("🔄 Starte App neu...")
    command = f'cd {REMOTE_DIR} && pkill -f "next start" && sleep 2 && npm start > /tmp/next.log 2>&1 &'
    success, stdout, stderr = run_ssh_command(command)
    
    if success:
        print("✅ App neu gestartet")
        return True
    else:
        print(f"⚠️  Warnung: {stderr}")
        return False

def main():
    print("=== Automatisches Environment-Setup ===")
    print("")
    
    if not copy_env_file():
        sys.exit(1)
    
    print("")
    
    if not verify_keys():
        sys.exit(1)
    
    print("")
    
    if not restart_app():
        print("⚠️  App-Neustart könnte fehlgeschlagen sein, aber Keys sind gesetzt")
    
    print("")
    print("=== Fertig! ===")
    print("")
    print("Teste jetzt:")
    print("1. Voice Agent: http://10.55.55.155 - Teste INCLUSI")
    print("2. E-Mail: Teste Kontaktformular")

if __name__ == "__main__":
    main()
