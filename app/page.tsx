import Link from "next/link";
import Image from "next/image";
import { ClientHeroLog } from "@/components/AgentDebug";
import { getAllDJPairs, getDJPairWithDJs, getDJById, getPairDisplayName } from "@/lib/dj-utils";
import dynamic from "next/dynamic";
import { PartnerLogo } from "@/components/PartnerLogo";
import { TwintButton } from "@/components/TwintButton";
import { getEventSchema, getBaseUrl } from "@/lib/geo-schema";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inclusions 2.0 - Inklusives Event Zürich | Vom Event zur Bewegung",
  description: "Inclusions verbindet Menschen mit und ohne Beeinträchtigung durch Musik, Begegnung und echte Menschlichkeit. Inklusives Event am 25. April 2026, 13:00 - 21:00 im Supermarket Zürich. DJ-Workshops, Dance Crew, inklusive Clubkultur.",
  openGraph: {
    title: "Inclusions 2.0 - Inklusives Event Zürich",
    description: "Inclusions verbindet Menschen mit und ohne Beeinträchtigung durch Musik, Begegnung und echte Menschlichkeit. Inklusives Event am 25. April 2026 im Supermarket Zürich.",
    images: [
      {
        url: "/images/hero.jpg",
        width: 1200,
        height: 630,
        alt: "Inclusions Event - Menschen mit und ohne Beeinträchtigung tanzen zusammen im Supermarket Zürich",
      },
    ],
  },
  other: {
    "event:start_time": "2026-04-25T13:00:00+02:00",
    "event:end_time": "2026-04-25T21:00:00+02:00",
    "event:location": "Supermarket, Zürich",
  },
};

// INCLUSI (Voice Agent) nur im Browser laden, nicht beim Server-Side Rendering
function InclusiFallback({ msg, loading }: { msg: string; loading?: boolean }) {
  return (
    <section className="rounded-2xl bg-white/10 p-4 md:p-5 text-white flex items-center gap-3" aria-label="INCLUSI">
      <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full bg-brand-pink/50 flex-shrink-0 ${loading ? "animate-pulse" : ""}`} />
      <div>
        <h2 className="text-xl font-semibold">INCLUSI</h2>
        <p className="text-sm text-white/80">{msg}</p>
      </div>
    </section>
  );
}

const VoiceAgent = dynamic(
  () =>
    import("@/components/VoiceAgent")
      .then((mod) => ({ default: mod.VoiceAgent }))
      .catch((err) => {
        console.error("INCLUSI (VoiceAgent) konnte nicht geladen werden:", err);
        return { default: () => <InclusiFallback msg="INCLUSI ist gerade nicht verfügbar. Bitte lade die Seite neu." /> };
      }),
  {
    ssr: false,
    loading: () => <InclusiFallback msg="Lade..." loading />,
  }
);

const quotes = [
  '"Ich habe mich noch nie so frei gefühlt wie bei INCLUSIONS."',
  '"Hier tanzen Menschen wirklich miteinander – nicht nebeneinander."',
  '"Das war einer der schönsten Tage meines Lebens."',
  '"Musik verbindet uns alle – das spürt man hier so stark."'
];


// Logo color pattern: leicht entsättigt, weniger «vibrierend» für neuro-inclusive UX
const logoColors = [
  "#FF04D3", // Magenta/Pink (Brand)
  "#E6C200", // gedämpftes Gelb
  "#0EA5E9", // Sky (Tailwind sky-500)
  "#DC2626", // gedämpftes Rot (red-600)
  "#16A34A", // gedämpftes Grün (green-600)
];

function ColoredText({ text }: { text: string }) {
  let colorIndex = 0;
  
  return (
    <>
      {text.split("").map((char, index) => {
        if (char === " ") {
          return <span key={index}>{char}</span>;
        }
        const color = logoColors[colorIndex % logoColors.length];
        colorIndex++;
        return (
          <span key={index} style={{ color }}>
            {char}
          </span>
        );
      })}
    </>
  );
}

const baseUrl = getBaseUrl();

const jsonLdEvent = getEventSchema({
  id: "inclusions-2",
  name: "INCLUSIONS 2",
  description: "INCLUSIONS verbindet Menschen mit und ohne Beeinträchtigung durch Musik, Begegnung und echte Menschlichkeit. Inklusives Event mit DJ-Workshops, Dance Crew und inklusiver Clubkultur im Supermarket Zürich.",
  startDate: "2026-04-25T13:00:00+02:00",
  endDate: "2026-04-25T21:00:00+02:00",
  location: "Supermarket Zürich",
  offers: { url: "https://supermarket.li/events/inclusions/" },
});


export default function HomePage() {
  return (
    <main className="min-h-screen max-w-6xl px-4 py-12 mx-auto space-y-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdEvent) }}
      />
      {/* Hero */}
      <section className="space-y-8">
        <Link href="/ki-innovator" className="text-sm uppercase tracking-[0.25em] text-brand-pink hover:text-brand-pink/80 transition-colors inline-block">
          Inclusions KI-First Social Innovator
        </Link>
        
        {/* Header Image – stabile Darstellung ohne doppelte Skalierung */}
        <div className="relative w-full h-[500px] sm:h-[550px] md:h-[600px] lg:h-[700px] rounded-2xl overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/hero.jpg"
              alt="INCLUSIONS Event im Supermarket Zürich - Über 400 Menschen mit und ohne Beeinträchtigung tanzen zusammen in einer inklusiven Atmosphäre"
              fill
              className="object-cover"
              quality={90}
              priority
              sizes="(max-width: 1024px) 100vw, 1152px"
              loading="eager"
            />
          </div>

          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/40 via-black/30 to-black/50" />

          {/* Text Overlay */}
          <div className="absolute inset-0 z-10 flex flex-col items-center text-center px-4">
            {/* #region agent log */}
            <ClientHeroLog />
            {/* #endregion */}
            <div className="w-full flex flex-col items-center h-full">
              {/* Titel oben */}
              <div className="text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-bold font-bangers tracking-wider [text-shadow:_2px_2px_4px_rgb(0_0_0_/_80%)] pt-8 md:pt-12 lg:pt-16 mb-4 md:mb-6 animate-fade-in">
                <div className="text-center">
                  <ColoredText text="INCLUSIONS" /> <ColoredText text="2" />
                </div>
              </div>
              
              {/* Datum/Zeit/Ort - größere Schrift */}
              <div className="animate-fade-in mb-6 md:mb-8">
                <p className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bangers text-white/90 [text-shadow:_2px_2px_4px_rgb(0_0_0_/_80%)]">
                  25.04.2026 | 13:00 - 21:00 | Club Supermarket, Zürich
                </p>
              </div>

              {/* Spacer für DJ-Gesichter - flex-grow um Platz zu schaffen */}
              <div className="flex-grow"></div>

              {/* Content unten: Choregrafie, Line-Up und Buttons */}
              <div className="space-y-4 animate-fade-in pb-8 md:pb-12 lg:pb-16 w-full max-w-4xl">
                <p className="text-xl md:text-2xl lg:text-3xl font-bangers text-white/90 [text-shadow:_2px_2px_4px_rgb(0_0_0_/_80%)]">
                  Neue Choreografie der INCLUSIONS Dance Crew
                </p>
                <p className="text-xl md:text-2xl lg:text-3xl font-bangers text-white/90 [text-shadow:_2px_2px_4px_rgb(0_0_0_/_80%)]">
                  Line-up: Zagara, Coco.bewegt, Samy Jackson, Hoibaer, _miniArt°°°, Ashan (live) & INCLUSIONS DJ's (werden noch bestätigt)
                </p>

                <div className="mt-6 flex flex-wrap gap-4 justify-center items-start">
                  <Link
                    href="https://supermarket.li/events/inclusions/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-brand-pink px-6 py-3 text-lg font-semibold text-black hover:bg-brand-pink/90 transition-colors duration-200 ease-in-out"
                  >
                    Ticket kaufen
                  </Link>
                  <div className="flex flex-col items-center">
                    <Link
                      href="/anmeldung/vip"
                      className="rounded-full border-2 border-brand-pink bg-black/70 px-6 py-3 text-lg font-semibold text-brand-pink hover:bg-brand-pink hover:text-black transition-colors duration-200 ease-in-out [text-shadow:_0_0_8px_rgb(255_4_211_/_50%)]"
                    >
                      VIP-Anmeldung
                    </Link>
                    <p className="mt-2 text-xs md:text-sm text-white/90 [text-shadow:_2px_2px_4px_rgb(0_0_0_/_80%)] text-center">
                      Gratis Eintritt mit IV-Ausweis/Behinderung/Beeinträchtigung
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* INCLUSI – above the fold als USP: Infos per Sprache, besonders für Menschen mit Beeinträchtigung */}
        <VoiceAgent />

        {/* Hero Content */}
        <div className="text-white">
          <h1 className="text-4xl font-bold md:text-5xl">
            Vom Event zur Bewegung.
          </h1>
          <p className="mt-4 text-xl text-white/80 max-w-read">
            Wir verbinden Menschen mit und ohne Beeinträchtigung durch Musik, Begegnung und echte
            Menschlichkeit.
          </p>
        </div>
      </section>

      {/* Nächster Event – Prio 1: Ticket + VIP direkt nach Hero */}
      <section className="rounded-3xl bg-white/10 p-8 text-white shadow-lg">
        <div className="grid gap-6 md:grid-cols-2 items-center">
          <div>
            <h2 className="text-3xl font-semibold">Nächster Event</h2>
            <p className="mt-4 text-2xl font-bold text-brand-pink">INCLUSIONS 2</p>
            <p className="mt-2 text-lg">25. April 2026, 13:00 - 21:00 · Supermarket Zürich</p>
            
            <ul className="mt-4 space-y-2 text-white/90 list-disc list-outside pl-6">
              <li>Techno vom Feinsten – Zürcher Top-DJ's back-to-back mit INCLUSIONS DJ's.</li>
              <li>Gratis VIP Eintritt mit IV-Ausweis/Beeinträchtigung/Behinderung mit günstigen Getränken/Essen, Helferteam, barrierefrei.</li>
              <li>Ein Dancefloor für ALLE – Menschen mit und ohne Beeinträchtigung feiern gemeinsam.</li>
              <li>INCLUSIONS Dance-Crew – neue Choreografie, stark, berührend, einzigartig.</li>
              <li>Bunte Nägel & gute Vibes – <Link href="https://trina.bar/" target="_blank" rel="noopener noreferrer" className="text-brand-pink hover:underline">Trina's Gwunder Nagelbar</Link> mit Hunderten Farben.</li>
            </ul>
            
            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <Link
                href="https://supermarket.li/events/inclusions/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-pink px-6 py-3 text-lg font-semibold text-black hover:bg-brand-pink/90 transition-colors"
              >
                <span>Ticket kaufen</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              <Link
                href="/anmeldung/vip"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-pink px-6 py-3 text-lg font-semibold text-brand-pink hover:bg-brand-pink hover:text-black transition-colors"
              >
                <span>VIP-Anmeldung</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
          <div className="w-full mt-6 md:mt-0 aspect-square relative rounded-2xl overflow-hidden">
            <Image
              src="/images/dance-crew-next-event-home.jpg"
              alt="INCLUSIONS Dance Crew - Nächster Event"
              fill
              className="object-cover rounded-2xl"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      {/* Zwei Wege zur Party */}
      <section className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Zwei Wege zur Party – eine Bewegung
          </h2>
          <p className="text-lg text-white/80 max-w-3xl mx-auto">
            Mit der 1. Edition haben wir gezeigt: Es funktioniert! Menschen mit und ohne Beeinträchtigung 
            feiern gemeinsam auf Augenhöhe. Wähle deinen Weg zur INCLUSIONS 2.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Party People */}
          <div className="rounded-3xl bg-white/10 p-8 border-2 border-white/20 hover:border-brand-pink/50 transition-all duration-200 ease-in-out">
            <div className="space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-pink/20 text-brand-pink text-sm font-semibold mb-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                  Party People
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Feiern. Tanzen. Gemeinsam erleben.
                </h3>
                <p className="text-white/80 leading-relaxed">
                  Du liebst elektronische Musik und willst eine Party erleben, die wirklich anders ist? 
                  Bei INCLUSIONS tanzen Menschen mit und ohne Beeinträchtigung zusammen – auf Augenhöhe, 
                  mit Respekt und purem Spass.
                </p>
              </div>

              {/* Vertrauen durch Erfolg */}
              <div className="rounded-2xl bg-white/5 p-5 border border-white/10">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-white mb-1">Bewiesen: Es funktioniert!</p>
                    <p className="text-sm text-white/70">
                      Über 400 Menschen feierten bei der 1. Edition zusammen. Die Energie war unbeschreiblich – 
                      und du warst dabei oder hast es verpasst? Jetzt ist deine Chance!
                    </p>
                  </div>
                </div>
              </div>

              {/* Was dich erwartet */}
              <div className="space-y-3">
                <h4 className="font-semibold text-white">Was dich erwartet:</h4>
                <ul className="space-y-2 text-white/80">
                  <li className="flex items-start gap-2">
                    <span className="text-brand-pink mt-1">•</span>
                    <span>Top DJ-Line-up mit inklusiven DJ Pairs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-pink mt-1">•</span>
                    <span>Eine offene, respektvolle Atmosphäre</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-pink mt-1">•</span>
                    <span>Gemeinsam tanzen und neue Menschen kennenlernen</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-pink mt-1">•</span>
                    <span>Eine Party, die wirklich etwas bewegt</span>
                  </li>
                </ul>
              </div>

              {/* Offenheit und Begegnung */}
              <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-4">
                <p className="text-sm text-white/90">
                  <strong className="text-white">Komm mit Offenheit.</strong> Es entstehen Begegnungen auf Augenhöhe. 
                  Menschen mit Beeinträchtigung sind auch einfach nur Menschen mit Träumen, Wünschen und feiern gerne. 
                  Bei INCLUSIONS geht es ums gemeinsame Feiern und Erleben – du wirst dich wohlfühlen.
                </p>
              </div>

              {/* CTA */}
              <div className="pt-4">
                <Link
                  href="https://supermarket.li/events/inclusions/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-brand-pink px-6 py-3 text-lg font-semibold text-black hover:bg-brand-pink/90 transition-colors w-full justify-center"
                >
                  <span>Ticket kaufen</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          {/* VIPs */}
          <div className="rounded-3xl bg-gradient-to-br from-brand-pink/20 to-brand-pink/10 p-8 border-2 border-brand-pink/30 hover:border-brand-pink/50 transition-all duration-200 ease-in-out">
            <div className="space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-pink text-white text-sm font-semibold mb-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  VIP-Gast
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Gratis dabei sein – als unser VIP!
                </h3>
                <p className="text-white/90 leading-relaxed">
                  Du hast einen IV-Ausweis, eine Beeinträchtigung oder Behinderung? Dann bist du unser VIP-Gast! 
                  Komm gratis zur Party, erlebe die Musik, tanze mit uns und sei Teil dieser besonderen Bewegung.
                </p>
              </div>

              {/* VIP Vorteile */}
              <div className="rounded-2xl bg-white/10 p-5 border border-white/20">
                <h4 className="font-semibold text-white mb-3">Deine VIP-Vorteile:</h4>
                <ul className="space-y-2 text-white/90">
                  <li className="flex items-start gap-2">
                    <span className="text-brand-pink mt-1">✓</span>
                    <span>Gratis Eintritt mit IV-Ausweis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-pink mt-1">✓</span>
                    <span>Günstigere Preise für Essen & Getränke</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-pink mt-1">✓</span>
                    <span>Unser Helfer-Team ist für dich da</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-pink mt-1">✓</span>
                    <span>Barrierefreier Ort</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-pink mt-1">✓</span>
                    <span>TIXI-Taxi Unterstützung möglich</span>
                  </li>
                </ul>
              </div>

              {/* Wichtige Infos */}
              <div className="space-y-3">
                <h4 className="font-semibold text-white">Wichtig:</h4>
                <div className="space-y-2 text-sm text-white/80">
                  <p>• Du musst mindestens 20 Jahre alt sein</p>
                  <p>• Anmeldung im Vorfeld erforderlich</p>
                  <p>• <strong>Nur VIPs kommen gratis:</strong> Freunde, Familie und Betreuer:in müssen ein Ticket kaufen. <a href="https://supermarket.li/events/inclusions/" target="_blank" rel="noopener noreferrer" className="text-brand-pink hover:underline">Link zum Ticketkauf</a></p>
                  <p>• Betreuer:in kommen nur gratis, wenn du auf 1-zu-1 Betreuung angewiesen bist</p>
                </div>
              </div>

              {/* CTA */}
              <div className="pt-4">
                <Link
                  href="/anmeldung/vip"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-lg font-semibold text-brand-pink hover:bg-white/90 transition-colors w-full justify-center"
                >
                  <span>Jetzt als VIP anmelden</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <p className="text-xs text-white/60 mt-3 text-center">
                  Nur mit Anmeldung kommst du sicher rein
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Verbindende Message */}
        <div className="text-center pt-6 border-t border-white/10">
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            <strong className="text-white">Gemeinsam feiern wir Vielfalt.</strong> Bei INCLUSIONS 
            bringen wir beide Welten zusammen – auf Augenhöhe, mit Respekt und purem Spass. 
            Sei dabei und erlebe, was möglich ist, wenn wir zusammenarbeiten.
          </p>
        </div>
      </section>

      {/* Rückblick – Prio 2: Eindrücke vom Erfolg Inclusions 1 */}
      <section className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-brand-pink mb-1">Rückblick</p>
          <h2 className="text-3xl font-semibold text-white leading-snug mt-1">INCLUSIONS 1. Edition</h2>
        </div>
        <div className="space-y-3 text-white/80">
          <p>Am 27. September 2025 haben wir Geschichte geschrieben.</p>
          <p>Über 400 Menschen – mit und ohne Beeinträchtigung – tanzten zusammen im Supermarket Zürich.</p>
          <p>Energie. Verbindung. Menschlichkeit. Pure Freude.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { src: "/images/rueckblick-1.jpg", alt: "INCLUSIONS 1. Edition - Event Moment im Supermarket Zürich mit Menschen mit und ohne Beeinträchtigung" },
            { src: "/images/rueckblick-2.jpg", alt: "INCLUSIONS 1. Edition - Gemeinsam tanzen und feiern in inklusiver Atmosphäre" },
            { src: "/images/rueckblick-3.jpg", alt: "INCLUSIONS 1. Edition - Feiern zusammen - Über 400 Menschen im Supermarket Zürich" }
          ].map((image, index) => (
            <div key={index} className="relative h-64 rounded-2xl overflow-hidden group">
              <div className="absolute inset-0 animate-float">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover scale-110 group-hover:scale-100 transition-transform duration-[20s] ease-out"
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            </div>
          ))}
        </div>
        <div className="pt-4">
          <Link
            href="/rueckblick"
            className="inline-flex items-center gap-2 rounded-full border border-brand-pink px-6 py-3 text-lg font-semibold text-brand-pink hover:bg-brand-pink hover:text-black transition-colors"
          >
            <span>Vollständigen Rückblick ansehen</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Was ist Inclusions – Prio 2 */}
      <section className="space-y-6">
        <h2 className="text-3xl font-semibold text-white">Was ist INCLUSIONS?</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            "Gemeinsam anders. Bei INCLUSIONS schaffen wir Räume, in denen Menschen echt und auf Augenhöhe zusammenkommen.",
            "Musik verbindet. Wir feiern eine Clubkultur, die offen für alle ist – unabhängig von Fähigkeit, Herkunft oder Background.",
            "Eine neue Bewegung. Nach dem Erfolg der ersten Edition gehen wir den Weg weiter: vom Event zur Community."
          ].map((text) => (
            <article key={text} className="rounded-2xl bg-white/5 p-6 text-lg text-white/80">
              {text}
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-white/5 p-6" aria-labelledby="faq-cta-heading">
        <h2 id="faq-cta-heading" className="text-xl font-semibold text-white mb-2">Fragen?</h2>
        <p className="text-white/80">
          In unseren <Link href="/faq" className="text-brand-pink hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink focus-visible:ring-offset-2 focus-visible:ring-offset-brand-dark rounded">Fragen & Antworten</Link> finden Sie die wichtigsten Infos zu INCLUSIONS, Tickets, VIP-Anmeldung und mehr.
        </p>
      </section>

      {/* Partner – Prio 2: Neue Partner und Sponsoren finden */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-semibold text-white">Unsere Partner</h2>
          <p className="mt-2 text-white/70">
            Dank unserer Partner wird aus einer Idee eine Bewegung.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {[
            { name: "insieme Zürich", logo: "/images/partners/insieme.png", hasLogo: true, url: "https://insieme-zuerich.ch/" },
            { name: "Supermarket", logo: "/images/partners/supermarket.png", hasLogo: true, url: "https://supermarket.li/" },
            { name: "Animaltrainer", logo: "/images/partners/animaltrainer.png", hasLogo: true, url: "https://www.schoolofsound.ch/" },
            { name: "Colette M", logo: "/images/partners/colette-m.png", hasLogo: true, url: "https://www.magicdancers.ch/" },
            { name: "TIXI Taxi", logo: "/images/partners/tixi.png", hasLogo: true, url: "https://tixi.ch/" },
            { name: "BCK", logo: "/images/partners/bck.png", hasLogo: true, url: "https://bckzh.ch/" },
            { name: "Manroof", logo: "/images/partners/manroof.png", hasLogo: true, url: "https://www.manroof.ch/" },
            { name: "AVTL Content", logo: "/images/partners/avtl.png", hasLogo: true, url: "https://avtlcontent.com/" },
            { name: "Alex Flach", logo: "/images/partners/alex-flach.png", hasLogo: true, url: "https://www.instagram.com/alex_flach2605/" },
            { name: "Hitschfilm", logo: "/images/partners/hitschfilm.png", hasLogo: true, url: "https://www.hitschfilm.zuerich/" },
            { name: "Watchman", logo: "/images/partners/watchman.png", hasLogo: true, url: "https://www.watchman.academy/" },
            { name: "Tanz am Morgen", logo: "/images/partners/tanz-am-morgen.jpg", hasLogo: true, url: "https://www.instagram.com/coco.bewegt/" },
          ].map((partner, index) => {
            const content = partner.hasLogo ? (
              <PartnerLogo src={partner.logo} alt={partner.name} />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-xs text-white/70 text-center px-2">{partner.name}</span>
              </div>
            );

            if (partner.url) {
              return (
                <Link
                  key={index}
                  href={partner.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 h-32"
                >
                  {content}
                </Link>
              );
            }

            return (
              <div
                key={index}
                className="flex items-center justify-center p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 h-32"
              >
                {content}
              </div>
            );
          })}
        </div>
        <div className="text-center pt-4">
          <Link
            href="/spenden"
            className="inline-flex items-center gap-2 text-sm text-brand-pink hover:text-brand-pink/80 transition-colors"
          >
            Partner werden
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Spenden */}
      <section className="space-y-4 rounded-3xl bg-white/5 p-8 text-white">
        <h2 className="text-3xl font-semibold">Spenden</h2>
        <p className="text-lg text-white/80 max-w-3xl">
          INCLUSIONS ist eine gemeinnützige Bewegung. Mit deiner Unterstützung ermöglichen wir
          Events, Begleitung und Teilhabe. Jeder Beitrag macht einen Unterschied.
        </p>
        <div className="flex flex-wrap gap-4 items-center">
          <Link
            href="/spenden"
            className="inline-flex rounded-full border border-brand-pink px-6 py-3 text-lg font-semibold text-brand-pink hover:bg-brand-pink hover:text-black transition-colors"
          >
            Bewegung unterstützen
          </Link>
          <TwintButton />
        </div>
      </section>

      {/* Momente */}
      <section className="space-y-6">
        <h2 className="text-3xl font-semibold text-white">Momente der Inklusion</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {quotes.map((quote) => (
            <article key={quote} className="rounded-3xl bg-white/5 p-6 text-lg text-white/80">
              {quote}
            </article>
          ))}
        </div>
      </section>

      {/* DJs Section */}
      <section className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-brand-pink">Resident DJs & DJ Pairs</p>
            <h2 className="text-3xl font-semibold text-white mt-2">Unsere DJ's</h2>
            <p className="mt-3 text-white/80 max-w-2xl">
              Ein USP von INCLUSIONS sind die DJ Pairs: professionelle DJ's legen zusammen mit DJ's mit 
              Beeinträchtigung auf und schaffen ein inklusives, zugängliches Erlebnis auf der Tanzfläche.
            </p>
          </div>
          <Link
            href="/djs"
            className="rounded-full border border-brand-pink px-6 py-3 text-brand-pink hover:bg-brand-pink hover:text-black transition-colors whitespace-nowrap"
          >
            Alle DJs ansehen
          </Link>
        </div>

        {/* DJ Pairs */}
        <div>
          <h3 className="text-2xl font-semibold text-white mb-4">DJ Pairs</h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {getAllDJPairs().map((pair) => {
              const pairWithDJs = getDJPairWithDJs(pair.id);
              if (!pairWithDJs) return null;

              return (
                <article
                  key={pair.id}
                  className="rounded-2xl bg-white/5 p-6 hover:bg-white/10 transition-all"
                >
                  <div className="relative h-48 rounded-xl bg-white/10 mb-4 overflow-hidden group">
                    {pair.image ? (
                      <div className="absolute inset-0 animate-float">
                        <Image
                          src={pair.image}
                          alt={`${pair.name} - Inklusives DJ-Pairing für das INCLUSIONS Event`}
                          fill
                          className="object-cover scale-110 group-hover:scale-100 transition-transform duration-[20s] ease-out"
                          loading="lazy"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/40">
                        <svg
                          className="w-16 h-16"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <h4 className="text-xl font-semibold mb-2">{getPairDisplayName(pair.id) || pair.name}</h4>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="text-xs px-2 py-1 rounded-full bg-brand-pink/20 text-brand-pink">
                      DJ Pair
                    </span>
                    {(pairWithDJs.dj1.hasDisability || pairWithDJs.dj2.hasDisability) && (
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400">
                        Inklusiv
                      </span>
                    )}
                  </div>
                  {pair.text && (
                    <p className="text-sm text-white/70 mb-4 line-clamp-2">{pair.text}</p>
                  )}
                  <Link
                    href={`/djs?pair=${pair.id}`}
                    className="inline-block text-sm text-brand-pink hover:text-brand-pink/80 transition-colors"
                  >
                    Jetzt buchen →
                  </Link>
                </article>
              );
            })}
          </div>
        </div>

        {/* Bekannte DJs */}
        <div>
          <h3 className="text-2xl font-semibold text-white mb-4">Bekannte Resident DJ's</h3>
          <div className="grid gap-6 md:grid-cols-2">
            {["samy-jackson", "zagara"].map((djId) => {
              const dj = getDJById(djId);
              if (!dj) return null;

              return (
                <article
                  key={dj.id}
                  className="rounded-2xl bg-white/5 p-6 hover:bg-white/10 transition-all"
                >
                  <div className="flex gap-6">
                    <div className="relative h-32 w-32 rounded-xl bg-white/10 overflow-hidden flex-shrink-0 group">
                      {dj.image ? (
                        <div className="absolute inset-0 animate-float">
                          <Image
                            src={dj.image}
                            alt={`${dj.name} - Resident DJ bei INCLUSIONS${dj.hasDisability ? " mit Beeinträchtigung" : ""}`}
                            fill
                            className="object-cover scale-110 group-hover:scale-100 transition-transform duration-[20s] ease-out"
                            loading="lazy"
                            sizes="(max-width: 768px) 100vw, 50vw"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/40">
                          <svg
                            className="w-12 h-12"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-semibold mb-2">{dj.name}</h4>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {dj.hasDisability && (
                          <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400">
                            Inklusiv
                          </span>
                        )}
                        {dj.bookableIndividually && (
                          <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                            Einzeln buchbar
                          </span>
                        )}
                      </div>
                      {dj.text && (
                        <p className="text-sm text-white/70 mb-4 line-clamp-3">{dj.text}</p>
                      )}
                      <Link
                        href={`/djs?dj=${dj.id}`}
                        className="inline-block text-sm text-brand-pink hover:text-brand-pink/80 transition-colors"
                      >
                        Jetzt buchen →
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <div className="text-center pt-4">
          <Link
            href="/djs"
            className="inline-flex items-center rounded-full bg-brand-pink px-6 py-3 text-lg font-semibold text-black hover:bg-brand-pink/90 transition-colors"
          >
            DJ's für dein Event buchen
          </Link>
        </div>
      </section>

      {/* Dance Crew Section */}
      <section className="relative rounded-3xl overflow-hidden min-h-[600px]">
        <Image
          src="/images/dance-crew-background.jpg"
          alt=""
          fill
          className="object-cover"
          loading="lazy"
          sizes="(max-width: 768px) 100vw, 1024px"
        />
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
        
        {/* Content */}
        <div className="relative z-10 p-8 md:p-12 space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-brand-pink">INCLUSIONS Dance Crew</p>
              <h2 className="text-3xl font-semibold text-white mt-2">Tanz, Energie, Inklusion</h2>
              <p className="mt-3 text-white/80 max-w-2xl">
                Unsere Dance Crew bringt die INCLUSIONS-Energie auf deine Bühne, in deinen Club oder an dein Festival. 
                Menschen mit und ohne Beeinträchtigung tanzen gemeinsam – professionell, kraftvoll und zutiefst berührend.{" "}
                <Link 
                  href="/dance-crew" 
                  className="text-brand-pink hover:text-brand-pink/80 underline font-semibold"
                >
                  Dance Crew buchen
                </Link>{" "}
                für Shows, Eröffnungen, Firmen-Events, Festivals oder inklusive Kulturprojekte.
              </p>
            </div>
            <Link
              href="/dance-crew"
              className="rounded-full border border-brand-pink px-6 py-3 text-brand-pink hover:bg-brand-pink hover:text-black transition-colors whitespace-nowrap bg-black/20 backdrop-blur-sm"
            >
              Mehr erfahren
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              "Echte Inklusion auf der Bühne: Menschen mit und ohne Beeinträchtigung tanzen gemeinsam – sichtbar, selbstbewusst und mit Freude.",
              "Professionelle Shows: Choreografien, die zu Clubkultur und Bühnen passen – von energiegeladen bis emotional.",
              "Flexibel buchbar: Für Festivals, Clubs, Firmen-Events, kulturelle Anlässe oder als Special Act bei deinem Event.",
            ].map((text) => (
              <article
                key={text}
                className="rounded-2xl bg-black/40 backdrop-blur-sm p-6 text-white/90 border border-white/10"
              >
                {text}
              </article>
            ))}
          </div>
          <div className="text-center pt-4">
            <Link
              href="/dance-crew"
              className="inline-flex items-center rounded-full bg-brand-pink px-6 py-3 text-lg font-semibold text-black hover:bg-brand-pink/90 transition-colors"
            >
              Dance Crew buchen
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}