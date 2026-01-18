import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "KI-First Social Innovator - Inclusions",
  description: "Inclusions nutzt KI für barrierefreien Zugang und mehr Inklusion. Einfacher Zugang, Effizienz und Skalierung – KI-First statt Mehraufwand. Inclusi Sprach-Assistent für alle.",
  openGraph: {
    title: "KI-First Social Innovator - Inclusions",
    description: "Inclusions nutzt KI für barrierefreien Zugang und mehr Inklusion. Inclusi Sprach-Assistent.",
    images: [{ url: "/images/hero.jpg", width: 1200, height: 630, alt: "Inclusions - Inklusives Event Zürich" }],
  },
};

export default function KIInnovatorPage() {
  return (
    <main className="min-h-screen max-w-6xl px-4 py-12 mx-auto space-y-16 text-white">
      {/* Hero Section */}
      <section className="space-y-6">
        <div className="relative w-full h-[300px] md:h-[400px] rounded-2xl overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-pink/30 via-purple-500/20 to-blue-500/30 animate-float" />
          
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-10">
            <div className="space-y-4 animate-fade-in w-full">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white [text-shadow:_2px_2px_8px_rgb(0_0_0_/_90%)]">
                KI-First Social Innovator
              </h1>
              <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto [text-shadow:_1px_1px_4px_rgb(0_0_0_/_80%)]">
                KI macht Zugang einfacher und baut Brücken zwischen Menschen.
              </p>
            </div>
          </div>
        </div>

        {/* Key Claims */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-xl bg-white/5 p-6">
            <h3 className="text-white/90 font-semibold text-lg mb-2">Effizienz</h3>
            <p className="text-brand-pink font-medium text-sm mb-3">KI-First statt Mehraufwand.</p>
            <p className="text-white/70 text-sm leading-relaxed">
              Wir denken Prozesse neu, reduzieren Komplexität und nutzen KI gezielt, um Ressourcen effizient einzusetzen.
            </p>
          </div>
          <div className="rounded-xl bg-white/5 p-6">
            <h3 className="text-white/90 font-semibold text-lg mb-2">Einfacher Zugang</h3>
            <p className="text-brand-pink font-medium text-sm mb-3">Inklusiv. Verständlich. Zukunftsfähig.</p>
            <p className="text-white/70 text-sm leading-relaxed">
              Unsere Lösungen sind bewusst einfach gestaltet und folgen neurodiversen UX-Prinzipien.
            </p>
          </div>
          <div className="rounded-xl bg-white/5 p-6">
            <h3 className="text-white/90 font-semibold text-lg mb-2">Skalierung</h3>
            <p className="text-brand-pink font-medium text-sm mb-3">Wachsen mit Haltung.</p>
            <p className="text-white/70 text-sm leading-relaxed">
              KI ermöglicht uns, Kosten zu senken, Qualität zu sichern und nachhaltig zu wachsen.
            </p>
          </div>
        </div>
      </section>

      {/* Umsetzung & Planung */}
      <section className="space-y-8">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center">
          Umsetzung & Planung
        </h2>
        
        <div className="grid gap-6 md:grid-cols-2">
          {/* Umsetzung */}
          <div className="rounded-2xl bg-white/5 p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-pink"></span>
              Umsetzung
            </h3>
            <ul className="space-y-3 text-white/80 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-brand-pink mt-1">•</span>
                <span>Webseite 2.0 vollständig mit Vibe Coding umgesetzt</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-pink mt-1">•</span>
                <span>Hosting auf Schweizer Server (Datenschutz)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-pink mt-1">•</span>
                <span>Wir werden vom Vibe Coding Experten <a href="https://www.linkedin.com/in/yves-gugger/" target="_blank" rel="noopener noreferrer" className="text-brand-pink hover:underline">Yves Gugger</a> unterstützt (aktuelles Projekt von Yves: <a href="https://reallytea.ch" target="_blank" rel="noopener noreferrer" className="text-brand-pink hover:underline">ReallyTea</a>)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-pink mt-1">•</span>
                <span>Backend Programmierung und erste Automations mit Vibe Coding programmiert</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-pink mt-1">•</span>
                <span>Voice Agent: Barrierefreie Nutzung</span>
              </li>
            </ul>
          </div>

          {/* Planung */}
          <div className="rounded-2xl bg-white/5 p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              Planung
            </h3>
            <ul className="space-y-3 text-white/80 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Konsequente KI-First Weiterentwicklung</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Weitere Umsetzung von Automations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Weitere Toolentwicklung: CRM, Projektmanagement, Marketing-Automation, Zielgruppen-Kommunikation, Community-Features, Bild-/Video Produktion</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Für wen relevant? */}
      <section className="space-y-8">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center">
          Für wen ist das relevant?
        </h2>
        
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-500/10 p-6 border border-blue-500/30">
            <h3 className="text-xl font-semibold text-white mb-3">Investor:innen & Sponsor:innen</h3>
            <p className="text-white/80 text-sm leading-relaxed">
              Wer als Investor oder Sponsor Teil von Inclusions wird, investiert in die Zukunft und wird 
              Teil eines First-Movers. Inclusions zeigt, wie soziale Innovation mit modernen Werkzeugen 
              zukunftsfähig, skalierbar und nachhaltig funktioniert.
            </p>
          </div>
          
          <div className="rounded-2xl bg-gradient-to-br from-brand-pink/20 to-brand-pink/10 p-6 border border-brand-pink/30">
            <h3 className="text-xl font-semibold text-white mb-3">Für unterschiedliche Zielgruppen</h3>
            <p className="text-white/80 text-sm leading-relaxed">
              Für Menschen mit Beeinträchtigung bedeutet KI einfacheren Zugang zu Infos und Mitmenschen – 
              Voice-First, barrierearm und verständlich. Für die Community schafft KI Zeit und Möglichkeiten 
              für echte Begegnungen und Teilhabe. Und für unser Team ermöglicht KI effizienteres Arbeiten 
              und mehr Fokus auf das Wesentliche: Menschen zusammenbringen.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="space-y-6 text-center rounded-2xl bg-gradient-to-br from-brand-pink/20 to-purple-500/20 p-6 md:p-8 border-2 border-brand-pink/30">
        <h2 className="text-2xl md:text-3xl font-semibold text-white">
          Nimm mit uns Kontakt auf
        </h2>
        <p className="text-white/80 max-w-xl mx-auto">
          Interessiert dich unser KI-First Social Innovator Ansatz? Möchtest du mitwirken mit deinem Wissen oder uns finanziell unterstützen?
        </p>
        <div className="pt-4 space-y-3">
          <div>
            <p className="text-white font-semibold mb-1">Roland</p>
            <p className="text-white/70 text-sm">Co-Founder & KI-Entwicklung</p>
          </div>
          <a
            href="mailto:roland@inclusions.zone"
            className="inline-flex items-center gap-2 rounded-full bg-brand-pink px-6 py-3 text-lg font-semibold text-black hover:bg-brand-pink/90 transition-colors"
            aria-label="E-Mail an Roland senden"
          >
            <span>Kontakt aufnehmen</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </a>
          <p className="text-white/70 text-sm">
            roland@inclusions.zone
          </p>
        </div>
      </section>
    </main>
  );
}


