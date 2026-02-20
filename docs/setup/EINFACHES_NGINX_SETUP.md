# 🎯 Einfache Anleitung: Nginx automatisch konfigurieren

## Option 1: Automatisches Skript (Empfohlen)

**Auf deinem Mac, im Terminal:**

```bash
cd /Users/roland/Curser/inclusions-2.0
./auto-setup-nginx-domain.sh
```

Das Skript macht alles automatisch:
- ✅ Kopiert die Dateien auf den Server
- ✅ Konfiguriert Nginx
- ✅ Lädt Nginx neu
- ✅ Prüft ob alles funktioniert

---

## Option 2: Schritt für Schritt (falls Skript nicht funktioniert)

**Kopiere diese Befehle EINZELN und führe sie aus:**

### 1. Dateien auf Server kopieren:
```bash
cd /Users/roland/Curser/inclusions-2.0
scp nginx-inclusions-domain.conf setup-nginx-domain.sh incluzone@10.55.55.155:~/inclusions-2.0/
```

### 2. Nginx konfigurieren:
```bash
ssh incluzone@10.55.55.155 "cd ~/inclusions-2.0 && chmod +x setup-nginx-domain.sh && ./setup-nginx-domain.sh"
```

---

## Was passiert?

1. **Dateien werden kopiert** auf den Server
2. **Nginx-Konfiguration wird erstellt** für `inclusions.zone`
3. **Nginx wird neu geladen** mit der neuen Konfiguration
4. **Status wird geprüft** ob alles funktioniert

---

## Nach dem Setup

1. **Warte 15-60 Minuten** auf DNS-Propagierung
2. **Prüfe DNS:** https://dnschecker.org/#A/inclusions.zone
3. **Teste Website:** http://inclusions.zone

---

## Falls Fehler auftreten

Das Skript zeigt dir genau, was schiefgelaufen ist. Meist sind es:
- VPN-Verbindung nicht aktiv
- Server nicht erreichbar
- Passwort wird abgefragt (normal bei SSH)

**Bei Passwort-Abfrage:** Einfach dein Server-Passwort eingeben.
