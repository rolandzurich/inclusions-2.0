"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        fontFamily: "system-ui, sans-serif",
        background: "#0F1017",
        color: "#fff",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 400 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: 8 }}>
          Etwas ist schiefgelaufen
        </h1>
        <p style={{ color: "rgba(255,255,255,0.8)", marginBottom: 24 }}>
          Bitte lade die Seite neu.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => reset()}
            className="transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF04D3] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F1017]"
            style={{
              padding: "12px 24px",
              background: "#FF04D3",
              color: "#000",
              fontWeight: 600,
              border: "none",
              borderRadius: 9999,
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            Erneut versuchen
          </button>
          <a
            href="/"
            className="transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF04D3] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F1017]"
            style={{
              padding: "12px 24px",
              border: "2px solid #FF04D3",
              color: "#FF04D3",
              fontWeight: 600,
              borderRadius: 9999,
              textDecoration: "none",
              fontSize: "1rem",
            }}
          >
            Zur Startseite
          </a>
        </div>
      </div>
    </div>
  );
}
