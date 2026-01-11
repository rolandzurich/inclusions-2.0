import Link from "next/link";
import Image from "next/image";
import { getAllDJPairs, getDJPairWithDJs, getDJById, getPairDisplayName } from "@/lib/dj-utils";
import dynamic from "next/dynamic";
import { PartnerLogo } from "@/components/PartnerLogo";
import { TwintButton } from "@/components/TwintButton";
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

// Voice Agent nur im Browser laden, nicht beim Server-Side Rendering
const VoiceAgent = dynamic(
  () => import("@/components/VoiceAgent").then((mod) => ({ default: mod.VoiceAgent })),
  { 
    ssr: false,
    loading: () => (
      <div className="mt-8 rounded-2xl bg-white/10 p-4 text-white space-y-4">
        <h2 className="text-xl font-semibold">Mit mir sprechen (Test-Voice-Agent)</h2>
        <p className="text-sm text-white/80">Lade...</p>
      </div>
    )
  }
);

const quotes = [
  '"Ich habe mich noch nie so frei gefühlt wie bei Inclusions."',
  '"Hier tanzen Menschen wirklich miteinander – nicht nebeneinander."',
  '"Das war einer der schönsten Tage meines Lebens."',
  '"Musik verbindet uns alle – das spürt man hier so stark."'
];


// Logo color pattern: Magenta, Yellow, Sky Blue, Red, Lime Green
const logoColors = [
  "#FF04D3", // Magenta/Pink
  "#FFD700", // Yellow
  "#00BFFF", // Sky Blue
  "#FF0000", // Red
  "#00FF00", // Lime Green
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

export default function HomePage() {
  return (
    <main className="min-h-screen max-w-6xl px-4 py-12 mx-auto space-y-16">
      {/* Hero */}
      <section className="space-y-8">
        <Link href="/ki-innovator" className="text-sm uppercase tracking-[0.25em] text-brand-pink hover:text-brand-pink/80 transition-colors inline-block">
          Inclusions KI-First Social Innovator
        </Link>
        
        {/* Header Image with Animation */}
        <div className="relative w-full h-[600px] md:h-[700px] rounded-2xl overflow-hidden group">
          <div className="absolute inset-0 animate-float">
            <Image
              src="/images/hero.jpg"
              alt="Inclusions Event im Supermarket Zürich - Über 400 Menschen mit und ohne Beeinträchtigung tanzen zusammen in einer inklusiven Atmosphäre"
              fill
              className="object-cover scale-110 group-hover:scale-100 transition-transform duration-[20s] ease-out"
              quality={95}
              priority
              sizes="100vw"
              loading="eager"
            />
          </div>
          
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
          
          {/* Text Overlay */}
          <div className="absolute inset-0 flex flex-col items-center text-center px-4 z-10">
            <div className="w-full flex flex-col items-center">
              <div className="text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-bold font-bangers tracking-wider [text-shadow:_2px_2px_4px_rgb(0_0_0_/_80%)] pt-8 md:pt-12 lg:pt-16 mb-4 md:mb-6 animate-fade-in">
                <div className="text-center">
                  <ColoredText text="INCLUSIONS" /> <ColoredText text="2" />
                </div>
              </div>
              <div className="space-y-4 animate-fade-in mt-auto pb-4 md:pb-6">
                <p className="text-2xl md:text-3xl lg:text-4xl font-bangers font-bold text-brand-pink">
                  25.04.2026
                </p>
                <p className="text-lg md:text-xl lg:text-2xl font-bangers text-white/80">
                  13:00 - 21:00
                </p>
                <p className="text-lg md:text-xl lg:text-2xl font-bangers text-white/80">
                  Club Supermarket, Zürich
                </p>
              </div>
              
              {/* Lineup und Buttons - weiter unten positioniert */}
              <div className="space-y-4 animate-fade-in pb-12 md:pb-16 lg:pb-20 mt-12 md:mt-16 lg:mt-20">
                <div className="space-y-2">
                  <p className="text-xl md:text-2xl lg:text-3xl font-bangers text-white font-semibold">
                    Lineup
                  </p>
                  <p className="text-lg md:text-xl lg:text-2xl font-bangers text-white/90">
                    Samy Jackson · Hoibaer · _miniArt°°° · Zagara · Coco.bewegt & Inclusions DJ's
                  </p>
                </div>
                <div className="flex flex-row gap-4 justify-center items-start">
                  <Link
                    href="https://supermarket.li"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-brand-pink px-6 py-3 text-lg font-semibold text-black hover:bg-brand-pink/90 transition-colors"
                  >
                    Ticket kaufen
                  </Link>
                  <div className="flex flex-col items-center gap-1">
                    <Link
                      href="/anmeldung/vip"
                      className="rounded-full border-2 border-white px-6 py-3 text-lg font-semibold text-white hover:bg-white/10 transition-colors"
                    >
                      VIP Anmeldung
                    </Link>
                    <p className="text-xs text-white/80 text-center whitespace-nowrap">
                      Gratis Eintritt für Menschen mit Beeinträchtigung
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="text-white">
          <h1 className="text-4xl font-bold md:text-5xl">
            Vom Event zur Bewegung.
          </h1>
          <p className="mt-4 text-xl text-white/80 max-w-3xl">
            Wir verbinden Menschen mit und ohne Beeinträchtigung durch Musik, Begegnung und echte
            Menschlichkeit.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              href="/events"
              className="rounded-full bg-brand-pink px-6 py-3 text-lg font-semibold text-black"
            >
              Nächster Event
            </Link>
          </div>
        </div>
      </section>

      {/* Was ist Inclusions */}
      <section className="space-y-6">
        <h2 className="text-3xl font-semibold text-white">Was ist Inclusions?</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { title: "Gemeinsam anders", text: "Bei Inclusions schaffen wir Räume, in denen Menschen echt und auf Augenhöhe zusammenkommen." },
            { title: "Musik verbindet", text: "Wir feiern eine Clubkultur, die offen für alle ist – unabhängig von Fähigkeit, Herkunft oder Background." },
            { title: "Eine neue Bewegung", text: "Nach dem Erfolg der ersten Edition gehen wir den Weg weiter: vom Event zur Community." }
          ].map((item) => (
            <article key={item.title} className="rounded-2xl bg-white/5 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
              <p className="text-lg text-white/80">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Rückblick */}
      <section className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-brand-pink mb-1">Rückblick</p>
          <h2 className="text-3xl font-semibold text-white leading-snug mt-1">Inclusions 1. Edition</h2>
        </div>
        <div className="space-y-3 text-white/80">
          <p>Am 27. September 2025 haben wir Geschichte geschrieben.</p>
          <p>Über 400 Menschen – mit und ohne Beeinträchtigung – tanzten zusammen im Supermarket Zürich.</p>
          <p>Energie. Verbindung. Menschlichkeit. Pure Freude.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { src: "/images/rueckblick-1.jpg", alt: "Inclusions 1. Edition - Event Moment im Supermarket Zürich mit Menschen mit und ohne Beeinträchtigung" },
            { src: "/images/rueckblick-2.jpg", alt: "Inclusions 1. Edition - Gemeinsam tanzen und feiern in inklusiver Atmosphäre" },
            { src: "/images/rueckblick-3.jpg", alt: "Inclusions 1. Edition - Feiern zusammen - Über 400 Menschen im Supermarket Zürich" }
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

      {/* Nächster Event */}
      <section className="rounded-3xl bg-white/10 p-8 text-white shadow-lg">
        <div className="grid gap-6 md:grid-cols-2 items-center">
          <div>
            <h2 className="text-3xl font-semibold">Nächster Event</h2>
            <p className="mt-4 text-2xl font-bold text-brand-pink">Inclusions 2</p>
            <p className="mt-2 text-lg">25. April 2026, 13:00 - 21:00 · Supermarket Zürich</p>
            <Link
              href="/events"
              className="mt-6 inline-flex rounded-full bg-brand-pink px-6 py-3 text-lg font-semibold text-black"
            >
              Details
            </Link>
          </div>
          <div className="w-full mt-6 md:mt-0 aspect-square">
            <iframe
              src="https://drive.google.com/file/d/1WyW2nXsGczJIpQ5_K9xScMPl3nxLAuys/preview"
              className="w-full h-full min-h-[260px] rounded-2xl"
              allow="autoplay"
              allowFullScreen
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
            feiern gemeinsam auf Augenhöhe. Wähle deinen Weg zur Inclusions 2.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Party People */}
          <div className="rounded-3xl bg-white/10 p-8 border-2 border-white/20 hover:border-brand-pink/50 transition-all">
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
                  Bei Inclusions tanzen Menschen mit und ohne Beeinträchtigung zusammen – auf Augenhöhe, 
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
                  Bei Inclusions geht es ums gemeinsame Feiern und Erleben – du wirst dich wohlfühlen.
                </p>
              </div>

              {/* CTA */}
              <div className="pt-4">
                <p className="text-sm text-white/60 mb-3">
                  Tickets ab Januar 2026 verfügbar über Supermarket
                </p>
                <Link
                  href="/events"
                  className="inline-flex items-center gap-2 rounded-full bg-brand-pink px-6 py-3 text-lg font-semibold text-black hover:bg-brand-pink/90 transition-colors w-full justify-center"
                >
                  <span>Mehr Infos</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          {/* VIPs */}
          <div className="rounded-3xl bg-gradient-to-br from-brand-pink/20 to-brand-pink/10 p-8 border-2 border-brand-pink/30 hover:border-brand-pink/50 transition-all">
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
                  <p>• <strong>Nur VIPs kommen gratis:</strong> Freunde, Familie und Betreuer müssen ein Ticket kaufen</p>
                  <p>• Betreuer kommen nur gratis, wenn du auf 1-zu-1 Betreuung angewiesen bist</p>
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
            <strong className="text-white">Gemeinsam feiern wir Vielfalt.</strong> Bei Inclusions 
            bringen wir beide Welten zusammen – auf Augenhöhe, mit Respekt und purem Spass. 
            Sei dabei und erlebe, was möglich ist, wenn wir zusammenarbeiten.
          </p>
        </div>
      </section>

      {/* Partner */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-semibold text-white">Dank unserer Partner wird aus einer Idee eine Bewegung.</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {[
            { name: "insieme Zürich", logo: "/images/partners/insieme.png", hasLogo: true },
            { name: "Supermarket", logo: "/images/partners/supermarket.png", hasLogo: true },
            { name: "TIXI Taxi", logo: "/images/partners/tixi.png", hasLogo: true },
            { name: "BCK", logo: "/images/partners/bck.png", hasLogo: true },
            { name: "Manroof", logo: "/images/partners/manroof.png", hasLogo: true },
            { name: "Tanz am Morgen", logo: "/images/partners/tanz-am-morgen.png", hasLogo: true },
            { name: "AVTL Content", logo: "/images/partners/avtl.png", hasLogo: true },
            { name: "Colette M", logo: "/images/partners/colette-m.png", hasLogo: true },
            { name: "Alex Flach", logo: "/images/partners/alex-flach.png", hasLogo: true },
            { name: "Animaltrainer", logo: "/images/partners/animaltrainer.png", hasLogo: true },
            { name: "Hitschfilm", logo: "/images/partners/hitschfilm.png", hasLogo: true },
            { name: "Watchman", logo: "/images/partners/watchman.png", hasLogo: true },
          ].map((partner, index) => (
            <div
              key={index}
              className="flex items-center justify-center p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 h-32"
            >
              {partner.hasLogo ? (
                <PartnerLogo src={partner.logo} alt={partner.name} />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-xs text-white/70 text-center px-2">{partner.name}</span>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="text-center pt-4">
          <Link
            href="/spenden"
            className="inline-flex items-center gap-2 rounded-full bg-brand-pink px-6 py-3 text-lg font-semibold text-black hover:bg-brand-pink/90 transition-colors"
          >
            Partner werden
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Spenden */}
      <section className="space-y-4 rounded-3xl bg-white/5 p-8 text-white">
        <h2 className="text-3xl font-semibold">Spenden</h2>
        <p className="text-lg text-white/80 max-w-3xl">
          Inclusions ist eine gemeinnützige Bewegung. Mit deiner Unterstützung ermöglichen wir
          Events, Begleitung und Teilhabe. Jeder Beitrag macht einen Unterschied.
        </p>
        <div className="flex flex-wrap gap-4 items-center">
          <Link
            href="/spenden"
            className="inline-flex rounded-full bg-brand-pink px-6 py-3 text-lg font-semibold text-black hover:bg-brand-pink/90 transition-colors"
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
            <article key={quote} className="rounded-3xl bg-white/15 p-6 text-lg text-white/90">
              {quote}
            </article>
          ))}
        </div>
      </section>

      {/* DJs Section */}
      <section className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-white">Unsere DJs</h2>
            <p className="mt-3 text-white/80 max-w-2xl">
              Ein USP von Inclusions sind die DJ Pairs: professionelle DJs legen zusammen mit DJs mit 
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
                          alt={`${pair.name} - Inklusives DJ-Pairing für das Inclusions Event`}
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
                    <p className="text-sm text-white/70 mb-4">{pair.text}</p>
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
          <h3 className="text-2xl font-semibold text-white mb-4">Bekannte Resident DJs</h3>
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
                            alt={`${dj.name} - Resident DJ bei Inclusions${dj.hasDisability ? " mit Beeinträchtigung" : ""}`}
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
                        <p className="text-sm text-white/70 mb-4">{dj.text}</p>
                      )}
                      <div className="flex items-center gap-3">
                        {dj.soundcloud && (
                          <a
                            href={dj.soundcloud}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-brand-pink hover:text-brand-pink/80 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.84-.179-.84-.66 0-.359.24-.66.54-.779 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.242 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                            </svg>
                            SoundCloud
                          </a>
                        )}
                        <Link
                          href={`/djs?dj=${dj.id}`}
                          className="inline-block text-sm text-brand-pink hover:text-brand-pink/80 transition-colors"
                        >
                          Jetzt buchen →
                        </Link>
                      </div>
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
            DJs für deinen Event buchen
          </Link>
        </div>
      </section>

      {/* Dance Crew Section */}
      <section 
        className="relative rounded-3xl overflow-hidden min-h-[600px]"
        style={{ 
          backgroundImage: "url('/images/dance-crew-background.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
        
        {/* Content */}
        <div className="relative z-10 p-8 md:p-12 space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-3xl font-bangers font-semibold text-white">Dance Crew - Tanz, Energie, Inklusion</h2>
              <p className="mt-3 text-white/80 max-w-2xl">
                Unsere Dance Crew bringt die Inclusions-Energie auf deine Bühne, in deinen Club oder an dein Festival. 
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

      <VoiceAgent />
    </main>
  );
}