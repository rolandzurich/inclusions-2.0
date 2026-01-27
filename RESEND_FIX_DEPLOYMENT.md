# 📧 Resend-Fix Deployment - Einfache Anleitung

## ✅ Was wurde geändert?

Alle drei API-Routen wurden aktualisiert, um **professionelle E-Mail-Templates** zu verwenden:

1. **Contact-Formular** (`/api/contact`)
   - ✅ Sendet Bestätigungs-E-Mail an Benutzer
   - ✅ Sendet Benachrichtigung an `info@inclusions.zone`

2. **Newsletter-Formular** (`/api/newsletter`)
   - ✅ Sendet Willkommens-E-Mail an Benutzer
   - ✅ Sendet Benachrichtigung an `info@inclusions.zone`

3. **VIP-Formular** (`/api/vip`)
   - ✅ Sendet Bestätigungs-E-Mail an Benutzer
   - ✅ Sendet Benachrichtigung an `info@inclusions.zone`

---

## 🚀 Deployment - Methode 1: Manuell via Terminal

### Schritt 1: Dateien hochladen

Öffne ein Terminal und führe folgende Befehle aus:

```bash
# Navigiere zum Projekt-Verzeichnis
cd /Users/roland/Curser/inclusions-2.0

# Lade Contact Route hoch
scp app/api/contact/route.ts incluzone@10.55.55.155:/home/incluzone/inclusions-2.0/app/api/contact/route.ts

# Lade Newsletter Route hoch
scp app/api/newsletter/route.ts incluzone@10.55.55.155:/home/incluzone/inclusions-2.0/app/api/newsletter/route.ts

# Lade VIP Route hoch
scp app/api/vip/route.ts incluzone@10.55.55.155:/home/incluzone/inclusions-2.0/app/api/vip/route.ts
```

**Passwort bei jeder Eingabe:** `13vor12!Asdf`

### Schritt 2: App neu starten

```bash
# Verbinde mit dem Server
ssh incluzone@10.55.55.155

# Passwort: 13vor12!Asdf

# Navigiere zum App-Verzeichnis
cd /home/incluzone/inclusions-2.0

# Starte App neu
pm2 restart all

# Prüfe Status
pm2 status

# Beende SSH-Verbindung
exit
```

---

## 🚀 Deployment - Methode 2: Mit Tar-Archiv

### Schritt 1: Archiv hochladen

```bash
# Lade Archiv hoch
scp resend-fix.tar.gz incluzone@10.55.55.155:/home/incluzone/

# Passwort: 13vor12!Asdf
```

### Schritt 2: Auf Server entpacken und App neu starten

```bash
# Verbinde mit dem Server
ssh incluzone@10.55.55.155

# Passwort: 13vor12!Asdf

# Entpacke Archiv
cd /home/incluzone
tar -xzf resend-fix.tar.gz -C inclusions-2.0/

# Starte App neu
cd inclusions-2.0
pm2 restart all

# Prüfe Status
pm2 status

# Beende SSH-Verbindung
exit
```

---

## 🚀 Deployment - Methode 3: One-Liner (Einfachste Methode)

Kopiere diesen Befehl und führe ihn in deinem Terminal aus:

```bash
cd /Users/roland/Curser/inclusions-2.0 && \
scp app/api/contact/route.ts app/api/newsletter/route.ts app/api/vip/route.ts incluzone@10.55.55.155:/home/incluzone/inclusions-2.0/app/api/ && \
ssh incluzone@10.55.55.155 "cd /home/incluzone/inclusions-2.0 && pm2 restart all && pm2 status"
```

**Hinweis:** Du wirst 2x nach dem Passwort gefragt: `13vor12!Asdf`

---

## 🧪 Testen

Nach dem Deployment teste die Formulare auf der Live-Seite:

1. **Öffne:** https://inclusions.zone
2. **Teste Contact-Formular** - prüfe ob du eine Bestätigungs-E-Mail erhältst
3. **Teste Newsletter-Formular** - prüfe ob du eine Willkommens-E-Mail erhältst
4. **Teste VIP-Formular** - prüfe ob du eine Bestätigungs-E-Mail erhältst
5. **Prüfe info@inclusions.zone** - sollte Benachrichtigungen für alle Formulare erhalten

---

## 📋 Resend-Konfiguration

Die E-Mails werden versendet über:

- **Von:** `noreply@inclusions.zone`
- **An (Bestätigung):** E-Mail aus dem Formular
- **An (Benachrichtigung):** `info@inclusions.zone`
- **API Key:** `re_an8y4Hrw_J5bcb33jndu9cb2avtyd87vB`

---

## 🆘 Falls etwas nicht funktioniert

### Server-Logs anzeigen:

```bash
ssh incluzone@10.55.55.155
pm2 logs inclusions
```

### App manuell neu starten:

```bash
ssh incluzone@10.55.55.155
cd /home/incluzone/inclusions-2.0
pm2 restart all
```

### Nginx-Status prüfen:

```bash
ssh incluzone@10.55.55.155
sudo systemctl status nginx
```

---

## ✅ Fertig!

Nach dem Deployment sollten alle Formulare:
1. Eine Bestätigungs-E-Mail an den Benutzer senden
2. Eine Benachrichtigung an `info@inclusions.zone` senden

🌐 **Live-Seite:** https://inclusions.zone
