# SSH Workflow Fix - Lösung für effizientes Arbeiten

## Problem
SSH-Zugriff funktioniert nicht direkt aus der Sandbox-Umgebung heraus.

## Lösung: Einmaliges Setup

### Option 1: SSH-Key einrichten (Empfohlen - einmalig, dann dauerhaft)

**Auf deinem Mac ausführen:**

```bash
# 1. SSH-Key generieren (falls noch nicht vorhanden)
ssh-keygen -t ed25519 -f ~/.ssh/inclusions_server -N ""

# 2. Public Key auf Server kopieren
ssh-copy-id -i ~/.ssh/inclusions_server.pub incluzone@10.55.55.155

# 3. Testen (sollte ohne Passwort funktionieren)
ssh -i ~/.ssh/inclusions_server incluzone@10.55.55.155 "echo 'Funktioniert!'"
```

**Nach dem Setup:** Alle SSH-Befehle funktionieren ohne Passwort!

### Option 2: sshpass installieren (Alternative)

```bash
# Auf Mac mit Homebrew:
brew install hudochenkov/sshpass/sshpass

# Dann kann ich direkt Befehle ausführen:
sshpass -p "13vor12!Asdf" ssh incluzone@10.55.55.155 "command"
```

### Option 3: Temporäres Fix-Skript verwenden

**Für jetzt - einmalig ausführen:**

```bash
cd ~/Curser/inclusions-2.0
bash fix-all-now.sh
```

Dieses Skript:
- Kopiert das Rebuild-Skript auf den Server
- Führt den Rebuild aus
- Testet die API

## Nach dem Setup

Sobald SSH-Key oder sshpass eingerichtet ist, kann ich:
- ✅ Direkt Befehle auf dem Server ausführen
- ✅ Logs prüfen
- ✅ App neu starten
- ✅ Tests durchführen

**Ohne dass du Terminal-Befehle kopieren musst!**

## Empfehlung

**SSH-Key einrichten** - das ist die sauberste Lösung und funktioniert dauerhaft.
