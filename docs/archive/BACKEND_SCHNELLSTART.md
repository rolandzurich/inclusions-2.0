# Backend Schnellstart 🚀

## In 3 Schritten zum Admin-Backend

### 1️⃣ Development Server starten

```bash
npm run dev
```

Der Server läuft auf: **http://localhost:3000**

### 2️⃣ Admin-Login öffnen

Besuchen Sie im Browser: **http://localhost:3000/admin/login**

### 3️⃣ Einloggen

**Zugangsdaten:**
- E-Mail: `info@inclusions.zone`
- Passwort: `Inclusions2026!`

---

## Das war's! 🎉

Sie sind jetzt im Admin-Backend und können:
- 📊 Dashboard mit allen Statistiken sehen
- 📝 Booking-Anfragen verwalten
- 💌 Newsletter-Abonnenten verwalten
- 🌟 VIP-Anmeldungen verwalten (Ihr Kernstück!)

## Testdaten

Ich habe bereits Beispieldaten erstellt, damit Sie das System sofort testen können:
- ✅ 3 Booking-Anfragen
- ✅ 3 VIP-Anmeldungen
- ✅ 4 Newsletter-Abonnenten

## Wo sind die Daten?

Alle Formulardaten werden hier gespeichert:
```
data/
├── contact_requests.json       ← Booking-Anfragen
├── vip_registrations.json      ← VIP-Anmeldungen
└── newsletter_subscribers.json ← Newsletter-Abonnenten
```

## Navigation im Backend

Nach dem Login sehen Sie oben die Navigation:
- **Dashboard** - Übersicht
- **Booking-Anfragen** - Alle Buchungsanfragen
- **Newsletter** - Alle Newsletter-Abonnenten
- **VIP-Anmeldungen** - Alle VIP-Registrierungen (WICHTIG!)
- **Content** - Inhalte verwalten
- **DJ-Texte** - DJ-Beschreibungen

## Wichtige Features

### 🔵 "Neu"-Badge
Neue, ungesehene Einträge werden mit einem blauen "Neu"-Badge markiert.

### ✅ Automatisches Markieren
Wenn Sie einen Eintrag anklicken, wird er automatisch als "gesehen" markiert.

### 📥 CSV-Export
Jeder Bereich hat einen Export-Button, um Daten als CSV herunterzuladen.

### 🗑️ Löschen
Sie können einzelne Einträge löschen (z.B. nach Bearbeitung oder bei Spam).

---

**Viel Erfolg mit Ihrem Admin-Backend!** 🎊

Für mehr Details siehe: `ADMIN_BACKEND_ANLEITUNG.md`
