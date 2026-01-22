import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vision - INCLUSIONS Inklusion & Gesellschaft",
  description: "INCLUSIONS setzt sich für eine Gesellschaft ein, in der kulturelle Teilhabe, Begegnung und Inklusion selbstverständlich sind. Menschenrechte, UNO-Behindertenrechtskonvention, Agenda 2030.",
  openGraph: {
    title: "Vision - INCLUSIONS Inklusion & Gesellschaft",
    description: "Für eine Gesellschaft, in der kulturelle Teilhabe, Begegnung und Inklusion selbstverständlich sind.",
    images: [{ url: "/images/ueber-uns-hero.jpg", width: 1200, height: 630, alt: "INCLUSIONS Vision - Gemeinsam für Inklusion" }],
  },
};

export default function VisionPage() {
  return (
    <main className="min-h-screen max-w-6xl px-4 py-12 mx-auto space-y-16 text-white">
      {/* Hero Section */}
      <section className="space-y-8">
        <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden group">
          <div className="absolute inset-0 animate-float">
            <Image
              src="/images/ueber-uns-hero.jpg"
              alt="INCLUSIONS Vision - Gemeinsam für Inklusion"
              fill
              className="object-cover scale-110 group-hover:scale-100 transition-transform duration-[20s] ease-out"
              quality={95}
              priority
              sizes="100vw"
            />
          </div>
          
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
          
          {/* Text Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-end text-center px-4 z-10 pb-8 md:pb-12">
            <div className="space-y-4 animate-fade-in w-full">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white [text-shadow:_2px_2px_8px_rgb(0_0_0_/_90%)]">
                Unsere Vision
              </h1>
              <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto [text-shadow:_1px_1px_4px_rgb(0_0_0_/_80%)]">
                Für eine Gesellschaft, in der kulturelle Teilhabe, Begegnung und Inklusion selbstverständlich sind.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="space-y-8">
        <div className="space-y-6 text-white/90 leading-relaxed">
          <p className="text-lg">
            INCLUSIONS setzt sich für eine Gesellschaft ein, in der kulturelle Teilhabe, Begegnung und Inklusion als Selbstverständlichkeit gelebt werden. Wir stehen dafür ein, dass Menschen mit und ohne Beeinträchtigung selbstbestimmt, kreativ und aktiv am gesellschaftlichen Leben teilnehmen können. Musik, Tanz und gemeinsames Erleben dienen dabei als verbindende Kraft, um Barrieren abzubauen und neue Perspektiven zu eröffnen. Unsere Arbeit orientiert sich an den Grundsätzen der <Link href="https://www.un.org/german/de" target="_blank" rel="noopener noreferrer" className="text-brand-pink hover:text-brand-pink/80 underline">Menschenrechte</Link> sowie an der <Link href="https://www.ebgb.admin.ch/de/uebereinkommen-der-uno-ueber-die-rechte-von-menschen-mit-behinderungen" target="_blank" rel="noopener noreferrer" className="text-brand-pink hover:text-brand-pink/80 underline">UNO-Behindertenrechtskonvention</Link> und leistet einen Beitrag zur Förderung von Chancengleichheit und sozialer Teilhabe im Sinne der <Link href="https://sdgs.un.org/goals" target="_blank" rel="noopener noreferrer" className="text-brand-pink hover:text-brand-pink/80 underline">Agenda 2030 der Vereinten Nationen</Link>.
          </p>

          <p className="text-lg">
            Die Projekte von INCLUSIONS richten sich konsequent nach den Bedürfnissen der beteiligten Menschen und werden partizipativ entwickelt. Im Zentrum steht ein inklusives Eventformat mit elektronischer Musik, das Menschen mit Beeinträchtigung in alle Bereiche aktiv einbindet – als Co-DJ's, Tänzer:innen, Kreative, Filmschaffende, im Catering, Design oder in der Organisation. Ziel aller Aktivitäten ist es, Kreativität zu fördern, Selbstvertrauen zu stärken und Eigenverantwortung sowie Gemeinschaftsgefühl erlebbar zu machen. Sämtliche Angebote sind auf eine nachhaltige, ganzheitliche Wirkung ausgelegt und verstehen Inklusion nicht als Ausnahme, sondern als gelebte Normalität.
          </p>

          <p className="text-lg">
            Darüber hinaus sensibilisiert INCLUSIONS die Öffentlichkeit und sucht Fachpersonen aus Kultur, Sozialarbeit und Eventmanagement für inklusive Arbeits- und Begegnungsformen. Wir teilen Erfahrungen und Good-Practice-Beispiele, vernetzen uns mit Gleichgesinnten und engagieren uns aktiv in der Bewusstseinsbildung. Durch gezielte Medienarbeit, Kooperationen, Workshops und öffentliche Auftritte tragen wir die Vision einer inklusiven Kulturbewegung nach aussen. INCLUSIONS ist mehr als ein Event – es ist der Beginn einer Bewegung, die zeigt, was möglich wird, wenn Vielfalt als Stärke erkannt und gemeinsam gelebt wird.
          </p>
        </div>
      </section>

      {/* Links Section */}
      <section className="space-y-4 rounded-2xl bg-white/5 p-8">
        <h2 className="text-2xl font-semibold mb-6">Unsere Grundlagen</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-brand-pink mb-2">Menschenrechte</h3>
            <p className="text-white/70 mb-2">
              Unsere Arbeit orientiert sich an den Grundsätzen der Menschenrechte.
            </p>
            <Link 
              href="https://www.un.org/german/de" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-brand-pink hover:text-brand-pink/80 underline"
            >
              Mehr erfahren
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          </div>

          <div className="pt-4 border-t border-white/10">
            <h3 className="text-lg font-semibold text-brand-pink mb-2">UNO-Behindertenrechtskonvention</h3>
            <p className="text-white/70 mb-2">
              Unsere Arbeit basiert auf den Prinzipien der UNO-Behindertenrechtskonvention.
            </p>
            <Link 
              href="https://www.ebgb.admin.ch/de/uebereinkommen-der-uno-ueber-die-rechte-von-menschen-mit-behinderungen" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-brand-pink hover:text-brand-pink/80 underline"
            >
              Mehr erfahren
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          </div>

          <div className="pt-4 border-t border-white/10">
            <h3 className="text-lg font-semibold text-brand-pink mb-2">UN Sustainable Development Goals</h3>
            <p className="text-white/70 mb-2">
              Wir leisten einen Beitrag zur Agenda 2030 der Vereinten Nationen.
            </p>
            <Link 
              href="https://sdgs.un.org/goals" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-brand-pink hover:text-brand-pink/80 underline"
            >
              Mehr erfahren
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

