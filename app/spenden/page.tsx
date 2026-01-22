import Link from "next/link";
import Image from "next/image";
import { TwintButton } from "@/components/TwintButton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Spenden - INCLUSIONS Bewegung unterstützen",
  description: "Unterstütze die INCLUSIONS-Bewegung mit deiner Spende. Musik verbindet, Inklusion verändert. Mit deiner Unterstützung schaffen wir unvergessliche Momente für Menschen mit und ohne Beeinträchtigung. Twint oder Banküberweisung möglich.",
  openGraph: {
    title: "Spenden - INCLUSIONS Bewegung unterstützen",
    description: "Unterstütze die INCLUSIONS-Bewegung mit deiner Spende. Musik verbindet, Inklusion verändert.",
    images: [
      {
        url: "/images/spenden-hero.jpg",
        width: 1200,
        height: 630,
        alt: "INCLUSIONS Event - Menschen feiern gemeinsam am DJ-Pult",
      },
    ],
  },
};

export default function SpendenPage() {
  return (
    <main className="min-h-screen max-w-6xl px-4 py-12 mx-auto space-y-16 text-white">
      {/* Hero Section with Image */}
      <section className="space-y-8">
        {/* Header Image with Animation */}
        <div className="relative w-full h-[500px] md:h-[600px] rounded-2xl overflow-hidden group">
          <div className="absolute inset-0 animate-float">
            <Image
              src="/images/spenden-hero.jpg"
              alt="INCLUSIONS Event im Supermarket Zürich - Menschen mit und ohne Beeinträchtigung feiern gemeinsam am DJ-Pult"
              fill
              className="object-cover scale-110 group-hover:scale-100 transition-transform duration-[20s] ease-out"
              quality={95}
              priority
              sizes="100vw"
              loading="eager"
            />
          </div>
          
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
          
          {/* Text Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-end text-center px-4 z-10 pb-8 md:pb-12">
            <div className="space-y-4 md:space-y-6 animate-fade-in w-full">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white [text-shadow:_2px_2px_8px_rgb(0_0_0_/_90%)]">
                Deine Spende macht einen Unterschied!
              </h1>
              <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto [text-shadow:_1px_1px_4px_rgb(0_0_0_/_80%)]">
                Musik verbindet. Inklusion verändert. Mit deiner Unterstützung schaffen wir unvergessliche Momente 
                für Menschen mit und ohne Beeinträchtigung.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Warum spenden */}
      <section className="space-y-6">
        <h2 className="text-3xl font-semibold">Warum dein Beitrag zählt</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <article className="rounded-2xl bg-white/5 p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-brand-pink/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-brand-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Vom Event zur Bewegung</h3>
                <p className="text-white/80">
                  INCLUSIONS 2 am 25. April 2026, 13:00 - 21:00 ist erst der Beginn. Der Start einer Bewegung 
                  mit der Vision von echter Inklusion. Mit deiner Spende wirst du Teil dieser Bewegung.
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-2xl bg-white/5 p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">100% transparent</h3>
                <p className="text-white/80">
                  Sobald die Kosten gedeckt sind, fliesst jeder zusätzliche Franken direkt an insieme Zürich – 
                  für Ferien, Kurse und Anlässe für Menschen mit Beeinträchtigung.
                </p>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* Spenden-Möglichkeiten */}
      <section className="space-y-8 rounded-3xl bg-white/10 p-8 md:p-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold">So kannst du unterstützen</h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Wähle die für dich passende Spenden-Möglichkeit. Jeder Beitrag hilft uns, die INCLUSIONS-Bewegung 
            weiterzuführen und unvergessliche Erlebnisse zu schaffen.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 items-start">
          {/* Twint Spende */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-brand-pink/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-8 h-8 text-brand-pink" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </div>
              <h3 className="text-2xl font-semibold">Schnell & einfach mit Twint</h3>
            </div>
            <p className="text-white/80">
              Spende direkt mit Twint – schnell, sicher und unkompliziert. Perfekt für spontane Unterstützung.
            </p>
            <div className="pt-4">
              <TwintButton />
            </div>
          </div>

          {/* Banküberweisung */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold">Banküberweisung</h3>
            </div>
            <div className="space-y-3 text-white/80">
              <div>
                <p className="text-sm text-white/60 mb-1">Vereinskonto für Spenden</p>
                <p className="font-mono text-lg font-semibold text-white">CH87 8080 8006 0762 5517 5</p>
              </div>
              <div className="space-y-1 text-sm">
                <p><strong>Verein INCLUSIONS</strong></p>
                <p>Freilagerstrasse 60</p>
                <p>8047 Zürich</p>
              </div>
              <div className="space-y-1 text-sm pt-2 border-t border-white/10">
                <p>IID (BC-Nr.): 80808</p>
                <p>SWIFT-BIC: RAIFCH22</p>
                <p>Raiffeisenbank</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Corporate Sponsoring & Stiftungen */}
      <section className="space-y-6">
        <div>
          <h2 className="text-3xl font-semibold mb-2">Corporate Sponsoring & Stiftungen</h2>
          <p className="text-lg text-white/80 max-w-3xl">
            Als Unternehmen oder Stiftung kannst du einen nachhaltigen Beitrag zur Inklusion leisten. 
            Gemeinsam zeigen wir, wie echte Inklusion klingt und sich anfühlt.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <article className="rounded-2xl bg-white/5 p-6 border border-white/10">
            <h3 className="text-xl font-semibold mb-3">Warum Corporate Sponsoring?</h3>
            <ul className="space-y-2 text-white/80">
              <li className="flex items-start gap-2">
                <span className="text-brand-pink mt-1">•</span>
                <span>Positioniere dich als Vorreiter für soziale Verantwortung</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-pink mt-1">•</span>
                <span>Sichtbarkeit bei einem einzigartigen, medienwirksamen Event</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-pink mt-1">•</span>
                <span>Unterstützung einer Bewegung, die wirklich etwas bewegt</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-pink mt-1">•</span>
                <span>Flexible Sponsoring-Möglichkeiten nach deinen Bedürfnissen</span>
              </li>
            </ul>
          </article>

          <article className="rounded-2xl bg-white/5 p-6 border border-white/10">
            <h3 className="text-xl font-semibold mb-3">Für Stiftungen</h3>
            <ul className="space-y-2 text-white/80">
              <li className="flex items-start gap-2">
                <span className="text-brand-pink mt-1">•</span>
                <span>Förderung von echter Inklusion und gesellschaftlichem Wandel</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-pink mt-1">•</span>
                <span>Transparente Verwendung der Mittel</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-pink mt-1">•</span>
                <span>Langfristige Wirkung durch nachhaltige Bewegung</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-pink mt-1">•</span>
                <span>Gemeinsam Barrieren abbauen und neue Verbindungen schaffen</span>
              </li>
            </ul>
          </article>
        </div>

        <div className="rounded-2xl bg-brand-pink/10 border border-brand-pink/30 p-6">
          <p className="text-white/90 leading-relaxed">
            <strong className="text-white">Lass uns reden!</strong> Wir beraten dich gerne individuell und finden 
            gemeinsam die passende Form der Unterstützung. Ob einmalige Spende, langfristige Partnerschaft oder 
            spezifisches Sponsoring – wir freuen uns auf deine Nachricht.
          </p>
        </div>
      </section>

      {/* Kontakt */}
      <section className="space-y-6 rounded-3xl bg-white/10 p-8">
        <h2 className="text-3xl font-semibold">Kontakt</h2>
        <p className="text-lg text-white/80">
          Hast du Fragen zum Sponsoring oder möchtest du uns persönlich kontaktieren?
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <p className="font-semibold text-white">Reto Willi, Co-Founder</p>
            <a 
              href="mailto:reto@inclusions.zone" 
              className="text-brand-pink hover:text-brand-pink/80 transition-colors inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              reto@inclusions.zone
            </a>
          </div>
          <div className="space-y-2">
            <p className="font-semibold text-white">Roland Lüthi, Co-Founder</p>
            <a 
              href="mailto:roland@inclusions.zone" 
              className="text-brand-pink hover:text-brand-pink/80 transition-colors inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              roland@inclusions.zone
            </a>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="text-center space-y-6 py-12">
        <h2 className="text-3xl md:text-4xl font-bold">Jeder Partner macht einen Unterschied</h2>
        <p className="text-lg text-white/80 max-w-3xl mx-auto">
          Dank unserer Partner wird aus einer Idee eine Bewegung. Mit deiner Unterstützung verbinden wir Menschen, 
          feiern Vielfalt und machen Inklusion erlebbar.
        </p>
        <p className="text-xl font-semibold text-brand-pink">
          Werde Teil der INCLUSIONS-Bewegung – GEMEINSAM ANDERS!
        </p>
        <div className="flex flex-wrap gap-4 justify-center pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-brand-pink px-6 py-3 text-lg font-semibold text-brand-pink hover:bg-brand-pink hover:text-black transition-colors"
          >
            Zurück zur Startseite
          </Link>
        </div>
      </section>
    </main>
  );
}
