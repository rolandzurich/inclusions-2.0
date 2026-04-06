import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sandro – Botschafter | Inclusions",
  description:
    "Sandro lebt mit generalisierter Muskeldystonie. Seit 2026 ist er stolzer Botschafter und Co-DJ bei Inclusions. Seine Geschichte zeigt: Musik kennt keine Grenzen.",
  openGraph: {
    title: "Sandro – Botschafter | Inclusions",
    description:
      "Sandro lebt mit generalisierter Muskeldystonie und ist stolzer Botschafter und Co-DJ bei Inclusions.",
    images: [
      {
        url: "/images/botschafter/sandro-am-deck.png",
        width: 1200,
        height: 630,
        alt: "Sandro am DJ-Pult",
      },
    ],
  },
};

export default function SandroPage() {
  return (
    <main className="min-h-screen text-white">
      {/* ── Hero ── */}
      <section className="relative w-full h-[85vh] min-h-[600px] overflow-hidden">
        <Image
          src="/images/botschafter/sandro-hero.jpg"
          alt="Sandro am DJ-Pult mit Kopfhörern – voller Leidenschaft an den Decks"
          fill
          className="object-cover object-top"
          quality={95}
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/60 to-transparent" />

        <div className="absolute inset-0 flex flex-col justify-end px-4 pb-12 md:pb-20 z-10">
          <div className="max-w-4xl mx-auto w-full space-y-4 animate-fade-in">
            <span className="inline-block rounded-full bg-brand-pink/20 border border-brand-pink/40 px-4 py-1.5 text-sm font-semibold tracking-wider text-brand-pink uppercase">
              Botschafter
            </span>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.9] [text-shadow:_2px_4px_16px_rgb(0_0_0_/_80%)]">
              Sandro
            </h1>
            <p className="text-xl md:text-2xl text-white/80 max-w-2xl [text-shadow:_1px_2px_8px_rgb(0_0_0_/_70%)]">
              «Ich habe seit langem nach etwas gesucht, bei dem ich für Menschen
              mit Beeinträchtigung etwas bewirken kann – und was mir auch Freude
              bereiten soll.»
            </p>
          </div>
        </div>
      </section>

      {/* ── Story ── */}
      <div className="max-w-4xl mx-auto px-4 py-16 md:py-24 space-y-20">
        {/* Intro */}
        <section className="space-y-6">
          <p className="text-2xl md:text-3xl font-semibold leading-snug text-white/95">
            Sandro ist 35 Jahre alt. Er lebt mit einer seltenen, schweren
            Erkrankung – generalisierte Muskeldystonie. Und er ist Botschafter
            und Co-DJ bei Inclusions.
          </p>
          <p className="text-lg text-white/70 leading-relaxed">
            Grossflächige Verkrampfungen der Skelettmuskeln führen bei ihm zu
            extremen Körperverdrehungen. Vor allem die rechte Seite, Nacken und
            Gesicht sind betroffen – was es für Sandro sehr schwierig macht zu
            sprechen. Seine Geschichte ist eine von unbändigem Willen, Familie
            und Musik.
          </p>
        </section>

        {/* Timeline Childhood */}
        <section className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-brand-pink/20 flex items-center justify-center shrink-0">
              <span className="text-brand-pink text-xl">🧒</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold">
              Kindheit &amp; Diagnose
            </h2>
          </div>
          <div className="border-l-2 border-brand-pink/30 pl-8 space-y-4 text-white/75 leading-relaxed">
            <p>
              Schwangerschaft und Geburt verliefen normal, doch bereits als
              Baby wurden erste Auffälligkeiten festgestellt. Trotzdem besuchte
              Sandro die Regelschule, trieb viel Sport und entwickelte sich
              gut. Die erste Diagnose kam erst mit 10 Jahren – eine Cerebrale
              Lähmung. Als Kind war die Erkrankung dennoch kaum ein Thema –
              die Einschränkungen waren minimal.
            </p>
          </div>
        </section>

        {/* Timeline Youth */}
        <section className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-brand-pink/20 flex items-center justify-center shrink-0">
              <span className="text-brand-pink text-xl">💪</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold">
              Unbändiger Wille
            </h2>
          </div>
          <div className="border-l-2 border-brand-pink/30 pl-8 space-y-4 text-white/75 leading-relaxed">
            <p>
              Im Jugendalter verschlechterte sich die Erkrankung schubweise. Die
              ursprüngliche Diagnose wurde korrigiert: generalisierte
              Muskeldystonie. Trotzdem schloss Sandro die normale Schule ab und
              begann eine Lehre als Logistiker EFZ.
            </p>
            <p>
              Die Lehrzeit kostete enormen Willen und Energie. Aber Sandro zog
              durch – und bestand. Die Ärzte kamen an ihre Grenzen. Sandro
              entschied sich für eine schwere Hirnoperation: Zwei Elektroden
              wurden ins Gehirn eingepflanzt und mit einem Stimulator im Bauch
              verbunden. Der Weg danach war lang und hart – doch die Spastik
              ging enorm zurück.
            </p>
          </div>
        </section>

        {/* Selfie with Reto */}
        <section className="relative rounded-2xl overflow-hidden group">
          <div className="aspect-[16/10] relative">
            <Image
              src="/images/botschafter/sandro-reto-studio.png"
              alt="Sandro und Reto Willi – Im Studio beim DJ-Coaching"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-[10s] ease-out"
              sizes="(max-width: 768px) 100vw, 800px"
            />
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <p className="text-sm text-white/70">
              Sandro und Reto Willi – Im Studio beim DJ-Coaching
            </p>
          </div>
        </section>

        {/* Life Today */}
        <section className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-brand-pink/20 flex items-center justify-center shrink-0">
              <span className="text-brand-pink text-xl">🏠</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold">Heute</h2>
          </div>
          <div className="border-l-2 border-brand-pink/30 pl-8 space-y-4 text-white/75 leading-relaxed">
            <p>
              Sandro lebt und arbeitet in der Stiftung Pigna. Seit kurzem hat er
              die Möglichkeit, wieder im Lager bei der Firma Opo Oeschger zu
              arbeiten. Er hat eine tolle Familie und Freunde, mit denen er seit
              der Schulzeit eng verbunden ist.
            </p>
            <p className="text-xl text-white/90 font-medium">
              2021 wurde Sandro stolzer Papa eines gesunden Sohnes. «Mein Sohn
              ist alles für mich – ich könnte mir kein Leben mehr ohne ihn
              vorstellen.»
            </p>
          </div>
        </section>

        {/* Inclusions */}
        <section className="space-y-8 rounded-2xl bg-white/5 p-6 md:p-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-brand-pink flex items-center justify-center shrink-0">
              <span className="text-black text-xl">🎧</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold">
              Inclusions &amp; die Musik
            </h2>
          </div>
          <div className="space-y-4 text-white/80 leading-relaxed text-lg">
            <p>
              Im September 2025 besuchte Sandro spontan den ersten Day Rave von
              Inclusions. Das Projekt sprach ihn sofort an. Er stellte sich in
              den Vordergrund, ging auf die Bühne – und hinter das DJ-Pult.
            </p>
            <p>
              «Trotz meiner Erkrankung bin ich jemand, der sich gerne ins
              Rampenlicht stellt.»
            </p>
            <p>
              Nach dem Event machte Sandro Werbung auf Instagram. Reto Willi
              wurde auf ihn aufmerksam und lud ihn ins Studio ein. Seit Anfang
              2026 ist Sandro stolzer Botschafter und Co-DJ bei Inclusions.
            </p>
          </div>
        </section>

        {/* Video */}
        <section className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center">
            Sandro im Studio
          </h2>
          <div className="rounded-2xl overflow-hidden bg-black">
            <video
              controls
              playsInline
              preload="metadata"
              poster="/images/botschafter/sandro-am-deck.png"
              className="w-full aspect-video"
            >
              <source
                src="/videos/sandro-dj-studio.mp4"
                type="video/mp4"
              />
            </video>
          </div>
        </section>

        {/* Quote */}
        <section className="relative py-12">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-pink/10 via-transparent to-brand-pink/5" />
          <blockquote className="relative text-center space-y-6 px-4 md:px-12">
            <svg
              className="w-12 h-12 text-brand-pink/40 mx-auto"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
            <p className="text-2xl md:text-3xl font-semibold leading-snug text-white/95">
              Ich bin dem Verein Inclusions sehr dankbar, dass ich ein Teil
              dieser Familie sein darf. Ich bin sehr davon überzeugt, dass wir
              noch wachsen können und noch mehr Projekte realisieren werden.
            </p>
            <footer className="text-brand-pink font-semibold text-lg">
              — Sandro, Botschafter Inclusions
            </footer>
          </blockquote>
        </section>

        {/* DJ Pair with miniArt */}
        <section className="space-y-6 rounded-2xl bg-white/5 p-6 md:p-10">
          <h2 className="text-2xl font-bold">
            DJ Pair: _miniArt°°° &amp; Sandro M
          </h2>
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="w-full md:w-1/3 aspect-square relative rounded-xl overflow-hidden shrink-0">
              <Image
                src="/images/miniart-sandro.png"
                alt="_miniArt°°° & Sandro M – DJ Pair bei Inclusions"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 280px"
              />
            </div>
            <div className="space-y-4">
              <p className="text-white/80 leading-relaxed">
                Reto und Sandro werden an der INCLUSIONS 2 ihre Premiere feiern
                und zum ersten Mal zusammen auflegen. Als DJ Pair verbinden sie
                Erfahrung mit frischer Energie – und beweisen, dass Inklusion
                auf dem Dancefloor beginnt.
              </p>
              <Link
                href="/djs?pair=miniart-sarita"
                className="inline-flex items-center gap-2 rounded-full bg-brand-pink px-5 py-2.5 text-sm font-semibold text-black hover:bg-brand-pink/90 transition-colors"
              >
                <span>DJ Pair buchen</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center space-y-6 py-8">
          <h2 className="text-2xl md:text-3xl font-bold">
            Werde Teil der Bewegung
          </h2>
          <p className="text-white/70 max-w-xl mx-auto">
            Wie Sandro kannst auch du Teil von Inclusions werden – als
            Botschafter, Partner, Unterstützer oder Partygast.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/anmeldung"
              className="inline-flex items-center gap-2 rounded-full bg-brand-pink px-6 py-3 text-lg font-semibold text-black hover:bg-brand-pink/90 transition-colors"
            >
              Mitmachen
            </Link>
            <Link
              href="/events"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-lg font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Nächste Events
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
