# Inclusi – Weitere Platzierungsorte (für später)

**Inclusi** ist der Sprach-Assistent von Inclusions und unterstützt insbesondere Menschen mit Beeinträchtigung, Infos per Sprache zu erhalten.

---

## Datenquellen für Inclusi (Voice Agent)

Der Kontext für Inclusi wird in **`app/api/chat-gemini/route.ts`** in der Funktion **`createWebsiteContext()`** aufgebaut. Dort werden diese Quellen eingebunden:

| Thema | Quelle | Hinweis |
|-------|--------|---------|
| **Events** (Datum, Ort, Line-up) | `lib/event-utils.ts` → `data/events.json` | `getAllEvents()`, `getUpcomingEvents()`, `formatDate()` |
| **DJs** | `lib/dj-utils.ts` → `data/djs.json` | `getAllDJs()`, `getBookableDJs()` |
| **DJ Pairs** | `lib/dj-utils.ts` → `data/djs.json` | `getAllDJPairs()` |
| **Anmeldung, VIP, Tickets** | Derzeit **fest im Code** in `createWebsiteContext()` | Texte zu VIP-Anmeldung, Supermarket-Tickets, DJ/Dance-Crew-Booking, Spenden, Newsletter. Wenn sich Abläufe oder Texte ändern (z.B. neue Ticket-URL, neue VIP-Regeln): in `createWebsiteContext()` anpassen. |
| **Allgemeine Infos** | Ebenfalls fest in `createWebsiteContext()` | Kurzbeschreibung Inclusions, Supermarket, etc. |

**Typische Nutzerfragen und wo die Antwort herkommt:**
- *„Wie kann ich mich anmelden?“* → Abschnitt **ANMELDUNG, TICKETS und WIE DABEI SEIN** (VIP vs. Ticket Supermarket).
- *„Wann ist das nächste Event?“* / *„Wo?“* → **EVENTS** (events.json).
- *„Was ist VIP?“* / *„Gratis Eintritt?“* → **ANMELDUNG** (VIP-Regeln) + **EVENTS**.
- *„DJs buchen?“* → **ANMELDUNG** („DJs“/„Booking“) + **DJS**.

**Später ausbaubar:**  
Falls gewünscht, könnten z.B. Texte aus `app/anmeldung/vip/page.tsx`, `app/page.tsx` oder aus einem CMS/JSON geladen werden, damit Inclusi automatisch mit dem Webinhalt mitzieht. Aktuell reicht der feste Kontext für die wichtigsten Fragen.

## Aktuell umgesetzt
- **Startseite** (`app/page.tsx`): Above the fold, direkt nach dem Hero-Bild, vor «Vom Event zur Bewegung»

## Vorgeschlagene weitere Orte

| Seite | Datei | Empfohlene Position | Begründung |
|-------|-------|---------------------|------------|
| **Über uns** | `app/ueber-uns/page.tsx` | Nach Hero/Intro, vor oder nach «Was ist Inclusions» | Infos zur Organisation per Sprache |
| **Events** | `app/events/page.tsx` | Oben nach Intro oder in der Sidebar | Datum, Ort, Tickets per Sprache abfragen |
| **VIP-Anmeldung** | `app/anmeldung/vip/page.tsx` | Am Seitenanfang oder vor dem Formular | Ablauf, Voraussetzungen, Barrierefreiheit per Sprache |
| **DJs** | `app/djs/page.tsx` | Nach der Intro-Section | Line-up, DJ Pairs, Buchung per Sprache |
| **Rückblick** | `app/rueckblick/page.tsx` | Nach Hero/Intro | Eindrücke von Inclusions 1 per Sprache |
| **Spenden** | `app/spenden/page.tsx` | Nach der Einleitung | Zweck, TWINT, Kontoverbindung per Sprache |
| **Dance Crew** | `app/dance-crew/page.tsx` | Nach Intro | Buchung, Shows, Inklusion per Sprache |
| **Medien** | `app/medien/page.tsx` | Oben | Presse, Fotos, Kontakt per Sprache |
| **Footer (global)** | `components/Footer.tsx` oder `components/Header.tsx` | Kleines «Mit Inclusi sprechen»-Icon/Link, der zu einer festen Inclusi-Section oder Modal führt | Auf allen Seiten erreichbar, besonders für Barrierefreiheit |

## Technische Hinweise
- Die Komponente `VoiceAgent` (Inclusi) wird per `dynamic(..., { ssr: false })` geladen.
- Beim Einbau auf neuen Seiten: `VoiceAgent` aus `@/components/VoiceAgent` importieren und einbinden.
- Optional: Eine `compact`-Variante für Sidebar/Header könnte die Sichtbarkeit erhöhen, ohne viel Platz zu beanspruchen.
