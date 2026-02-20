# 🚀 Admin V2 – Testanleitung

## 1. Dev-Server starten

```bash
cd /Users/roland/Curser/inclusions-2.0
npm run dev
```

**Warte bis du siehst:**
```
✓ Ready in X ms
○ Local: http://localhost:3000
```

---

## 2. Admin V2 öffnen

**Haupt-URL:**
```
http://localhost:3000/admin-v2/dashboard
```

**Direkt-Links zu allen Modulen:**

### 📊 Dashboard
```
http://localhost:3000/admin-v2/dashboard
```

### 👥 CRM
```
http://localhost:3000/admin-v2/crm/contacts
http://localhost:3000/admin-v2/crm/companies
http://localhost:3000/admin-v2/crm/deals
```

### 📁 Projektmanagement
```
http://localhost:3000/admin-v2/projects
```

### 📅 Kalender & Events
```
http://localhost:3000/admin-v2/calendar
```

### 💵 Buchhaltung
```
http://localhost:3000/admin-v2/accounting
```

---

## 3. Test-Szenarien

### ✅ Test 1: Kontakt erstellen (CRM)

1. Gehe zu: http://localhost:3000/admin-v2/crm/contacts
2. Klicke: **+ Neuer Kontakt**
3. Fülle aus:
   - Vorname: Max
   - Nachname: Muster
   - E-Mail: max@example.ch
   - Telefon: +41 79 123 45 67
   - PLZ: 8000
   - Ort: Zürich
4. Klicke: **Erstellen**
5. ✓ Erfolgsmeldung oben rechts
6. ✓ Kontakt erscheint in der Tabelle

---

### ✅ Test 2: Unternehmen mit UID (CRM)

1. Gehe zu: http://localhost:3000/admin-v2/crm/companies
2. Klicke: **+ Neues Unternehmen**
3. Fülle aus:
   - Firmenname: Beispiel AG
   - UID: CHE-123.456.789
   - E-Mail: info@example.ch
   - Telefon: +41 44 123 45 67
   - PLZ: 8001
   - Ort: Zürich
4. Klicke: **Erstellen**
5. ✓ Unternehmen erscheint mit UID

---

### ✅ Test 3: Deal mit Pipeline (CRM)

1. Gehe zu: http://localhost:3000/admin-v2/crm/deals
2. Klicke: **+ Neuer Deal**
3. Fülle aus:
   - Titel: Sponsoring 2026
   - Betrag: 5000 CHF
   - Status: Lead
3. Klicke: **Erstellen**
4. ✓ Deal erscheint in "Lead"-Spalte
5. Klicke auf: **Pipeline** (oben)
6. ✓ Siehst du das Kanban-Board?
7. Bearbeite den Deal → Status: **Gewonnen**
8. ✓ Deal wandert in grüne Spalte!

---

### ✅ Test 4: Event mit RSVP (Kalender)

1. Gehe zu: http://localhost:3000/admin-v2/calendar
2. Klicke: **+ Neues Event**
3. Fülle aus:
   - Titel: Inclusions Party März 2026
   - Startzeit: 15.03.2026, 20:00
   - Endzeit: 16.03.2026, 04:00
   - Location: Halle 622
   - Max. Kapazität: 300
   - Status: Veröffentlicht
   - Crew-Only: ✓
4. Klicke: **Erstellen**
5. ✓ Event erscheint in "Kommende Events"
6. Klicke: **👋 Zusagen**
7. Fülle aus:
   - E-Mail: crew@inclusions.zone
   - Name: Max Crew
8. Klicke: **✓ Zusagen**
9. ✓ "1 Zusage / 300 Plätze"
10. ✓ Fortschrittsbalken zeigt ~0.3%

---

### ✅ Test 5: Buchhaltung mit MWST

1. Gehe zu: http://localhost:3000/admin-v2/accounting
2. Klicke: **+ Neuer Eintrag**
3. **Einnahme erfassen:**
   - Typ: 💰 Einnahme
   - Datum: 01.02.2026
   - Beschreibung: Eintrittsgelder Party Februar
   - Kategorie: Eintrittsgelder
   - Betrag: 5000 CHF
   - MWST: 8.1%
4. ✓ Siehst du die Berechnung?
   - Netto: CHF 5'000.00
   - MWST: CHF 405.00
   - Brutto: CHF 5'405.00
5. Klicke: **Erstellen**
6. ✓ Grüne Karte "Einnahmen": CHF 5'000.00

7. **Ausgabe erfassen:**
8. Klicke: **+ Neuer Eintrag**
   - Typ: 💸 Ausgabe
   - Beschreibung: Location-Miete Halle 622
   - Kategorie: Location-Miete
   - Betrag: 2000 CHF
   - MWST: 8.1%
   - Referenz-Nr.: RE-2026-001
9. Klicke: **Erstellen**
10. ✓ Rote Karte "Ausgaben": CHF 2'000.00
11. ✓ Blaue Karte "Saldo": CHF 3'000.00

---

### ✅ Test 6: Projekt mit Task-Board

1. Gehe zu: http://localhost:3000/admin-v2/projects
2. Klicke: **+ Neues Projekt**
3. Fülle aus:
   - Titel: Website Redesign 2026
   - Beschreibung: Kompletter Relaunch
   - Status: Aktiv
   - Budget: 15000 CHF
   - Startdatum: 01.03.2026
   - Enddatum: 30.06.2026
4. Klicke: **Erstellen**
5. ✓ Projekt-Card erscheint
6. **Klicke auf die Card** (öffnet Detail-Seite)
7. ✓ Siehst du das Kanban-Board?

8. **Task erstellen:**
9. Klicke: **+ Neue Task**
10. Fülle aus:
    - Titel: Mockups erstellen
    - Status: Todo
    - Priorität: 🔥 Dringend
    - Fälligkeitsdatum: 10.03.2026
    - Zugewiesen: Sarah
    - Geschätzte Stunden: 8
11. Klicke: **Erstellen**
12. ✓ Task erscheint in "Todo"-Spalte

13. **2. Task erstellen:**
    - Titel: Frontend entwickeln
    - Priorität: ⬆️ Hoch
    - Geschätzte Stunden: 40
14. **3. Task erstellen:**
    - Titel: Testing
    - Priorität: ➡️ Mittel
    - Geschätzte Stunden: 16

15. ✓ Siehst du alle 3 Tasks?

16. **Task verschieben:**
17. Klicke auf "Mockups erstellen" → Bearbeiten
18. Status: **In Arbeit**
19. Tatsächliche Stunden: 2
20. Speichern
21. ✓ Task wandert in "In Arbeit"-Spalte!

22. **Task abschließen:**
23. Bearbeite "Mockups erstellen"
24. Status: **Erledigt**
25. Tatsächliche Stunden: 10
26. Speichern
27. ✓ Task in "Erledigt"-Spalte
28. ✓ Projekt-Fortschritt: 1/3 (33%)

---

## 4. Alle Module durchgehen

### Checkliste:
- [ ] Kontakte erstellen/bearbeiten/löschen
- [ ] Unternehmen mit UID anlegen
- [ ] Deal durch Pipeline bewegen (Lead → Gewonnen)
- [ ] Event mit RSVP-Zusagen
- [ ] Buchhaltung: Einnahme + Ausgabe mit MWST
- [ ] Projekt mit 3 Tasks erstellen
- [ ] Tasks durch Kanban-Board verschieben
- [ ] Alle Filter testen (Suche, Status, Datum)

---

## 5. Problembehebung

### Server startet nicht?
```bash
# Node-Module neu installieren
npm install

# Nochmal versuchen
npm run dev
```

### Datenbank-Fehler?
1. Prüfe `.env.local`:
   ```bash
   cat .env.local | grep DB_
   ```
2. Sollte zeigen:
   ```
   DB_HOST=10.55.55.155
   DB_PORT=5432
   DB_DATABASE=inclusions_db
   DB_USER=inclusions_user
   DB_PASSWORD=inclusions_secure_password_2024!
   ```

### Port 3000 bereits belegt?
```bash
# Prozess finden und beenden
lsof -ti:3000 | xargs kill -9

# Nochmal starten
npm run dev
```

### Browser-Cache leeren
- Chrome/Safari: Cmd + Shift + R
- Oder: Inkognito-Modus

---

## 6. Alle URLs auf einen Blick

```
Dashboard:     http://localhost:3000/admin-v2/dashboard
Kontakte:      http://localhost:3000/admin-v2/crm/contacts
Unternehmen:   http://localhost:3000/admin-v2/crm/companies
Deals:         http://localhost:3000/admin-v2/crm/deals
Projekte:      http://localhost:3000/admin-v2/projects
Kalender:      http://localhost:3000/admin-v2/calendar
Buchhaltung:   http://localhost:3000/admin-v2/accounting
```

---

## 🎉 Viel Spaß beim Testen!

Alle Module sind fertig und funktionsfähig. Bei Fragen oder Problemen einfach melden!
