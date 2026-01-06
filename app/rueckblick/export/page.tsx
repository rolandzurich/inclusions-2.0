"use client";

import { useState } from "react";
import { getAllRueckblickImages } from "@/lib/rueckblick-utils";

export default function NewsletterExportPage() {
  const [exportFormat, setExportFormat] = useState<"newsletter" | "social">("newsletter");
  const images = getAllRueckblickImages();

  const generateNewsletterHTML = () => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    
    return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Inclusions Rückblick</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #1a1a1a;
    }
    .header {
      text-align: center;
      padding: 30px 0;
      background: linear-gradient(135deg, #FF04D3 0%, #FFD700 50%, #00BFFF 100%);
      color: white;
      border-radius: 10px;
      margin-bottom: 30px;
    }
    .header h1 {
      margin: 0;
      font-size: 32px;
      font-weight: bold;
    }
    .intro {
      background-color: rgba(255, 255, 255, 0.1);
      padding: 20px;
      border-radius: 10px;
      margin-bottom: 30px;
      color: #fff;
    }
    .image-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 20px;
      margin-bottom: 30px;
    }
    .image-item {
      background-color: rgba(255, 255, 255, 0.05);
      border-radius: 10px;
      overflow: hidden;
    }
    .image-item img {
      width: 100%;
      height: auto;
      display: block;
    }
    .image-caption {
      padding: 15px;
      color: #fff;
    }
    .image-caption h3 {
      margin: 0 0 5px 0;
      font-size: 18px;
      color: #FF04D3;
    }
    .image-caption p {
      margin: 0;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.8);
    }
    .footer {
      text-align: center;
      padding: 20px;
      background-color: rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      color: #fff;
    }
    .footer a {
      color: #FF04D3;
      text-decoration: none;
    }
    @media (min-width: 600px) {
      .image-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Inclusions Rückblick</h1>
    <p>Unsere Reise - Von der ersten Idee bis zum erfolgreichen Event</p>
  </div>
  
  <div class="intro">
    <p>Am 27. September 2025 haben wir Geschichte geschrieben. Über 400 Menschen – mit und ohne Beeinträchtigung – tanzten zusammen im Supermarket Zürich.</p>
    <p><strong>Energie. Verbindung. Menschlichkeit. Pure Freude.</strong></p>
  </div>
  
  <div class="image-grid">
${images.map((img) => `    <div class="image-item">
      <img src="${baseUrl}/images/rueckblick/${img.filename}" alt="${img.title}" />
      <div class="image-caption">
        <h3>${img.title}</h3>
        <p>${img.description}</p>
      </div>
    </div>`).join("\n")}
  </div>
  
  <div class="footer">
    <p><strong>Die Reise geht weiter!</strong></p>
    <p>Inclusions 2 findet am 25. April 2026, 13:00 - 21:00 statt.</p>
    <p><a href="${baseUrl}/events">Mehr Infos zum nächsten Event</a></p>
    <p><a href="${baseUrl}">Zur Webseite</a></p>
  </div>
</body>
</html>`;
  };

  const downloadHTML = () => {
    const html = generateNewsletterHTML();
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inclusions-rueckblick-newsletter.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen max-w-4xl px-4 py-12 mx-auto space-y-8 text-white">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">Newsletter & Social Media Export</h1>
        <p className="text-lg text-white/80">
          Exportiere den Rückblick für Newsletter oder Social Media
        </p>
      </div>

      <div className="rounded-3xl bg-white/10 p-8 space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Export-Format wählen</h2>
          <div className="flex gap-4">
            <button
              onClick={() => setExportFormat("newsletter")}
              className={`px-6 py-3 rounded-full font-semibold transition-colors ${
                exportFormat === "newsletter"
                  ? "bg-brand-pink text-black"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              Newsletter (HTML)
            </button>
            <button
              onClick={() => setExportFormat("social")}
              className={`px-6 py-3 rounded-full font-semibold transition-colors ${
                exportFormat === "social"
                  ? "bg-brand-pink text-black"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              Social Media
            </button>
          </div>
        </div>

        {exportFormat === "newsletter" && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Newsletter HTML Export</h3>
            <p className="text-white/80">
              Generiert eine HTML-Datei, die direkt in Newsletter-Systeme eingefügt werden kann.
              Die Bilder werden als relative URLs eingebettet und müssen auf dem Server verfügbar sein.
            </p>
            <button
              onClick={downloadHTML}
              className="inline-flex items-center gap-2 rounded-full bg-brand-pink px-6 py-3 text-lg font-semibold text-black hover:bg-brand-pink/90 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              HTML herunterladen
            </button>
          </div>
        )}

        {exportFormat === "social" && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Social Media Export</h3>
            <p className="text-white/80">
              Für Social Media können die einzelnen Bilder mit ihren Beschreibungen verwendet werden.
              Die Bilder befinden sich in: <code className="bg-white/10 px-2 py-1 rounded">/public/images/rueckblick/</code>
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {images.slice(0, 6).map((img) => (
                <div key={img.id} className="bg-white/5 rounded-2xl p-4">
                  <p className="font-semibold text-white mb-2">{img.title}</p>
                  <p className="text-sm text-white/70 mb-2">{img.description}</p>
                  <p className="text-xs text-white/50">
                    Bild: <code>{img.filename}</code>
                  </p>
                </div>
              ))}
            </div>
            <p className="text-sm text-white/60">
              Tipp: Verwende die Bilder einzeln für Instagram-Posts oder erstelle Collagen für Facebook/LinkedIn.
            </p>
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-blue-500/10 border border-blue-500/20 p-6">
        <h3 className="font-semibold text-white mb-2">Hinweise</h3>
        <ul className="space-y-2 text-sm text-white/80">
          <li>• Newsletter: Stelle sicher, dass die Bilder auf einem öffentlich zugänglichen Server gehostet sind</li>
          <li>• Social Media: Verwende die Bilder mit den Beschreibungen als Captions</li>
          <li>• Alle Bilder sind optimiert für Web und Social Media</li>
        </ul>
      </div>
    </main>
  );
}


