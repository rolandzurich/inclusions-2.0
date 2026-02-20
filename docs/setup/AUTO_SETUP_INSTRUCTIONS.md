# Automatische Lösung für SSH-Blockierung

## Problem:
SSH-Verbindungen werden blockiert ("Operation not permitted") - wahrscheinlich durch VPN.

## Lösung: Einfacher Befehl (nur einmal ausführen)

Ich habe ein Skript erstellt, das alles automatisch macht. Du musst es **nur einmal** ausführen:

```bash
cd /Users/roland/Curser/inclusions-2.0
./one-command-setup.sh
```

**Passwort eingeben:** `13vor12!Asdf` (wird einmal abgefragt)

## Falls das nicht funktioniert:

Das VPN blockiert möglicherweise SSH-Verbindungen. In diesem Fall:

**Option 1: VPN kurz deaktivieren**
1. Tunnelblick deaktivieren
2. `./one-command-setup.sh` ausführen
3. VPN wieder aktivieren

**Option 2: VPN-Einstellungen anpassen**
- Tunnelblick → Einstellungen → Routing
- Stelle sicher, dass lokale Netzwerke nicht über VPN laufen
- Oder füge `10.55.55.155` zu den Ausnahmen hinzu

## Was das Skript macht:

1. ✅ Kopiert `.env.production` → Server `.env`
2. ✅ Prüft ob Keys vorhanden sind
3. ✅ Startet App neu

## Nach dem Ausführen:

- Voice Agent sollte funktionieren
- E-Mail-Versand sollte funktionieren

**Teste:** http://10.55.55.155
