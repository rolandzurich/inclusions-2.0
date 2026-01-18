import Image from "next/image";
import Link from "next/link";
import { PartnerLogo } from "@/components/PartnerLogo";
import { getAboutPageSchema, getBreadcrumbSchema, getPersonSchema, getBaseUrl } from "@/lib/geo-schema";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Über uns - Inclusions Team & Vision",
  description: "Inclusions ist ein Verein aus Zürich. Wir schaffen sichere Räume, in denen Menschen mit und ohne Beeinträchtigung Clubkultur erleben – barrierearm, wertschätzend und echt. Lerne Reto Willi und Roland Lüthi kennen.",
  openGraph: {
    title: "Über uns - Inclusions Team & Vision",
    description: "Inclusions ist ein Verein aus Zürich. Wir schaffen sichere Räume, in denen Menschen mit und ohne Beeinträchtigung Clubkultur erleben.",
    images: [
      {
        url: "/images/ueber-uns-hero.jpg",
        width: 1200,
        height: 630,
        alt: "Inclusions Team - Gemeinsam Musik machen und feiern",
      },
    ],
  },
};

const team = [
  {
    name: "Reto Willi",
    role: "Co-Founder",
    position: "Arbeitsagoge, Gastro und Eventmanagement",
    image: "/images/reto-willi.png",
    description: "Ein engagierter Arbeitsagoge mit über 20 Jahren Berufserfahrung in Sozialarbeit, Gastronomie und Eventmanagement. Fachlich versiert in der Betreuung und Förderung von Mitarbeitenden sowie in der Organisation inklusiver Projekte. Empathisch, lösungsorientiert und ein natürlicher Motivator, der sich für agile Führung und die Förderung individueller Potenziale einsetzt. Die Leidenschaft zur elektronischen Musik trägt er schon seit vielen Jahren in sich.",
    motivation: "Ich habe dieses Projekt ins Leben gerufen, weil ich dazu beitragen möchte, dass alle Menschen – unabhängig von ihren Fähigkeiten – die gleichen Chancen und Möglichkeiten haben. Es erfüllt mich, eine unterstützende und offene Umgebung zu schaffen, in der jeder sich wertgeschätzt und akzeptiert fühlt.",
  },
  {
    name: "Roland Lüthi",
    role: "Co-Founder",
    position: "Betreuer und Eventorganisation bei insieme Zürich",
    image: "/images/roland-luethi.png",
    description: "Als vielseitiger Marketing-Generalist und Event-Innovator mit über 20 Jahren Erfahrung bringt er digitale Strategien und kreative Konzepte zusammen, um nachhaltige und inklusive Projekte zu realisieren. Seine Expertise reicht von Digital Marketing und Brand Development bis hin zur Organisation von Achtsamkeits- und Inklusions-Events. Seine Leidenschaft für elektronische Musik, die Erfahrung in der Betreuung und Organisation für Anlässe für Menschen mit Beeinträchtigung ermöglichen es ihm, innovative Formate zu entwickeln, die Menschen zusammenbringen und inspirieren.",
    motivation: "Seit zwei Jahren arbeite ich bei insieme Zürich für Menschen mit Beeinträchtigung. Ich habe viele von ihnen in mein Herz geschlossen und sehe sie einfach als andere Menschen. Ich möchte, dass mehr Leute dieselbe Erfahrung machen.",
  },
];

export default function AboutPage() {
  const baseUrl = getBaseUrl();
  const jsonLdAbout = getAboutPageSchema(
    "Inclusions ist ein Verein aus Zürich. Wir schaffen sichere Räume, in denen Menschen mit und ohne Beeinträchtigung Clubkultur erleben – barrierearm, wertschätzend und echt. Lerne Reto Willi und Roland Lüthi kennen.",
    baseUrl + "/ueber-uns"
  );
  const jsonLdBreadcrumb = getBreadcrumbSchema([
    { name: "Inclusions", url: "/" },
    { name: "Über uns", url: "/ueber-uns" },
  ]);
  const jsonLdPersons = team.map((p) =>
    getPersonSchema({
      name: p.name,
      jobTitle: p.role,
      image: p.image,
      description: p.description,
      worksFor: { name: "Inclusions", url: baseUrl },
    })
  );

  return (
    <main className="min-h-screen max-w-6xl px-4 py-12 mx-auto space-y-16 text-white">
      {[jsonLdAbout, jsonLdBreadcrumb, ...jsonLdPersons].map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}
      {/* Hero Section */}
      <section className="space-y-8">
        <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden group">
          <div className="absolute inset-0 animate-float">
            <Image
              src="/images/ueber-uns-hero.jpg"
              alt="Inclusions Team - Gemeinsam Musik machen und feiern im Supermarket Zürich"
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
            <div className="space-y-4 animate-fade-in w-full">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white [text-shadow:_2px_2px_8px_rgb(0_0_0_/_90%)]">
                Über uns
              </h1>
              <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto [text-shadow:_1px_1px_4px_rgb(0_0_0_/_80%)]">
                Gemeinsam schaffen wir Momente und berühren Herzen, in denen Musik verbindet und Inklusion gelebt wird.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <p className="text-white/70">
          Inclusions ist ein Verein aus Zürich, politisch und religiös neutral. Wir schaffen sichere Räume, in denen Menschen mit und
          ohne Beeinträchtigung Clubkultur erleben – wertschätzend und echt.
        </p>
      </section>

      {/* Vision Section */}
      <section className="space-y-8 rounded-2xl bg-white/5 p-8">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-brand-pink">Inclusions - Die Vision</h2>
          <p className="text-lg text-white/90 leading-relaxed max-w-read">
            Stell dir eine Welt vor, in der Musik und Tanz keine Grenzen kennen – eine Welt, in der Menschen mit und ohne Beeinträchtigung zusammenkommen, um zu feiern, zu kreieren und Neues zu erschaffen. Mit der Inclusions setzen wir ein Zeichen: Wir verbinden Welten, brechen Barrieren und schaffen ein einmaliges Erlebnis, das Leben verändert.
          </p>
        </div>

        <div className="space-y-4 pt-6 border-t border-white/10">
          <h3 className="text-2xl font-semibold">Unsere Vision ist klar</h3>
          <p className="text-white/80 leading-relaxed">
            Wir wollen eine inklusive Bewegung starten, die Menschen inspiriert und zusammenführt. Mit elektronischer Musik als Herzstück wird Inclusions ein Raum, in dem Kreativität, Gemeinschaft und Vielfalt gelebt werden. Dabei integrieren wir Menschen mit Beeinträchtigung in jede Facette dieses Events – sei es als Co – DJs, Tänzer, Filmemacher, beim Catering oder Designer. Jeder Beitrag zählt, und jeder Moment erzählt eine Geschichte der Stärke und des Miteinanders.
          </p>
        </div>

        <div className="space-y-4 pt-6 border-t border-white/10">
          <h3 className="text-2xl font-semibold">Warum Inclusions?</h3>
          <ul className="space-y-3 text-white/80">
            <li className="flex items-start">
              <span className="text-brand-pink mr-3">•</span>
              <span>Eine inklusive Gesellschaft ohne Grenzen – durch Musik, Tanz und gemeinsam Begegnungen.</span>
            </li>
            <li className="flex items-start">
              <span className="text-brand-pink mr-3">•</span>
              <span>Ein gemeinsames Verständnis schaffen, dass Vielfalt unsere grösste Stärke ist.</span>
            </li>
            <li className="flex items-start">
              <span className="text-brand-pink mr-3">•</span>
              <span>Ein klares Ziel vor Augen: Barrieren abbauen und neue Verbindungen schaffen.</span>
            </li>
            <li className="flex items-start">
              <span className="text-brand-pink mr-3">•</span>
              <span>Flexibel und kreativ auf Herausforderungen reagieren, um Grosses zu erreichen.</span>
            </li>
          </ul>
        </div>

        <div className="space-y-4 pt-6 border-t border-white/10">
          <h3 className="text-2xl font-semibold">Sei Teil von etwas Grossem!</h3>
          <p className="text-white/80 leading-relaxed">
            Inclusions ist mehr als nur ein Event – es ist der Startschuss zu einer Bewegung, die zeigt, was möglich ist, wenn wir zusammenarbeiten. Sei dabei – als Sponsor, aktiver Partner, Gönner, Unterstützer oder als Partygast. Gemeinsam machen wir das Unmögliche möglich.
          </p>
        </div>

        <div className="space-y-4 pt-6 border-t border-white/10">
          <h3 className="text-2xl font-semibold">Jetzt mitmachen und Teil der Veränderung werden!</h3>
          <p className="text-white/80 leading-relaxed mb-4">
            Beteilige Dich aktiv an Inclusions. Unterstütze uns auf die Weise, welche Dir entspricht. Alle und alles sind willkommen, um Teil der Veränderung zu werden, welche Inclusions anstrebt.
          </p>
          <ul className="space-y-3 text-white/80 mb-6">
            <li className="flex items-start">
              <span className="text-brand-pink mr-3">•</span>
              <span>Aktive Mitarbeit bei Inclusions</span>
            </li>
            <li className="flex items-start">
              <span className="text-brand-pink mr-3">•</span>
              <span>Sponsoring-Möglichkeiten</span>
            </li>
            <li className="flex items-start">
              <span className="text-brand-pink mr-3">•</span>
              <span>Institutionelle Partnerschaften</span>
            </li>
          </ul>
          <Link
            href="/anmeldung"
            className="inline-flex items-center gap-2 rounded-full bg-brand-pink px-6 py-3 text-lg font-semibold text-black hover:bg-brand-pink/90 transition-colors"
          >
            <span>aktiv werden</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      {/* KI-First Social Innovator Section */}
      <section className="space-y-4 rounded-2xl bg-white/5 p-8">
        <h2 className="text-2xl font-semibold">Inclusions KI-First Social Innovator</h2>
        <p className="text-white/80 leading-relaxed mb-4">
          KI entlastet uns bei Admin-Aufgaben und macht Zugang einfacher. Wir nutzen KI als Werkzeug, um Menschlichkeit zu fördern – kein Tech-Hype, sondern echte Wirkung für mehr Inklusion und Barrierefreiheit.
        </p>
        <Link
          href="/ki-innovator"
          className="inline-flex items-center gap-2 rounded-full bg-brand-pink px-6 py-3 text-lg font-semibold text-black hover:bg-brand-pink/90 transition-colors"
        >
          <span>Mehr erfahren</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        {team.map((person) => (
          <article key={person.name} className="rounded-2xl bg-white/5 p-6">
            <div className="h-80 rounded-2xl overflow-hidden relative group">
              <div className="absolute inset-0 animate-float">
                <Image
                  src={person.image}
                  alt={`${person.name} - ${person.role} bei Inclusions, ${person.position}`}
                  fill
                  className="object-cover object-top scale-110 group-hover:scale-100 transition-transform duration-[20s] ease-out"
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
            <h2 className="mt-4 text-2xl font-semibold">{person.name}</h2>
            <p className="text-brand-pink">{person.role}</p>
            <p className="mt-2 text-sm text-white/60">{person.position}</p>
            <p className="mt-4 text-white/70">{person.description}</p>
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-sm font-semibold text-white/90 mb-2">Was motiviert dich an diesem Projekt:</p>
              <p className="text-white/70 italic">{person.motivation}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="space-y-6 rounded-2xl bg-white/5 p-6">
        <div>
          <h2 className="text-2xl font-semibold">Partner &amp; Netzwerke</h2>
          <p className="mt-2 text-white/70">
            Dank unserer Partner wird aus einer Idee eine Bewegung.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
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
      </section>
    </main>
  );
}


