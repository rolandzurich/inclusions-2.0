import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getAllEvents, getUpcomingEvents, formatDate } from "@/lib/event-utils";
import { getAllDJs, getAllDJPairs, getBookableDJs } from "@/lib/dj-utils";

// Route muss dynamisch sein, da wir request.json() verwenden
export const dynamic = 'force-dynamic';

/**
 * Erstellt einen Kontext-String mit allen relevanten Webseiten-Daten für Inclusi.
 * Datenquellen und Erweiterung: siehe INCLUSI_PLACEMENT.md, Abschnitt "Datenquellen für Inclusi".
 */
function createWebsiteContext(): string {
  const events = getAllEvents();
  const upcomingEvents = getUpcomingEvents();
  const djs = getAllDJs();
  const pairs = getAllDJPairs();
  const bookableDJs = getBookableDJs();

  let context = "=== INCLUSIONS WEBSITE INFORMATIONEN ===\n\n";
  
  // Events
  context += "EVENTS:\n";
  if (upcomingEvents.length > 0) {
    context += "Kommende Events:\n";
    upcomingEvents.forEach(event => {
      context += `- ${event.name}: ${formatDate(event.date)} in ${event.location}. ${event.description}\n`;
      if (event.lineup && event.lineup.length > 0) {
        context += `  Lineup: ${event.lineup.join(", ")}\n`;
      }
    });
  }
  
  const pastEvents = events.filter(e => e.status === "past");
  if (pastEvents.length > 0) {
    context += "\nVergangene Events:\n";
    pastEvents.slice(0, 3).forEach(event => { // Nur die letzten 3
      context += `- ${event.name}: ${formatDate(event.date)} in ${event.location}. ${event.description}\n`;
    });
  }

  // DJs
  context += "\n\nDJS:\n";
  djs.forEach(dj => {
    context += `- ${dj.name}`;
    if (dj.text && dj.text !== "Infos folgen") {
      context += `: ${dj.text.substring(0, 100)}${dj.text.length > 100 ? "..." : ""}`;
    }
    if (dj.hasDisability) {
      context += " (Inklusiver DJ)";
    }
    if (dj.bookableIndividually) {
      context += " (Einzeln buchbar)";
    }
    context += "\n";
  });

  // DJ Pairs
  if (pairs.length > 0) {
    context += "\nDJ PAIRS:\n";
    pairs.forEach(pair => {
      context += `- ${pair.name}`;
      if (pair.text) {
        context += `: ${pair.text}`;
      }
      context += "\n";
    });
  }

  // Allgemeine Infos
  context += "\n\nALLGEMEINE INFORMATIONEN:\n";
  context += "- Inclusions ist ein inklusives Event-Format\n";
  context += "- Menschen mit und ohne Beeinträchtigung feiern gemeinsam\n";
  context += "- Es gibt DJs, Dance Crew und Events\n";
  context += "- Events finden meist im Supermarket Zürich statt\n";
  context += "- DJs können einzeln oder als Pairs gebucht werden\n";

  // Anmeldung, Tickets, VIP – wichtig für „Wie kann ich mich anmelden?“ etc.
  context += "\n\nANMELDUNG, TICKETS und WIE DABEI SEIN (für Fragen wie: Wie kann ich mich anmelden? Wie melde ich mich an? Wie komme ich zur Party?):\n";
  context += "- Es gibt zwei Wege:\n";
  context += "  1) VIP (gratis): Wer IV-Ausweis, Beeinträchtigung oder Behinderung hat: Gratis Eintritt. Anmeldung vorher auf der Webseite unter VIP-Anmeldung nötig (Seite: anmeldung/vip). Mindestens 20 Jahre. Anmeldung im Vorfeld ist Pflicht. Betreuer nur gratis bei 1-zu-1 Betreuung. Freunde und Familie kaufen ein Ticket. TIXI-Taxi kann bei der VIP-Anmeldung angefragt werden. VIP-Vorteile: barrierefreier Club, Helfer-Team, vergünstigtes Essen und Trinken.\n";
  context += "  2) Party People / Gäste: Ticket kaufen bei Supermarket (supermarket.li/events/inclusions/).\n";
  context += "- DJs buchen: Auf der Webseite unter DJs oder Booking (djs, booking).\n";
  context += "- Dance Crew buchen: Auf der Webseite unter Dance Crew (dance-crew).\n";
  context += "- Spenden: Auf der Webseite unter Spenden (spenden). TWINT möglich.\n";
  context += "- Newsletter: Auf der Webseite unter Newsletter anmelden.\n";

  return context;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY ist nicht konfiguriert" },
      { status: 500 }
    );
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  // Verwende gemini-2.5-flash (aktuelles verfügbares Modell, schnell und effizient)
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  try {
    const body = await req.json();
    const userText: string = body?.message ?? "";

    if (!userText || userText.trim() === "") {
      return NextResponse.json(
        { error: "Keine Nachricht erhalten" },
        { status: 400 }
      );
    }

    // Lade Webseiten-Daten als Kontext
    const websiteContext = createWebsiteContext();

    const prompt = `
Du bist ein freundlicher Voice-Assistent für Menschen mit verschiedenen Beeinträchtigungen (kognitive, sprachliche, sensorische).

WICHTIGE REGELN für deine Antworten:
1. Sprache: Sehr einfaches Deutsch, wie zu einem guten Freund
2. Länge: Maximal 2-3 kurze Sätze (nicht mehr als 20 Wörter insgesamt)
3. Wörter: Nur einfache, bekannte Wörter. Keine Fremdwörter, keine Fachbegriffe
4. Struktur: Ein Gedanke pro Satz. Klare, direkte Aussagen
5. Ton: Freundlich, ermutigend, geduldig. Keine komplizierten Erklärungen
6. Beispiele: Wenn nötig, ein einfaches Beispiel geben
7. Daten: Nutze NUR die Informationen aus dem Kontext unten. Erfinde nichts!
8. Bei Fragen wie "Wie kann ich mich anmelden?", "Wie melde ich mich an?": Zuerst die zwei Wege nennen (VIP auf der Webseite / Ticket bei Supermarket). Kurz und klar.

Wenn du die Frage nicht verstehst oder die Information nicht im Kontext steht, sage einfach: "Das habe ich nicht verstanden. Kannst du es anders sagen?" oder "Das weiß ich leider nicht."

=== KONTEXT: WEBSITE-DATEN ===
${websiteContext}
=== ENDE KONTEXT ===

Nutzer sagt: "${userText}"

Antworte jetzt in sehr einfacher Sprache basierend auf den Informationen aus dem Kontext:
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    if (!responseText) {
      return NextResponse.json(
        { error: "Keine Antwort von Gemini erhalten" },
        { status: 500 }
      );
    }

    return NextResponse.json({ reply: responseText });
  } catch (error: any) {
    console.error("Gemini API Fehler:", error);
    const errorMessage = error?.message || "Unbekannter Fehler";
    const errorString = JSON.stringify(error, null, 2);
    
    // Detaillierte Fehlerbehandlung
    if (errorMessage.includes("403") || errorMessage.includes("API key") || errorMessage.includes("API_KEY")) {
      return NextResponse.json(
        { 
          error: "API-Key Problem",
          details: "Der API-Key ist ungültig oder gesperrt. Bitte erstelle einen neuen API-Key in Google AI Studio.",
          debug: process.env.NODE_ENV === 'development' ? {
            keyExists: !!process.env.GEMINI_API_KEY,
            keyLength: process.env.GEMINI_API_KEY?.length || 0,
            errorMessage: errorMessage
          } : undefined
        },
        { status: 500 }
      );
    }
    
    // Wenn es ein Netzwerk- oder anderer Fehler ist
    if (errorMessage.includes("fetch") || errorMessage.includes("network")) {
      return NextResponse.json(
        { 
          error: "Verbindungsfehler",
          details: "Fehler beim Verbinden zur Gemini API. Bitte prüfe deine Internetverbindung.",
          debug: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        error: "Fehler beim Aufruf von Gemini",
        details: errorMessage,
        debug: process.env.NODE_ENV === 'development' ? {
          errorType: error?.name,
          errorMessage: errorMessage,
          stack: error?.stack?.split('\n').slice(0, 3)
        } : undefined
      },
      { status: 500 }
    );
  }
}