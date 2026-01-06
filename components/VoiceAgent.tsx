"use client";

import { useState, useRef, useEffect } from "react";

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

type SpeechRecognition = any;
type SpeechRecognitionEvent = any;

export function VoiceAgent() {
  const [isListening, setIsListening] = useState(false);
  const [lastUserText, setLastUserText] = useState("");
  const [lastReply, setLastReply] = useState("");
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    setIsMounted(true);
    try {
      if (typeof window !== "undefined") {
        const SpeechRecognition =
          (window as any).SpeechRecognition ||
          (window as any).webkitSpeechRecognition;
        setIsSupported(!!SpeechRecognition);
      }
    } catch (e) {
      console.error("Fehler beim Prüfen der Browser-Unterstützung:", e);
      setIsSupported(false);
    }
  }, []);

  function getRecognition(): SpeechRecognition | null {
    try {
      if (typeof window === "undefined") return null;

      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        return null;
      }

      if (!recognitionRef.current) {
        try {
          const rec: SpeechRecognition = new SpeechRecognition();
          rec.lang = "de-DE";
          rec.interimResults = false;
          rec.maxAlternatives = 1;
          recognitionRef.current = rec;
        } catch (createError) {
          console.error("Fehler beim Erstellen:", createError);
          return null;
        }
      }

      return recognitionRef.current;
    } catch (error) {
      console.error("Fehler in getRecognition:", error);
      return null;
    }
  }

  function speak(text: string) {
    try {
      if (typeof window === "undefined") return;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "de-CH";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error("Fehler beim Sprechen:", e);
    }
  }

  async function handleClick() {
    try {
      setError(null);
      const rec = getRecognition();
      
      if (!rec) {
        setError("Spracherkennung nicht verfügbar");
        setIsListening(false);
        return;
      }

      if (isListening) {
        try {
          rec.stop();
        } catch (e) {
          console.error("Fehler beim Stoppen:", e);
        }
        setIsListening(false);
        return;
      }

      setIsListening(true);
      setLastUserText("");
      setLastReply("");

      rec.onresult = async (event: SpeechRecognitionEvent) => {
        try {
          if (!event?.results?.[0]?.[0]?.transcript) {
            setIsListening(false);
            return;
          }
          
          const text = event.results[0][0].transcript;
          setLastUserText(text);
          setIsListening(false);

          try {
            const res = await fetch("/api/chat-gemini", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ message: text }),
            });

            if (!res.ok) {
              const errorData = await res.json().catch(() => ({}));
              throw new Error(`HTTP ${res.status}: ${errorData.details || errorData.error || "Unbekannter Fehler"}`);
            }

            const data = await res.json();
            
            if (data.error) {
              throw new Error(data.details || data.error);
            }
            
            const reply = data.reply ?? "Ich habe dich nicht verstanden.";
            setLastReply(reply);
            
            try {
              speak(reply);
            } catch (speakError) {
              console.error("Fehler beim Sprechen:", speakError);
            }
          } catch (fetchError: any) {
            console.error("Fehler beim API-Aufruf:", fetchError);
            const errorMsg = fetchError?.message || "Unbekannter Fehler";
            setError(`Fehler beim Abrufen der Antwort: ${errorMsg}`);
            setLastReply("Es gab einen Fehler. Bitte versuche es noch einmal.");
          }
        } catch (e) {
          console.error("Fehler beim Verarbeiten:", e);
          setIsListening(false);
          setError("Fehler beim Verarbeiten der Sprache");
        }
      };

      rec.onerror = (event: any) => {
        console.error("Spracherkennungsfehler:", event?.error);
        setIsListening(false);
        setError(`Spracherkennungsfehler: ${event?.error || "Unbekannt"}`);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      try {
        rec.start();
      } catch (startError) {
        console.error("Fehler beim Starten:", startError);
        setIsListening(false);
        setError("Fehler beim Starten der Spracherkennung");
      }
    } catch (error) {
      console.error("Unerwarteter Fehler:", error);
      setIsListening(false);
      setError("Ein unerwarteter Fehler ist aufgetreten");
    }
  }

  if (!isMounted || isSupported === null) {
    return (
      <div className="mt-8 rounded-2xl bg-white/10 p-4 text-white space-y-4">
        <h2 className="text-xl font-semibold">
          Mit mir sprechen (Test-Voice-Agent)
        </h2>
        <p className="text-sm text-white/80">Lade...</p>
      </div>
    );
  }

  if (isSupported === false) {
    return (
      <div className="mt-8 rounded-2xl bg-white/10 p-4 text-white space-y-4">
        <h2 className="text-xl font-semibold">
          Mit mir sprechen (Test-Voice-Agent)
        </h2>
        <p className="text-sm text-white/80">
          Dein Browser unterstützt leider keine Spracherkennung. Bitte verwende Chrome oder Edge.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-2xl bg-white/10 p-4 text-white space-y-4">
      <h2 className="text-xl font-semibold">
        Mit mir sprechen (Test-Voice-Agent)
      </h2>
      <p className="text-sm text-white/80">
        Klicke auf den Knopf, sprich einen Satz und höre die Antwort.
      </p>

      {error && (
        <div className="text-sm text-red-400 bg-red-500/20 p-2 rounded">
          {error}
        </div>
      )}

      <button
        onClick={handleClick}
        className={`px-4 py-2 rounded-full font-semibold ${
          isListening ? "bg-red-500" : "bg-brand-pink"
        } text-black`}
      >
        {isListening ? "Zuhören stoppen" : "Mit mir sprechen"}
      </button>

      {lastUserText && (
        <div className="text-sm">
          <div className="font-semibold">Du hast gesagt:</div>
          <div>{lastUserText}</div>
        </div>
      )}

      {lastReply && (
        <div className="text-sm">
          <div className="font-semibold">Assistent:</div>
          <div>{lastReply}</div>
        </div>
      )}
    </div>
  );
}
