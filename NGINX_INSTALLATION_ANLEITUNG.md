# 🎯 Einfache Anleitung: Nginx auf Server installieren

## Schritt-für-Schritt

### 1. Datei auf Server kopieren

**Auf deinem Mac (im Terminal, NICHT per SSH verbunden):**

```bash
cd /Users/roland/Curser/inclusions-2.0
scp install-nginx-on-server.sh nginx-inclusions-domain.conf incluzone@10.55.55.155:~/inclusions-2.0/
```

### 2. Auf Server einloggen und Skript ausführen

**Auf deinem Mac (neues Terminal oder nach dem Kopieren):**

```bash
ssh incluzone@10.55.55.155
```

**Dann auf dem Server:**

```bash
cd ~/inclusions-2.0
chmod +x install-nginx-on-server.sh
./install-nginx-on-server.sh
```

Das Skript:
- ✅ Installiert Nginx
- ✅ Konfiguriert Nginx für inclusions.zone
- ✅ Lädt Nginx neu
- ✅ Prüft ob alles funktioniert

**Du wirst nach deinem sudo-Passwort gefragt** (für die Installation).

---

## Was passiert?

1. **Nginx wird installiert** (kann einige Minuten dauern)
2. **Konfiguration wird erstellt** für `inclusions.zone`
3. **Nginx wird neu geladen** mit der neuen Konfiguration
4. **Status wird angezeigt**

---

## Nach dem Setup

1. **Warte 15-60 Minuten** auf DNS-Propagierung
2. **Prüfe DNS:** https://dnschecker.org/#A/inclusions.zone
3. **Teste Website:** http://inclusions.zone

---

## Falls Fehler auftreten

Das Skript zeigt dir genau, was schiefgelaufen ist. Meist sind es:
- Passwort falsch (bei sudo)
- Internet-Verbindung auf Server
- Berechtigungen

**Bei Passwort-Abfrage:** Einfach dein Server-Passwort eingeben.
