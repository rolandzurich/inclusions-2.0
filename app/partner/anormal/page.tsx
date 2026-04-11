import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

/** Offizielles Partner-Statement von ANORMAL Fashion (Absätze mit \n\n). */
const ANORMAL_PARTNER_STATEMENT: string | null = `Unsere Tochter lebt mit Trisomie 21 – und genau dadurch wurde uns noch klarer, wie wichtig echte Teilhabe, Verständnis und Chancen sind. Nicht nur im Alltag, sondern auch in der Gesellschaft und im Arbeitsleben.

Mit ANORMAL gehen wir diesen Weg konsequent weiter. Neben unserer Marke befinden wir uns aktuell in der Gründung eines gemeinnützigen Vereins, der Arbeitsplätze für Menschen schafft, die im klassischen Arbeitsmarkt oft keinen Platz finden – sei es durch Suchterkrankungen, psychische oder physische Herausforderungen.

Unsere Kleidung ist dabei Mittel zum Zweck: Durch Bereiche wie Siebdruck, Stickerei und kreative Produktion entstehen sinnvolle Tätigkeiten, Perspektiven und echte Teilhabe.

Wir wollen Strukturen schaffen, die Menschen stärken – und zeigen, dass jeder Mensch Wert hat und etwas beitragen kann.

INCLUSIONS steht für genau diese Haltung.

Deshalb sind wir Teil davon.`;

export const metadata: Metadata = {
  title: "ANORMAL Fashion – Partner | Inclusions",
  description:
    "ANORMAL Fashion verbindet Mode mit echten Geschichten – «Represents Solidarity». Ronny und Livia sind bei INCLUSIONS 2 am Mercstand dabei; ihre Wege berühren und teilen unsere Werte.",
  openGraph: {
    title: "ANORMAL Fashion – Partner | Inclusions",
    description:
      "Mode mit Herz: ANORMAL Fashion ist Partner von INCLUSIONS – Solidarität, echte Geschichten, Inklusion.",
    images: [
      {
        url: "/images/partner/anormal-hero.png",
        width: 1024,
        height: 683,
        alt: "Ronny und Livia, ANORMAL Fashion",
      },
    ],
  },
};

export default function AnormalPartnerPage() {
  return (
    <main className="min-h-screen text-white">
      <section className="relative w-full h-[78vh] min-h-[520px] overflow-hidden bg-brand-dark">
        {/* Nur unten abdunkeln — kein «via» über die ganze Höhe, sonst wirkt das Foto schwarz */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/partner/anormal-hero.png"
            alt="Ronny und Livia, Gründer von ANORMAL Fashion – auf der Lebenslinie"
            fill
            className="object-cover object-[center_42%] md:object-center"
            quality={92}
            priority
            sizes="100vw"
          />
        </div>
        <div
          className="absolute inset-x-0 bottom-0 h-[55%] z-[1] bg-gradient-to-t from-brand-dark to-transparent pointer-events-none"
          aria-hidden
        />

        <div className="absolute inset-0 flex flex-col justify-end px-4 pb-12 md:pb-16 z-10">
          <div className="max-w-4xl mx-auto w-full space-y-4 animate-fade-in">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-block rounded-full bg-brand-pink/20 border border-brand-pink/40 px-4 py-1.5 text-sm font-semibold tracking-wider text-brand-pink uppercase">
                Partner
              </span>
              <span className="inline-block rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-sm font-medium text-white/90">
                Mercstand · INCLUSIONS 2
              </span>
            </div>
            <div className="mb-2 rounded-xl bg-black/50 backdrop-blur-sm p-3 md:p-4 inline-block">
              <Image
                src="/images/partners/anormal-wordmark.png"
                alt="ANORMAL Fashion"
                width={280}
                height={72}
                className="h-12 md:h-14 w-auto max-w-[min(100vw-3rem,280px)] object-contain object-left"
              />
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-[0.95] [text-shadow:_2px_4px_16px_rgb(0_0_0_/_80%)]">
              Anormal represents solidarity
            </h1>
            <p className="text-xl md:text-2xl text-white/85 max-w-2xl [text-shadow:_1px_2px_8px_rgb(0_0_0_/_70%)]">
              Eine Marke, die Fashion mit Geschichten verbindet – und genau deshalb
              passt sie zu INCLUSIONS.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-16 md:py-24 space-y-20">
        <section
          className={
            ANORMAL_PARTNER_STATEMENT
              ? "rounded-2xl border border-brand-pink/25 bg-white/5 p-8 md:p-10"
              : "rounded-2xl border-2 border-dashed border-brand-pink/35 bg-gradient-to-br from-brand-pink/[0.07] to-transparent p-8 md:p-10"
          }
          aria-label="Statement ANORMAL Fashion"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-brand-pink/90 mb-3">
            Statement · ANORMAL × INCLUSIONS
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
            Warum ANORMAL Partner von INCLUSIONS ist
          </h2>
          {ANORMAL_PARTNER_STATEMENT ? (
            <div className="space-y-4 text-lg leading-relaxed text-white/85 border-l-2 border-brand-pink/40 pl-6 whitespace-pre-line">
              {ANORMAL_PARTNER_STATEMENT}
            </div>
          ) : (
            <div className="space-y-4 text-lg leading-relaxed text-white/45 italic border-l-2 border-white/20 pl-6">
              <p>
                [Platzhalter — hier erscheint das Statement von ANORMAL Fashion,
                in eigenen Worten, weshalb sie sich als Partnerin von INCLUSIONS
                engagieren und was sie mit der Bewegung verbindet.]
              </p>
              <p className="text-base not-italic text-white/35">
                Text wird ergänzt, sobald ANORMAL das Statement liefert.
              </p>
            </div>
          )}
        </section>

        <section className="space-y-6">
          <p className="text-2xl md:text-3xl font-semibold leading-snug text-white/95">
            Willkommen bei ANORMAL Fashion: Schneiderkunst, echte Biografien und
            die Überzeugung, dass jeder Kauf Solidarität mittragen kann.
          </p>
          <p className="text-lg text-white/70 leading-relaxed">
            Menschen und ihre Geschichten stehen im Mittelpunkt; Innovation und
            Nachhaltigkeit verbinden sich mit Kreativität – und Kleidung trägt
            eine Botschaft.
          </p>
        </section>

        <section className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-brand-pink/20 flex items-center justify-center shrink-0">
              <span className="text-brand-pink text-xl" aria-hidden>
                ✦
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold">
              Die Entstehung – mehr als ein Logo
            </h2>
          </div>

          <div className="rounded-2xl bg-white p-6 md:p-8">
            <Image
              src="/images/partner/anormal-logo-symbole.png"
              alt="ANORMAL Logo: Zwerg, Ameise und Panzer über dem Schriftzug"
              width={1200}
              height={675}
              className="w-full h-auto object-contain max-h-[min(52vh,420px)] mx-auto"
              sizes="(max-width: 896px) 100vw, 864px"
            />
          </div>

          <div className="border-l-2 border-brand-pink/30 pl-8 space-y-4 text-white/75 leading-relaxed">
            <p>
              Ronny und Livia fühlten sich schon früh «anormal» – nicht passend in
              vorgezeichnete Normen. Statt sich klein zu machen, haben sie
              Andersartigkeit als Stärke begriffen und ANORMAL Fashion
              gegründet: eine Marke mit Botschaft, nicht nur mit Kollektion.
            </p>
            <p>
              Ihr Logo erzählt mit:{" "}
              <strong className="text-white/90">Zwerg</strong> (Charme,
              Sturkopf, Nähe zu «Pimpel» – ein liebevoller Spitzname),{" "}
              <strong className="text-white/90">Ameise</strong> (Fleiss, Stärke,
              Gemeinschaft) und{" "}
              <strong className="text-white/90">Panzer</strong> – ein
              provokantes, zutiefst persönliches Symbol für Überleben und
              Schutz, nachdem die Gründerin über Jahre hinweg unvorstellbares
              Leid erfuhr. So polarisierend das Bild auch wirkt: Für sie steht
              es für Kraft, Rückgrat und dafür, dass es möglich ist, schwere
              Zeiten zu überwinden.
            </p>
          </div>
        </section>

        <section className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-brand-pink/20 flex items-center justify-center shrink-0">
              <span className="text-brand-pink text-xl" aria-hidden>
                R
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold">
              Ronny – vom Kampf zum Auftrag
            </h2>
          </div>

          <div className="flex flex-col md:flex-row gap-8 md:gap-10 items-start">
            <div className="relative w-full md:w-[42%] shrink-0 aspect-[3/4] rounded-2xl overflow-hidden bg-black/40">
              <Image
                src="/images/partner/anormal-ronny.png"
                alt="Ronny Thoma"
                fill
                className="object-cover object-[35%_center]"
                sizes="(max-width: 768px) 100vw, 340px"
              />
            </div>
            <div className="border-l-2 border-brand-pink/30 pl-6 md:pl-8 space-y-4 text-white/75 leading-relaxed flex-1 min-w-0">
              <p>
                Ronny Thoma wuchs in einem Umfeld auf, das von Instabilität,
                Sucht und Gewalt geprägt war. Was er erlebte, verschloss er lange
                – bis innere Ketten aus Überlebensmustern ihn ebenso prägten wie
                der spätere Weg durch Sucht, Justiz und aussergewöhnliche
                Lebenswelten.
              </p>
              <p>
                Als Vater – unter anderem eines Kindes mit Trisomie 21 – lernte
                er, was es heisst, wenn Andersartigkeit angestarrt wird. Seine
                Kinder geben ihm Halt; zugleich treibt ihn die Sorge um einen Sohn
                an, den das Leben anders forderte, zu dem Anliegen, jungen
                Menschen zu helfen, die kein festes Fundament finden.
              </p>
              <p>
                Im Mai 2019 landete er nach einer Überdosis im Spital – der
                Moment, in dem er sich entscheiden musste: fürs Leben oder gegen
                es. Im Programm «Sucht hilft Sucht» fand er den Weg in ein
                substanzfreies Leben. Heute teilt er in Einrichtungen seine
                Geschichte, gibt Hoffnung und beschäftigt in seiner Firma
                Menschen in abstinenzwilliger Recovery, ohne sie fallen zu
                lassen.
              </p>
              <p className="text-sm text-white/50">
                Vollständige Lebenslinie:{" "}
                <a
                  href="https://anormal.ch/ronny-thoma-lebenslinie/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-pink/90 hover:underline"
                >
                  Ronny Thoma – Lebenslinie
                </a>
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-brand-pink/20 flex items-center justify-center shrink-0">
              <span className="text-brand-pink text-xl" aria-hidden>
                L
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold">
              Livia – Rebellion, Überleben, Neuanfang
            </h2>
          </div>

          <div className="flex flex-col md:flex-row-reverse gap-8 md:gap-10 items-start">
            <div className="relative w-full md:w-[38%] shrink-0 mx-auto md:mx-0 h-[min(480px,70vh)] max-w-[320px] md:max-w-none rounded-2xl overflow-hidden bg-black/40">
              <Image
                src="/images/partner/anormal-duo-standing.png"
                alt="Livia, Mitgründerin ANORMAL Fashion"
                fill
                className="object-cover scale-[1.32] md:scale-[1.25] [transform-origin:82%_30%]"
                style={{ objectPosition: "82% 28%" }}
                sizes="(max-width: 768px) 320px, 340px"
              />
            </div>
            <div className="border-l-2 border-brand-pink/30 pl-6 md:pl-8 space-y-4 text-white/75 leading-relaxed flex-1 min-w-0">
              <p>
                Livia empfand die Welt als Kind intensiver und sensibler als
                viele um sie herum. Was als lebendige Fantasie begann, stiess in
                der Schule auf Einsamkeit; als Teenagerin geriet sie in eine
                jahrelange, gewaltsame Beziehung, über die sie lange schweigen
                musste – gefangen zwischen Scham, Angst und Dissoziation.
              </p>
              <p>
                Der Weg danach führte über Drogen, Verluste und die Strasse bis zu
                einem Wendepunkt: eine Verhaftung, die sie in eine Langzeittherapie
                brachte und ab 2020 ein cleanes Leben ermöglichte. Dort lernte sie
                neu, sich anzunehmen – und dass zu wenige strukturierte Hilfen
                existieren für alle, die ähnliches durchmachen.
              </p>
              <p className="text-xl text-white/90 font-medium">
                Mit ANORMAL Fashion will sie Menschen mit Behinderung,
                Traumafolgen, Suchterkrankungen und Ausgrenzung eine Stimme geben
                – Mode, auf der Hoffnung sichtbar wird.
              </p>
              <p className="text-sm text-white/50">
                Vollständige Lebenslinie:{" "}
                <a
                  href="https://anormal.ch/ronny-thoma-lebenslinie-copy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-pink/90 hover:underline"
                >
                  Livia – Lebenslinie
                </a>
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-8 rounded-2xl bg-white/5 p-6 md:p-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-brand-pink flex items-center justify-center shrink-0">
              <span className="text-black text-xl" aria-hidden>
                ♥
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold">
              Warum das zu INCLUSIONS passt
            </h2>
          </div>
          <div className="space-y-4 text-white/80 leading-relaxed text-lg">
            <p>
              INCLUSIONS schafft Räume, in denen Menschen auf Augenhöhe feiern –
              sichtbar, laut, respektvoll. ANORMAL erzählt mit Stoff und Design
              Geschichten von Solidarität, Überleben und zweiter Chance.
            </p>
            <p>
              Beide Bewegungen sagen:{" "}
              <strong className="text-white">
                Du musst nicht «normal» sein, um dazuzugehören.
              </strong>{" "}
              Deshalb freuen wir uns, dass ANORMAL Fashion an der INCLUSIONS 2
              am Mercstand präsent ist – Mode, die trägt, was wir auf der
              Tanzfläche leben: Gemeinschaft jenseits von Schubladen.
            </p>
          </div>
        </section>

        <section className="relative py-12">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-pink/10 via-transparent to-brand-pink/5" />
          <blockquote className="relative text-center space-y-6 px-4 md:px-12">
            <svg
              className="w-12 h-12 text-brand-pink/40 mx-auto"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
            <p className="text-2xl md:text-3xl font-semibold leading-snug text-white/95">
              Unsere Philosophie «Anormal Represents Solidarity» ist die
              treibende Kraft hinter allem, was wir tun.
            </p>
            <footer className="text-brand-pink font-semibold text-lg">
              — ANORMAL Fashion
            </footer>
          </blockquote>
        </section>

        <section className="text-center space-y-6 py-8">
          <h2 className="text-2xl md:text-3xl font-bold">
            Mercstand · INCLUSIONS 2
          </h2>
          <p className="text-white/70 max-w-xl mx-auto">
            Komm vorbei, entdecke die Kollektion und die Geschichte hinter der
            Marke – und unterstütze ein Team, das Solidarität sichtbar macht.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://anormal.ch/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-brand-pink px-6 py-3 text-lg font-semibold text-black hover:bg-brand-pink/90 transition-colors"
            >
              anormal.ch
            </a>
            <Link
              href="/events"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-lg font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Event &amp; Tickets
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
