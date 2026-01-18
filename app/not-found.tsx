export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        backgroundColor: "#0F1017",
        color: "#fff",
        fontFamily: "system-ui, sans-serif",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: 8 }}>
        404 – Seite nicht gefunden
      </h1>
      <p style={{ color: "rgba(255,255,255,0.8)", marginBottom: 24 }}>
        Die angeforderte Seite existiert nicht.
      </p>
      <a
        href="/"
        className="transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF04D3] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F1017]"
        style={{
          display: "inline-block",
          padding: "12px 24px",
          backgroundColor: "#FF04D3",
          color: "#000",
          fontWeight: 600,
          borderRadius: 9999,
          textDecoration: "none",
        }}
      >
        Zur Startseite
      </a>
    </div>
  );
}
