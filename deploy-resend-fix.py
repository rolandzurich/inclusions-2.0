#!/usr/bin/env python3
"""
Deploy Resend-Fix auf den Server
"""

import os
import sys

try:
    import paramiko
except ImportError:
    print("❌ paramiko nicht installiert. Installiere es mit:")
    print("   pip3 install paramiko")
    sys.exit(1)

# Server-Konfiguration
SERVER = "10.55.55.155"
USER = "incluzone"
PASSWORD = "13vor12!Asdf"
APP_DIR = "/home/incluzone/inclusions-2.0"

def main():
    print("🚀 Deploying Resend-Fix auf Server...")
    
    # SSH-Client erstellen
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        print(f"🔌 Verbinde mit {SERVER}...")
        ssh.connect(SERVER, username=USER, password=PASSWORD, timeout=10)
        print("✅ Verbunden!")
        
        # SFTP-Client für Datei-Upload
        sftp = ssh.open_sftp()
        
        # 1. Contact Route hochladen
        print("\n📤 Lade app/api/contact/route.ts hoch...")
        sftp.put("app/api/contact/route.ts", f"{APP_DIR}/app/api/contact/route.ts")
        print("✅ Contact Route hochgeladen")
        
        # 2. Newsletter Route hochladen
        print("\n📤 Lade app/api/newsletter/route.ts hoch...")
        sftp.put("app/api/newsletter/route.ts", f"{APP_DIR}/app/api/newsletter/route.ts")
        print("✅ Newsletter Route hochgeladen")
        
        # 3. VIP Route hochladen
        print("\n📤 Lade app/api/vip/route.ts hoch...")
        sftp.put("app/api/vip/route.ts", f"{APP_DIR}/app/api/vip/route.ts")
        print("✅ VIP Route hochgeladen")
        
        sftp.close()
        
        # 4. App neu starten
        print("\n🔄 Starte App neu...")
        stdin, stdout, stderr = ssh.exec_command(f"cd {APP_DIR} && pm2 restart all")
        output = stdout.read().decode()
        error = stderr.read().decode()
        
        if error:
            print(f"⚠️ Stderr: {error}")
        print(output)
        
        # 5. Status anzeigen
        print("\n📊 PM2 Status:")
        stdin, stdout, stderr = ssh.exec_command("pm2 status")
        print(stdout.read().decode())
        
        print("\n✅ Deploy abgeschlossen!")
        print("🌐 Teste jetzt: https://inclusions.zone")
        
    except Exception as e:
        print(f"❌ Fehler: {e}")
        sys.exit(1)
    finally:
        ssh.close()

if __name__ == "__main__":
    main()
