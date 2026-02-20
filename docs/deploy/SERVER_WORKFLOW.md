# Effizientes Arbeiten auf dem Server - Optimierungen

## Problem
- Jeder SSH-Befehl benötigt Passwort-Eingabe → langsam
- Viele einzelne Befehle statt optimiertem Workflow

## Lösung 1: SSH-Key einrichten (Empfohlen für dauerhafte Nutzung)

### Einmalig einrichten:
```bash
# 1. SSH-Key generieren (falls noch nicht vorhanden)
ssh-keygen -t ed25519 -f ~/.ssh/inclusions_server -N ""

# 2. Public Key auf Server kopieren
cat ~/.ssh/inclusions_server.pub | ./ssh-exec.sh "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"

# 3. Testen (sollte ohne Passwort funktionieren)
ssh -i ~/.ssh/inclusions_server incluzone@10.55.55.155 "echo 'Funktioniert!'"
```

**Nach dem Setup:** Alle Befehle sind sofort ohne Passwort möglich!

## Lösung 2: Optimierte Skripte verwenden

### `quick-deploy.sh` - Schnelles Datei-Deployment
```bash
./quick-deploy.sh lib/geo-schema.ts /home/incluzone/inclusions-2.0/lib/geo-schema.ts
```

### `deploy.sh` - Multi-Purpose Deployment-Tool
```bash
# Datei kopieren
./deploy.sh file lib/geo-schema.ts /home/incluzone/inclusions-2.0/lib/geo-schema.ts

# Befehl ausführen
./deploy.sh cmd "cd ~/inclusions-2.0 && ls -la"

# App neu starten
./deploy.sh restart
```

## Lösung 3: Batch-Operationen

Statt viele einzelne Befehle:
```bash
# ❌ Langsam: 3 separate SSH-Verbindungen
./ssh-exec.sh "command1"
./ssh-exec.sh "command2"  
./ssh-exec.sh "command3"

# ✅ Schnell: 1 SSH-Verbindung mit mehreren Befehlen
./ssh-exec.sh "command1 && command2 && command3"
```

## Aktuelle Optimierungen

1. ✅ **geo-schema.ts** wurde aktualisiert:
   - Client-seitig: Verwendet `window.location.origin`
   - Server-seitig: Versucht Headers zu verwenden für dynamische baseUrl
   - Fallback: Umgebungsvariable oder Standard-URL

2. ✅ **App neu gestartet** mit den neuen Änderungen

## Nächste Schritte für maximale Effizienz

1. **SSH-Key einrichten** (einmalig, dann 10x schneller)
2. **Batch-Befehle verwenden** statt einzelner Aufrufe
3. **lokale Tests** vor dem Deployment

## Tipp: Lokale Entwicklung

Für schnelle Iterationen:
```bash
# Lokal testen
npm run dev

# Nur wenn alles funktioniert → auf Server deployen
./quick-deploy.sh <file> <remote_path>
```
