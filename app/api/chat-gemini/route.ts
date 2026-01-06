import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Route muss dynamisch sein, da wir request.json() verwenden
export const dynamic = 'force-dynamic';

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

    const prompt = `
Du bist ein Voice-Assistent für Menschen mit kognitiver Beeinträchtigung.
Antworte IMMER in sehr einfacher deutscher Sprache:
- kurze Sätze
- keine Fremdwörter
- maximal 3 Sätze.

Nutzer sagt: "${userText}"
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
    return NextResponse.json(
      { 
        error: "Fehler beim Aufruf von Gemini",
        details: errorMessage
      },
      { status: 500 }
    );
  }
}