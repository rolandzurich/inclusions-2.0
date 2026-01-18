"use client";

/**
 * Wird angezeigt, wenn ein Fehler im Root-Layout auftritt.
 * Muss eigenes <html> und <body> rendern, da es das Root-Layout ersetzt.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="de-CH">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#0F1017", color: "#fff", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
        <div style={{ textAlign: "center", maxWidth: "28rem" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.75rem" }}>Etwas ist schiefgelaufen</h1>
          <p style={{ color: "rgba(255,255,255,0.8)", marginBottom: "1.5rem" }}>
            Ein Fehler ist aufgetreten. Bitte lade die Seite neu.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF04D3] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F1017]"
            style={{ background: "#FF04D3", color: "#000", border: "none", padding: "0.75rem 1.5rem", borderRadius: "9999px", fontSize: "1rem", fontWeight: 600, cursor: "pointer" }}
          >
            Erneut versuchen
          </button>
        </div>
      </body>
    </html>
  );
}
