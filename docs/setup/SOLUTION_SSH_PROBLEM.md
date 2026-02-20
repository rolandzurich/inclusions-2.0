# Lösung: SSH-Verbindungsproblem

## Problem:
Das System hat zu viele offene SSH-Verbindungen ("no more ptys"). Das passiert, wenn viele expect-Skripte gleichzeitig laufen.

## Lösung: Einfacher Befehl

Ich habe ein einfaches Skript erstellt, das du **einmalig** ausführen musst:

```bash
cd /Users/roland/Curser/inclusions-2.0
./one-command-setup.sh
```

**Du musst das Passwort einmal eingeben:** `13vor12!Asdf`

Das Skript macht dann automatisch:
1. ✅ Kopiert .env Datei auf Server
2. ✅ Prüft ob Keys vorhanden sind
3. ✅ Startet App neu

## Alternative: Falls das auch nicht funktioniert

**Option 1: Mac neu starten**
- Das beendet alle offenen SSH-Verbindungen
- Dann sollte `./one-command-setup.sh` funktionieren

**Option 2: Manuell (nur 3 Befehle)**
```bash
# 1. Datei kopieren
scp .env.production incluzone@10.55.55.155:~/inclusions-2.0/.env

# 2. App neu starten
ssh incluzone@10.55.55.155 "cd ~/inclusions-2.0 && pkill -f 'next start' && npm start > /tmp/next.log 2>&1 &"
```

## Warum passiert das?

- Zu viele expect-Skripte laufen gleichzeitig
- Jedes expect-Skript öffnet ein Pseudo-Terminal (PTY)
- macOS hat ein Limit für gleichzeitige PTYs
- Lösung: Alle Prozesse beenden oder Mac neu starten

## Empfehlung:

**Führe einfach aus:** `./one-command-setup.sh`

Das ist der einfachste Weg - du musst nur einmal das Passwort eingeben, dann läuft alles automatisch.
