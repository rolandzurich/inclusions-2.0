import Link from "next/link";
import { getFAQPageSchema, getBreadcrumbSchema, getBaseUrl } from "@/lib/geo-schema";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fragen & Antworten - INCLUSIONS",
  description: "Häufige Fragen zu INCLUSIONS: Was ist INCLUSIONS? Wann und wo? VIP-Anmeldung, Tickets, DJ Pairs und Dance Crew. Kurz und verständlich beantwortet.",
  openGraph: {
    title: "Fragen & Antworten - INCLUSIONS",
    description: "Häufige Fragen zu INCLUSIONS – von Event-Daten über VIP-Anmeldung bis zu DJ Pairs und Dance Crew.",
  },
};

const faqItems: { question: string; answer: string }[] = [
  { question: "Was ist INCLUSIONS?", answer: "INCLUSIONS ist ein inklusives Event in Zürich. Wir verbinden Menschen mit und ohne Beeinträchtigung durch Musik, Begegnung und echte Menschlichkeit. Im Supermarket Zürich feiern wir gemeinsam – mit DJ's, Dance Crew, Techno und einer offenen Clubkultur für alle." },
  { question: "Wann ist das nächste INCLUSIONS Event?", answer: "INCLUSIONS 2 findet am 25. April 2026 von 13:00 bis 21:00 Uhr im Supermarket Zürich statt. Tickets gibt es über supermarket.li/events/inclusions/." },
  { question: "Wo findet INCLUSIONS statt?", answer: "INCLUSIONS findet im Supermarket (Club) in Zürich statt. Der Ort ist barrierefrei. Adresse und Wegbeschreibung findest du auf supermarket.li." },
  { question: "Wie komme ich als VIP gratis zu INCLUSIONS?", answer: "Menschen mit IV-Ausweis, Beeinträchtigung oder Behinderung können sich als VIP anmelden und erhalten gratis Eintritt, vergünstigtes Essen und Getränke, ein Helfer-Team und auf Wunsch TIXI-Taxi. Anmeldung im Vorfeld unter inclusions.zone/anmeldung/vip erforderlich. Mindestalter 20 Jahre." },
  { question: "Wo kaufe ich Tickets für INCLUSIONS?", answer: "Tickets für INCLUSIONS 2 kaufst du über den Supermarket: supermarket.li/events/inclusions/. Party People kaufen ein Ticket; VIPs mit Beeinträchtigung melden sich unter inclusions.zone/anmeldung/vip an und kommen gratis." },
  { question: "Was sind DJ Pairs bei INCLUSIONS?", answer: "DJ Pairs sind ein Markenzeichen von INCLUSIONS: Professionelle DJ's legen zusammen mit DJ's mit Beeinträchtigung auf. So entsteht ein inklusives Erlebnis auf der Tanzfläche. DJ Pairs und Resident DJ's können auch für externe Events gebucht werden." },
  { question: "Was ist die INCLUSIONS Dance Crew?", answer: "Die INCLUSIONS Dance Crew sind Tänzer:innen mit und ohne Beeinträchtigung, die gemeinsam performen. Sie treten bei INCLUSIONS auf und sind buchbar für Festivals, Firmen-Events und inklusive Kulturprojekte." },
];

export default function FAQPage() {
  const baseUrl = getBaseUrl();
  const jsonLdFAQ = getFAQPageSchema(faqItems, baseUrl + "/faq");
  const jsonLdBreadcrumb = getBreadcrumbSchema([
    { name: "INCLUSIONS", url: "/" },
    { name: "Fragen & Antworten", url: "/faq" },
  ]);

  return (
    <main className="min-h-screen max-w-6xl px-4 py-12 mx-auto space-y-12 text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFAQ) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }} />

      <nav aria-label="Breadcrumb" className="text-sm text-white/70">
        <ol className="flex flex-wrap gap-x-2 gap-y-1">
          <li><Link href="/" className="hover:text-white transition-colors">INCLUSIONS</Link></li>
          <li aria-hidden>/</li>
          <li className="text-white">Fragen & Antworten</li>
        </ol>
      </nav>

      <section className="space-y-8">
        <h1 className="text-4xl font-bold text-white">Häufige Fragen zu INCLUSIONS</h1>
        <p className="text-xl text-white/80 max-w-2xl">
          Hier finden Sie Antworten zu Event, VIP-Anmeldung, Tickets, DJ Pairs und Dance Crew – kurz und verständlich.
        </p>

        <dl className="space-y-6" aria-label="Fragen und Antworten">
          {faqItems.map((item, i) => (
            <div key={i} className="rounded-2xl bg-white/5 p-6 border border-white/5">
              <dt className="text-lg font-semibold text-white">{item.question}</dt>
              <dd className="mt-2 text-white/80 leading-relaxed">{item.answer}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="text-white/70">
        Weitere Fragen? Schreiben Sie uns:{" "}
        <a href="mailto:reto@inclusions.zone" className="text-brand-pink hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink focus-visible:ring-offset-2 focus-visible:ring-offset-brand-dark rounded">reto@inclusions.zone</a>
        {" "}oder{" "}
        <a href="mailto:roland@inclusions.zone" className="text-brand-pink hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink focus-visible:ring-offset-2 focus-visible:ring-offset-brand-dark rounded">roland@inclusions.zone</a>.
      </p>
    </main>
  );
}
