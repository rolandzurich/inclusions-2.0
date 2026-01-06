import Link from "next/link";

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
                KI entlastet Admin, macht Zugang einfacher und baut Brücken zwischen Menschen.
              </p>
            </div>
          </div>
        </div>

        {/* Key Claims */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-white/5 p-4 text-center">
            <p className="text-white/90 font-medium">Admin-Entlastung</p>
            <p className="text-sm text-white/70 mt-1">Mehr Zeit fürs Wesentliche</p>
          </div>
          <div className="rounded-xl bg-white/5 p-4 text-center">
            <p className="text-white/90 font-medium">Einfacher Zugang</p>
            <p className="text-sm text-white/70 mt-1">Barrierefreie Kommunikation</p>
          </div>
          <div className="rounded-xl bg-white/5 p-4 text-center">
            <p className="text-white/90 font-medium">Skalierung</p>
            <p className="text-sm text-white/70 mt-1">Wachstum ohne Qualitätsverlust</p>
          </div>
        </div>
      </section>

      {/* Current Status + Next Up */}
      <section className="rounded-2xl bg-gradient-to-br from-brand-pink/20 to-brand-pink/10 p-6 md:p-8 border-2 border-brand-pink/30">
        <h2 className="text-2xl font-bold text-white mb-4">Aktueller Status & Nächste Schritte</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Status</h3>
            <ul className="space-y-1 text-white/80 text-sm">
              <li>• Website 2.0 in Arbeit (V1 via Cursor/Vibe Coding)</li>
              <li>• Voice Agent live</li>
              <li>• Hosting Schweiz geplant</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Next Up</h3>
            <ul className="space-y-1 text-white/80 text-sm">
              <li>• Backend programmieren</li>
              <li>• Formular-Automationen</li>
              <li>• Tracking & Analytics</li>
              <li>• CRM mit KI</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Unser Prinzip */}
      <section className="space-y-6">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center">
          Unser Prinzip
        </h2>
        <div className="text-center mb-8">
          <p className="text-2xl md:text-3xl text-brand-pink font-semibold">
            KI als Werkzeug. Menschlichkeit als Ziel.
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-white/5 p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-3">Barrierearm & verständlich</h3>
            <p className="text-white/80 text-sm leading-relaxed">
              Einfache Sprache, Voice-first Ansatz. Informationen so zugänglich wie möglich.
            </p>
          </div>
          <div className="rounded-2xl bg-white/5 p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-3">Datenschutz & Vertrauen</h3>
            <p className="text-white/80 text-sm leading-relaxed">
              Schweizer Hosting. Deine Daten bleiben sicher und geschützt.
            </p>
          </div>
          <div className="rounded-2xl bg-white/5 p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-3">Gemeinschaft & Begegnung</h3>
            <p className="text-white/80 text-sm leading-relaxed">
              KI schafft Zeit und Möglichkeiten für echte menschliche Begegnungen.
            </p>
          </div>
        </div>
      </section>

      {/* Warum KI-First sein MUSS */}
      <section className="space-y-6 rounded-3xl bg-white/5 p-8 md:p-12">
        <h2 className="text-3xl md:text-4xl font-bold text-white">
          Warum KI-First sein MUSS
        </h2>
        
        <div className="space-y-6 text-white/90">
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">Ressourcen sind knapp</h3>
            <p className="leading-relaxed">
              KI ist keine "nice to have" – sie ist Voraussetzung für Effizienz. Sie entlastet uns 
              bei Admin-Aufgaben und gibt uns mehr Zeit für das Wesentliche: Menschen zusammenbringen 
              und echte Begegnungen schaffen.
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">Exponentielle Entwicklung nutzen</h3>
            <p className="leading-relaxed">
              KI entwickelt sich exponentiell. Wir nutzen neue Möglichkeiten bewusst, um menschliche 
              Kontakte zu fördern – nicht um Technologie zu zeigen, sondern um Barrieren abzubauen.
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">Zukunftsfähig & skalierbar</h3>
            <p className="leading-relaxed">
              Für Sponsor:innen und Investor:innen bedeutet das: Sie investieren in etwas Spezielles 
              und Zukunftsfähiges. Inclusions zeigt, wie soziale Innovation mit modernen Werkzeugen 
              professionell und nachhaltig funktioniert.
            </p>
          </div>
          
          <div className="rounded-xl bg-brand-pink/10 p-6 border border-brand-pink/30">
            <p className="text-lg font-semibold text-white mb-2">Unser Kern</p>
            <p className="text-white/90 leading-relaxed">
              KI nutzen, um Menschlichkeit zu fördern. Kein Tech-Hype. Echte Wirkung.
            </p>
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
              Zukunftsfähig, skalierbar, professionell. Inclusions zeigt, wie soziale Innovation 
              mit modernen Werkzeugen nachhaltig funktioniert.
            </p>
          </div>
          
          <div className="rounded-2xl bg-gradient-to-br from-green-500/20 to-green-500/10 p-6 border border-green-500/30">
            <h3 className="text-xl font-semibold text-white mb-3">Menschen mit Beeinträchtigung</h3>
            <p className="text-white/80 text-sm leading-relaxed">
              Einfacher Zugang zu Infos & Mitmenschen. Voice-First, barrierearm, verständlich. 
              Inclusions wird für dich zugänglicher.
            </p>
          </div>
          
          <div className="rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-500/10 p-6 border border-purple-500/30">
            <h3 className="text-xl font-semibold text-white mb-3">Party-People & Community</h3>
            <p className="text-white/80 text-sm leading-relaxed">
              Bewegung & Mitmachen statt nur Event. Du bist Teil von etwas Größerem: einer 
              Community, die Inklusion lebt.
            </p>
          </div>
          
          <div className="rounded-2xl bg-gradient-to-br from-brand-pink/20 to-brand-pink/10 p-6 border border-brand-pink/30">
            <h3 className="text-xl font-semibold text-white mb-3">Community</h3>
            <p className="text-white/80 text-sm leading-relaxed">
              Herz, Stolz, Purpose, Zugehörigkeit. Inclusions ist mehr als Events – es ist eine 
              Bewegung, die Menschen verbindet.
            </p>
          </div>
        </div>
      </section>

      {/* Roadmap: 3 Entwicklungsphasen */}
      <section className="space-y-8">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center">
          Roadmap: 3 Entwicklungsphasen
        </h2>
        
        <div className="space-y-8">
          {/* Phase 1 */}
          <div className="relative">
            <div className="flex gap-4 md:gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-brand-pink flex items-center justify-center text-black font-bold text-lg">
                  1
                </div>
                <div className="w-0.5 h-full bg-white/20 mx-auto mt-2"></div>
              </div>
              <div className="flex-1 pb-8">
                <div className="rounded-2xl bg-white/5 p-6 border border-white/10">
                  <h3 className="text-2xl font-semibold text-white mb-2">
                    Phase 1: KI zur Entlastung & Skalierung
                  </h3>
                  <p className="text-brand-pink mb-4 font-medium">2025 – Anfang 2026</p>
                  <p className="text-white/90 mb-4 leading-relaxed">
                    Fokus: Admin entlasten, Prozesse automatisieren, Grundlagen schaffen.
                  </p>
                  <ul className="space-y-2 text-white/80 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-brand-pink mt-1">•</span>
                      <span>Website 2.0 (V1) via Cursor/Vibe Coding; Launch ~10. Jan 2026</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-brand-pink mt-1">•</span>
                      <span>Hosting: Schweizer Datacenter-Server (Yves, KI/Vibe-Coding Experte)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-brand-pink mt-1">•</span>
                      <span>Voice Agent integriert, wird weiterentwickelt (Fokus: nutzbar für Menschen mit Beeinträchtigung)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-brand-pink mt-1">•</span>
                      <span>Backend programmieren (Formulardaten sammeln, automatische Antworten, Analyse)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-brand-pink mt-1">•</span>
                      <span>Tracking/Analytics (Besucher, Verhalten)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-brand-pink mt-1">•</span>
                      <span>CRM mit KI programmieren</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Phase 2 */}
          <div className="relative">
            <div className="flex gap-4 md:gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
                  2
                </div>
                <div className="w-0.5 h-full bg-white/20 mx-auto mt-2"></div>
              </div>
              <div className="flex-1 pb-8">
                <div className="rounded-2xl bg-white/5 p-6 border border-white/10">
                  <h3 className="text-2xl font-semibold text-white mb-2">
                    Phase 2: KI für Partizipation & Co-Creation
                  </h3>
                  <p className="text-blue-400 mb-4 font-medium">2026</p>
                  <p className="text-white/90 mb-4 leading-relaxed">
                    Fokus: Community stärken, Menschen zusammenbringen, Partizipation ermöglichen.
                  </p>
                  <ul className="space-y-2 text-white/80 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <span>Community-Funktionen auf der Website: Profile (Fähigkeiten/Interessen)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <span>Matching-Funktionen (Menschen mit/ohne Beeinträchtigung zusammenbringen)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <span>Kommunikations-/Content-Workflows weiter automatisieren</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <span>Optional: Ablösung externer Tools</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Phase 3 */}
          <div className="relative">
            <div className="flex gap-4 md:gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-lg">
                  3
                </div>
              </div>
              <div className="flex-1">
                <div className="rounded-2xl bg-white/5 p-6 border border-white/10">
                  <h3 className="text-2xl font-semibold text-white mb-2">
                    Phase 3: KI als Wirkungs- & Wertschöpfungsmechanismus
                  </h3>
                  <p className="text-purple-400 mb-4 font-medium">ab 2026/27</p>
                  <p className="text-white/90 mb-4 leading-relaxed">
                    Fokus: Nachhaltige Wertschöpfung, Wirkung messen, Systeme optimieren.
                  </p>
                  <ul className="space-y-2 text-white/80 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-1">•</span>
                      <span>Visionäre Bausteine: Inclusions Coin / Anerkennung von Beiträgen (nur mit Expert:innen)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-1">•</span>
                      <span>KI-gestützte Buchhaltung/Administration</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-1">•</span>
                      <span>Inclusions-Kalender (Crew, Proben, Drehs; Sichtbarkeit für Doku/Partner)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-1">•</span>
                      <span>Personal Assistants (E-Mail/Reminder/Info-Zugang) für Orga-Team</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Konkrete KI-Elemente heute */}
      <section className="space-y-8">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center">
          Konkrete KI-Elemente heute
        </h2>
        
        <div className="grid gap-6 md:grid-cols-2">
          {/* Voice Agent */}
          <article className="rounded-2xl bg-white/5 p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-brand-pink/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-brand-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-white">Voice Agent</h3>
            </div>
            <p className="text-white/80 leading-relaxed mb-4">
              Sprich mit der Website statt zu tippen. Besonders wichtig für Menschen mit motorischen 
              Einschränkungen oder Sehbehinderungen.
            </p>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-white/90 mb-2">Beispiel-Fragen:</p>
              <ul className="space-y-1 text-white/70 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-brand-pink mt-1">•</span>
                  <span>"Wie komme ich hin?"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-pink mt-1">•</span>
                  <span>"Was kostet's?"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-pink mt-1">•</span>
                  <span>"Brauche ich Begleitung?"</span>
                </li>
              </ul>
            </div>
          </article>

          {/* Barrierefreie Kommunikation */}
          <article className="rounded-2xl bg-white/5 p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-white">Barrierefreie Kommunikation</h3>
            </div>
            <p className="text-white/80 leading-relaxed mb-4">
              Informationen in verschiedenen Formaten: Text zu Sprache, komplexe Texte zu einfacher 
              Sprache, mehrsprachig.
            </p>
            <ul className="space-y-2 text-white/70 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Einfache Sprache für besseres Verständnis</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Mehrsprachige Unterstützung (Ziel)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Personalisierte Informationsbereitstellung</span>
              </li>
            </ul>
          </article>

          {/* Event-Orga & Lernen */}
          <article className="rounded-2xl bg-white/5 p-6 border border-white/10 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-white">Event-Orga & Lernen</h3>
            </div>
            <p className="text-white/80 leading-relaxed mb-4">
              Formulare, Feedback, Auswertung – realistisch und pragmatisch. KI unterstützt uns 
              bei der Planung und hilft, aus jedem Event zu lernen.
            </p>
            <ul className="space-y-2 text-white/70 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span>Automatisierte Anmeldungsprozesse</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span>Feedback-Analyse zur Identifikation von Barrieren</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span>Datenbasierte Entscheidungen für mehr Inklusion</span>
              </li>
            </ul>
          </article>
        </div>
      </section>

      {/* CTA */}
      <section className="space-y-6 text-center rounded-3xl bg-gradient-to-br from-brand-pink/20 to-purple-500/20 p-8 md:p-12 border-2 border-brand-pink/30">
        <h2 className="text-3xl font-semibold text-white">
          Teil der Bewegung werden
        </h2>
        <p className="text-lg text-white/80 max-w-2xl mx-auto">
          Erlebe KI-gestützte Inklusion live oder werde Teil unserer Community.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-brand-pink px-6 py-3 text-lg font-semibold text-black hover:bg-brand-pink/90 transition-colors"
            aria-label="Zur Startseite navigieren"
          >
            <span>Zur Startseite</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <Link
            href="/events"
            className="inline-flex items-center gap-2 rounded-full border border-brand-pink px-6 py-3 text-lg font-semibold text-brand-pink hover:bg-brand-pink hover:text-black transition-colors"
            aria-label="Events entdecken"
          >
            <span>Events entdecken</span>
          </Link>
        </div>
        <p className="text-sm text-white/70 mt-6">
          Mit Partnern entwickeln wir die nächsten KI-Module.
        </p>
      </section>
    </main>
  );
}


