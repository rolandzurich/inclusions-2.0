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

/** Lustiges, freundliches Icon: signalisiert klar «mit INCLUSI sprechen» (Gesicht + Schallwellen) */
function InclusiIcon({ className = "w-14 h-14" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      {/* Kopf/Kreis – freundlich, weich */}
      <circle cx="32" cy="32" r="28" fill="#FF04D3" fillOpacity="0.95" />
      <circle cx="32" cy="32" r="28" stroke="white" strokeWidth="2" fill="none" />
      {/* Augen */}
      <circle cx="24" cy="28" r="4" fill="white" />
      <circle cx="40" cy="28" r="4" fill="white" />
      {/* Lächeln */}
      <path
        d="M 22 38 Q 32 46 42 38"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Schallwellen – deutlich «Sprechen» */}
      <path
        d="M 48 24 Q 58 32 48 40"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 52 20 Q 66 32 52 44"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.9"
      />
      <path
        d="M 56 16 Q 74 32 56 48"
        stroke="white"
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />
    </svg>
  );
}

export function VoiceAgent() {
  const [isListening, setIsListening] = useState(false);
  const [lastUserText, setLastUserText] = useState("");
  const [lastReply, setLastReply] = useState("");
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const stopSpeakingRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let cancelled = false;

    function detectSupport(): boolean {
      try {
        if (typeof window === "undefined") return false;
        const Sp =
          (window as any).SpeechRecognition ||
          (window as any).webkitSpeechRecognition;
        return !!Sp;
      } catch {
        return false;
      }
    }

    // Sofort prüfen und setzen
    setIsMounted(true);
    try {
      setIsSupported(detectSupport());
    } catch (e) {
      console.error("Fehler beim Prüfen der Browser-Unterstützung:", e);
      setIsSupported(false);
    }

    // Fallback: Falls nach 1s noch "Lade..." (z.B. verzögerte Effects), Status erzwingen
    const fallback = setTimeout(() => {
      if (cancelled) return;
      setIsMounted(true);
      setIsSupported((prev) => (prev === null ? detectSupport() : prev));
    }, 1000);

    return () => {
      cancelled = true;
      clearTimeout(fallback);
    };
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
      
      // Stoppe vorherige Sprachausgabe
      window.speechSynthesis.cancel();
      setIsSpeaking(true);
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "de-CH";
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      utterance.onend = () => {
        setIsSpeaking(false);
        stopSpeakingRef.current = null;
        // Focus zurück auf Button für bessere Navigation
        buttonRef.current?.focus();
      };
      
      utterance.onerror = () => {
        setIsSpeaking(false);
        stopSpeakingRef.current = null;
      };
      
      window.speechSynthesis.speak(utterance);
      
      // Speichere Stop-Funktion
      stopSpeakingRef.current = () => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        stopSpeakingRef.current = null;
      };
    } catch (e) {
      console.error("Fehler beim Sprechen:", e);
      setIsSpeaking(false);
    }
  }

  function stopSpeaking() {
    if (stopSpeakingRef.current) {
      stopSpeakingRef.current();
    }
  }

  // Keyboard-Navigation
  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleClick();
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
        
        // Benutzerfreundliche Fehlermeldungen
        const errorType = event?.error || "unknown";
        let errorMessage = "";
        
        switch (errorType) {
          case "not-allowed":
            errorMessage = "Mikrofon-Zugriff wurde verweigert. Bitte erlaube den Mikrofon-Zugriff in deinen Browser-Einstellungen und versuche es erneut.";
            break;
          case "no-speech":
            errorMessage = "Keine Sprache erkannt. Bitte versuche es noch einmal und spreche deutlich.";
            break;
          case "audio-capture":
            errorMessage = "Kein Mikrofon gefunden. Bitte stelle sicher, dass ein Mikrofon angeschlossen ist.";
            break;
          case "network":
            errorMessage = "Netzwerkfehler. Bitte überprüfe deine Internetverbindung.";
            break;
          case "aborted":
            errorMessage = "Spracherkennung wurde abgebrochen.";
            break;
          default:
            errorMessage = `Spracherkennungsfehler: ${errorType}. Bitte versuche es noch einmal.`;
        }
        
        setError(errorMessage);
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
      <section 
        className="rounded-2xl bg-white/10 p-4 md:p-5 text-white space-y-3"
        aria-label="INCLUSI – Sprach-Assistent"
      >
        <div className="flex items-center gap-3">
          <InclusiIcon className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0" />
          <div>
            <h2 className="text-xl font-semibold">INCLUSI</h2>
            <p className="text-sm text-white/80" aria-live="polite">Lade...</p>
          </div>
        </div>
      </section>
    );
  }

  if (isSupported === false) {
    return (
      <section 
        className="rounded-2xl bg-white/10 p-4 md:p-5 text-white space-y-3"
        aria-label="INCLUSI – Sprach-Assistent"
      >
        <div className="flex items-center gap-3">
          <InclusiIcon className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0" />
          <div>
            <h2 className="text-xl font-semibold">INCLUSI</h2>
            <p className="text-sm text-white/80" role="alert">
              Dein Browser unterstützt leider keine Spracherkennung. Bitte verwende Chrome oder Edge.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const statusText = isListening 
    ? "Ich höre zu. Sprich jetzt." 
    : isSpeaking 
    ? "Ich spreche gerade." 
    : "Bereit zum Zuhören.";

  return (
    <section 
      className="rounded-2xl bg-white/10 p-4 md:p-5 text-white space-y-4"
      aria-label="INCLUSI – Sprach-Assistent für barrierefreie Infos"
    >
      <div className="flex items-start gap-3">
        <InclusiIcon className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 flex-shrink-0" />
      <div className="min-w-0">
        <h2 className="text-xl md:text-2xl font-semibold">INCLUSI</h2>
        <p className="text-sm md:text-base text-white/90 mt-1">
          Dein Sprach-Assistent: Infos zu INCLUSIONS per Sprache – besonders für Menschen mit Beeinträchtigung.
        </p>
        <p className="text-sm text-white/70 mt-1">
          Klicke auf den Knopf oder drücke Enter, stelle eine Frage und höre die Antwort.
        </p>
      </div>
      </div>

      {/* Live-Region für Status-Updates */}
      <div 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
      >
        {statusText}
        {error && `Fehler: ${error}`}
        {lastUserText && `Du hast gesagt: ${lastUserText}`}
        {lastReply && `INCLUSI antwortet: ${lastReply}`}
      </div>

      {error && (
        <div 
          className="text-sm text-amber-200 bg-amber-500/15 p-3 rounded-xl border border-amber-500/25 space-y-2"
          role="alert"
          aria-live="assertive"
        >
          <div>
            <span className="font-semibold">Fehler: </span>
            {error}
          </div>
          {error.includes("Mikrofon-Zugriff") && (
            <div className="text-xs text-amber-100/90 mt-2 pt-2 border-t border-amber-500/25">
              <p className="font-semibold mb-1">So erlaubst du den Mikrofon-Zugriff:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>Chrome/Edge:</strong> Klicke auf das Schloss-Symbol in der Adressleiste → Mikrofon erlauben</li>
                <li><strong>Firefox:</strong> Klicke auf das Schloss-Symbol → Berechtigungen → Mikrofon erlauben</li>
                <li><strong>Safari:</strong> Einstellungen → Websites → Mikrofon → Erlauben</li>
                <li>Lade die Seite danach neu (F5 oder Cmd+R)</li>
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap">
        <button
          ref={buttonRef}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          className={`px-6 py-3 rounded-full font-semibold text-black transition-all duration-250 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink focus-visible:ring-offset-2 focus-visible:ring-offset-brand-gray ${
            isListening 
              ? "bg-red-600 hover:bg-red-500 animate-pulse" 
              : "bg-brand-pink hover:bg-brand-pink/90"
          }`}
          aria-label={isListening ? "Zuhören stoppen" : "Mit INCLUSI sprechen"}
          aria-pressed={isListening}
          aria-describedby="voice-status"
        >
          {isListening ? (
            <>
              <span className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 bg-white rounded-full animate-pulse" aria-hidden="true"></span>
                Zuhören stoppen
              </span>
            </>
          ) : (
            "Mit INCLUSI sprechen"
          )}
        </button>

        <p className="text-sm font-semibold text-amber-100 bg-amber-500/25 px-3 py-2 rounded-lg border border-amber-400/50 shrink-0">
          INCLUSI ist neu, versteht noch nicht alles – wir werden INCLUSI laufend verbessern.
        </p>

        {isSpeaking && (
          <button
            onClick={stopSpeaking}
            className="px-4 py-2 rounded-full font-semibold bg-white/20 hover:bg-white/30 text-white border border-white/40 transition-all duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            aria-label="Sprachausgabe stoppen"
          >
            Sprachausgabe stoppen
          </button>
        )}

        <div 
          id="voice-status"
          className="text-sm text-white/70 flex items-center gap-2"
          aria-live="polite"
        >
          {isListening && (
            <span className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-red-400 rounded-full animate-pulse" aria-hidden="true"></span>
              Höre zu...
            </span>
          )}
          {isSpeaking && (
            <span className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse" aria-hidden="true"></span>
              Spreche...
            </span>
          )}
        </div>
      </div>

      {lastUserText && (
        <div className="text-sm bg-white/5 p-3 rounded border border-white/10">
          <div className="font-semibold mb-1">Du hast gesagt:</div>
          <div className="text-white/90" aria-live="polite">{lastUserText}</div>
        </div>
      )}

      {lastReply && (
        <div className="text-sm bg-white/5 p-3 rounded border border-white/10">
          <div className="font-semibold mb-1">INCLUSI:</div>
          <div className="text-white/90" aria-live="polite">{lastReply}</div>
        </div>
      )}
    </section>
  );
}
