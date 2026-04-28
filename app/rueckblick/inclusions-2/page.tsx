import Link from "next/link";
import type { Metadata } from "next";

type ResponsiveImageProps = {
  id: string;
  alt: string;
  priority?: boolean;
  className?: string;
  imgClassName?: string;
  rounded?: boolean;
};

function ResponsiveImage({ id, alt, priority, className, imgClassName, rounded = true }: ResponsiveImageProps) {
  const base = `/rueckblick-inclusions2/optimized/${id}`;
  const sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 900px, 1100px";

  return (
    <picture className={className}>
      <source
        type="image/webp"
        srcSet={`${base}-800.webp 800w, ${base}-1600.webp 1600w, ${base}-2400.webp 2400w`}
        sizes={sizes}
      />
      <img
        src={`${base}-1600.jpg`}
        srcSet={`${base}-800.jpg 800w, ${base}-1600.jpg 1600w, ${base}-2400.jpg 2400w`}
        sizes={sizes}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        className={[
          "w-full h-full object-cover",
          rounded ? "rounded-2xl" : "",
          "bg-white/5",
          imgClassName || "",
        ].join(" ")}
      />
    </picture>
  );
}

function Section({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="max-w-3xl mx-auto px-4 md:px-0 space-y-5">
      {eyebrow ? <p className="text-xs uppercase tracking-[0.35em] text-brand-pink">{eyebrow}</p> : null}
      {title ? <h2 className="text-2xl md:text-3xl font-semibold text-white leading-tight">{title}</h2> : null}
      <div className="text-white/85 text-lg leading-relaxed space-y-4">{children}</div>
    </section>
  );
}

function ImageBreak({
  id,
  alt,
  caption,
  imgClassName,
}: {
  id: string;
  alt: string;
  caption?: string;
  imgClassName?: string;
}) {
  return (
    <section className="max-w-5xl mx-auto px-4 md:px-0">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5">
        <div className="aspect-[16/10] md:aspect-[21/10]">
          <ResponsiveImage
            id={id}
            alt={alt}
            className="h-full w-full"
            imgClassName={imgClassName}
            rounded={false}
          />
        </div>
        {caption ? (
          <div className="px-5 py-4 md:px-6 border-t border-white/10 bg-black/20">
            <p className="text-sm text-white/75">{caption}</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function Gallery({
  items,
  columns = 3,
}: {
  items: Array<{ id: string; alt: string }>;
  columns?: 2 | 3;
}) {
  const grid =
    columns === 2 ? "grid gap-4 md:grid-cols-2" : "grid gap-4 md:grid-cols-2 lg:grid-cols-3";

  return (
    <section className="max-w-6xl mx-auto px-4 md:px-0">
      <div className={grid}>
        {items.map((it) => (
          <div key={it.id} className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            <div className="aspect-[4/3]">
              <ResponsiveImage id={it.id} alt={it.alt} className="h-full w-full" rounded={false} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export const metadata: Metadata = {
  title: "Wenn der Verstand ins Herzen rückt – persönlicher Rückblick",
  description:
    "Mein persönlicher Rückblick auf INCLUSIONS 2 – roh und ungefiltert. Ein Tag voller Begegnungen, Musik, Gänsehaut und Menschlichkeit.",
  openGraph: {
    title: "Wenn der Verstand ins Herzen rückt – INCLUSIONS 2",
    description:
      "Mein persönlicher Rückblick auf INCLUSIONS 2 – roh und ungefiltert. Pure Magie, echte Begegnungen und ein Dancefloor für alle.",
    images: [
      {
        url: "/rueckblick-inclusions2/optimized/verstand-herz-1600.jpg",
        width: 1600,
        height: 900,
        alt: "Wenn der Verstand ins Herzen rückt – INCLUSIONS 2",
      },
    ],
  },
};

export default function RueckblickInclusions2Page() {
  return (
    <main className="min-h-screen text-white">
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-10 pb-10 md:pt-14 md:pb-14">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5">
          <div className="relative h-[520px] md:h-[650px]">
            <div className="absolute inset-0">
              <ResponsiveImage
                id="verstand-herz"
                alt="Wenn der Verstand ins Herzen rückt – INCLUSIONS 2"
                priority
                className="h-full w-full"
                rounded={false}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/35 to-black/75" />
            <div className="absolute inset-0 flex items-end">
              <div className="w-full p-6 md:p-10 space-y-4">
                <p className="text-xs uppercase tracking-[0.35em] text-brand-pink">Rückblick</p>
                <h1 className="text-4xl md:text-6xl font-bold leading-tight [text-shadow:_0_2px_18px_rgb(0_0_0_/_55%)]">
                  Wenn der Verstand ins Herzen rückt
                </h1>
                <p className="text-lg md:text-2xl text-white/90 max-w-3xl [text-shadow:_0_2px_18px_rgb(0_0_0_/_55%)]">
                  Meine persönlichen Gedanken… roh und ungefiltert. <span className="text-white/80">— Roland</span>
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Link
                    href="/"
                    className="inline-flex items-center justify-center rounded-full border border-white/25 bg-black/25 backdrop-blur px-5 py-2 text-sm text-white/90 hover:bg-black/35 transition-colors"
                  >
                    Zur Startseite
                  </Link>
                  <Link
                    href="/rueckblick"
                    className="inline-flex items-center justify-center rounded-full border border-brand-pink/50 bg-brand-pink/15 backdrop-blur px-5 py-2 text-sm text-brand-pink hover:bg-brand-pink/20 transition-colors"
                  >
                    Mehr Rückblick
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Intro */}
      <Section>
        <p className="text-xl md:text-2xl text-white leading-relaxed">
          Menschen sind gut. Was gestern an der INCLUSIONS 2 passiert ist, kann nicht in Worte gefasst werden.
          Vermutlich kommt “pure Magie” dem noch am nächsten.
        </p>
        <p>
          Was passiert, wenn Menschen ihre Maske ablegen und einfach zu fühlen beginnen.
        </p>
      </Section>

      <div className="h-12" />

      <Section eyebrow="Morgen" title="5 Uhr – Unruhe & Vorfreude">
        <p>
          Ich öffne meinen Laptop und es sind nochmals 20 VIP-Anmeldungen reingekommen. Eine Mail in meiner Inbox
          eines Betreuers, der auch noch eine Gruppe von 10 beeinträchtigten Menschen kommen wird. Haben wir genügend
          VIP-Bändeli, wird mein neues Tool am Eingang funktionieren? Ein Gefühl von Unruhe und Vorfreude.
        </p>
      </Section>

      <div className="h-10" />

      <Section eyebrow="Eintreffen vom Team" title="11.45 – Supermarket, Sonne, Team">
        <p>
          Um 11.45 vor dem Supermarket. Ich bin als erster dort. Die Sonne scheint, das Team trifft langsam ein.
          Auch Ronny von anormal trifft ein. “Ich bin ein bisschen nervös, wir haben schon lange keinen Stand mehr an
          einem Event gehabt und die letzten Erfahrungen waren nicht sehr positiv gewesen.”
        </p>
        <p>
          Nach 12 Uhr starten wir mit den Vorbereitungen. Alle wissen, was zu machen ist. Reto hat den Event-Rider,
          mit allen relevanten Infos fürs Team, die letzten zwei Wochen dutzende Male aktualisiert und nochmals mit
          allen Beteiligten in der Woche gesprochen.
        </p>
        <p>
          Um 13.02 haben wir die Türen geöffnet. Booking-System bockt. VIPs können nicht eingecheckt werden… Scheisse.
          Über das öffentliche WLAN vom Supermarket funktioniert mein neu gebautes Tool nicht. Ich schalte auf einen
          Hotspot mit einem Handy und es klappt.
        </p>
      </Section>

      <div className="h-10" />

      <ImageBreak
        id="ersten-gaste"
        alt="Die ersten Gäste kommen rein – strahlende Gesichter und Umarmungen"
        caption="Die ersten Gäste. Strahlende Gesichter. Die ersten Umarmungen."
      />

      <div className="h-12" />

      <Section eyebrow="Gänsehaut" title="Ashan – der erste Moment">
        <p>
          Ashan eröffnet mit seinem Live Set die INCLUSIONS 2. Der erste Gänsehautmoment. Ashan sagte mir vorher noch,
          dass er nervös ist. Unbegründet! Er hat geliefert.
        </p>
        <p>
          Die ersten Gäste kommen rein. Strahlende Gesichter, die ersten freudigen Umarmungen. Ich lasse mir meine Nägel
          von Trina und Ape an Trinas Nagelbar bunt lackieren.
        </p>
        <p>
          Am Eingang sehe ich eine grosse, junge Frau, in einem coolen, bunten Raver-Outfit mit Maske. Kurz danach ist
          sie bereits mit anderen Gästen auf dem Dancefloor.
        </p>
      </Section>

      <div className="h-10" />

      <Gallery
        columns={3}
        items={[
          { id: "ashan", alt: "Ashan live – INCLUSIONS 2" },
          { id: "trina", alt: "Trina – bunte Nägel an der Nagelbar" },
          { id: "pure-magie", alt: "Pure Magie – INCLUSIONS 2" },
        ]}
      />

      <div className="h-12" />

      <Section eyebrow="Day-Rave Momente" title="Dancefloor – alle zusammen">
        <p>
          Um ca. 2 Uhr bildet sich vor dem VIP-Eingang eine Kolonne bis zur Strasse. Der Supermarket füllt sich
          langsam. Mehr strahlende Gesichter, mehr herzliche Umarmungen.
        </p>
        <p>
          Mittlerweile legen Reto (_miniart°°°) &amp; SandroM auf. Ihr Sound ist treibend. Sie harmonieren – das spüren
          alle auf dem Dance Floor. VIPs, Betreuer, Rollstühle und andere Gäste sind gemeinsam am Tanzen.
        </p>
      </Section>

      <div className="h-10" />

      <Gallery
        columns={2}
        items={[
          { id: "reto-sandro", alt: "Reto & SandroM an den Decks" },
          { id: "dancefloor-magie", alt: "Dancefloor Magie – INCLUSIONS 2" },
        ]}
      />

      <div className="h-12" />

      <Section eyebrow="Schöne Momente" title="Hotdogs, Styling, bunte Nägel">
        <p>
          Der Foodstand von der RGZ ist ready for Business. American Hotdogs. Immer mehr Gäste erhalten bunte Nägel.
          Einfach schön. Der Stylist für die Dance Crew, Mateo, trifft ein. Unsere Tänzer und Tänzerinnen werden dieses
          Mal von Profis gestylt. Einfach wunderbar.
        </p>
      </Section>

      <div className="h-10" />

      <Gallery
        columns={3}
        items={[
          { id: "hotdog", alt: "Hotdog – RGZ Foodstand" },
          { id: "rgz", alt: "RGZ – Foodstand ready" },
          { id: "bunte-nagel", alt: "Bunte Nägel – kleine Freude" },
        ]}
      />

      <div className="h-12" />

      <Section eyebrow="15 Uhr" title="Samy Jackson & Jimmychanga – unreal">
        <p>
          15.00 – Samy Jackson &amp; Jimmychanga sind am spielen. Unreal!!! Samy hat vor wenigen Wochen noch in Bangkok
          und Kuala Lumpur aufgelegt. Jimmy aus Weinfelden kontaktierte irgendwann mal Reto, dass er DJ ist und bei
          INCLUSIONS mitmachen möchte. Reto und die andern INCLUSIONS DJ’s haben ihn die letzten Monate gecoacht.
          Gänsehaut und magisch!
        </p>
      </Section>

      <div className="h-10" />

      <ImageBreak id="samy-jimmy-mp" alt="Samy Jackson & Jimmychanga – INCLUSIONS 2" />

      <div className="h-12" />

      <Section eyebrow="Backstage" title="Vorbereitung, Outfits, Energie">
        <p>
          15.30 – Im Backstage Bereich laufen die Vorbereitungen für die Dance Show. Colette ist mit den Outfits
          beschäftigt. Raphael, ein Tänzer, sagt mir, dass er in der Zeitschrift BUNTE erscheinen möchte. Er will
          berühmt werden. Die Stimmung ist elektrisch. Marc ist gerade die Haare von Sabina am stylen. Mit Chico vom
          Supermarket Team besprechen wir noch das Licht Setup für die Dance Show.
        </p>
      </Section>

      <div className="h-10" />

      <Gallery
        columns={3}
        items={[
          { id: "backstage-1-mp", alt: "Backstage – Vorbereitung 1" },
          { id: "backstage-2-mp", alt: "Backstage – Vorbereitung 2" },
          { id: "backstage-3", alt: "Backstage – Vorbereitung 3" },
        ]}
      />

      <div className="h-12" />

      <Section eyebrow="14.30" title="Die Dance Crew trifft ein – Planänderung">
        <p>
          14.30 – Die ersten Tänzer und Tänzerinnen treffen ein. Wir hatten eigentlich vereinbart, dass wir sie um 3
          Uhr vor dem Eingang abholen. So habe ich auch entsprechend Sarah, unseren neue Dance Crew Host, gebrieft.
          Sie kennt die Crew noch nicht. Egal, Planänderung. Wir schicken sie direkt zum Backstage-Bereich.
        </p>
        <p>
          Mittlerweile ist auch Mi angekommen. Sie ist eine professionelle Tänzerin und wird die Dance Crew
          unterstützen. Auch Marc Menden von Mad Styling ist hier. Mit ihm habe ich diese Woche noch am Telefon
          gesprochen. Einfach wunderbar, dass er Teil der INCLUSIONS-Family ist und der Dance Crew einen weiteren
          professionellen Touch geben wird.
        </p>
      </Section>

      <div className="h-10" />

      <ImageBreak id="eingang" alt="Eingang – Ankommen, Planänderung, Flow" />

      <div className="h-12" />

      <Section eyebrow="Connection" title="Neo – ein Moment für mich">
        <p>
          16.00 – Neo, mein Sohn, kommt auch. Er war noch nie in einem Club. Ich erzählte ihm immer wieder, dass der
          Sound der INCLUSIONS nicht einfach irgendein Techno ist, sondern eben feinster Techno. Ein sehr berührender
          Moment für mich, dass ich mit Neo dieses Erlebnis teilen konnte.
        </p>
      </Section>

      <div className="h-10" />

      <ImageBreak
        id="neo"
        alt="Neo – zum ersten Mal im Club"
        imgClassName="object-[50%_15%]"
      />

      <div className="h-12" />

      <Section eyebrow="16.30" title="Sandro – ohne ihn geht’s nicht">
        <p>
          16.30 – Sandro, der Besitzer vom Supermarket kommt. Ohne Sandro wäre INCLUSIONS nicht möglich geworden.
          Sandro hat uns seinen Club zur Verfügung gestellt. Gänsehaut! Wir unterhalten uns über Vibe Coding. Wie ich,
          baut er gerade im Hintergrund seine Prozesse, Webseite, Ticketing, etc. um, damit er mehr Zeit hat, um
          menschliche Beziehungen zu pflegen.
        </p>
      </Section>

      <div className="h-12" />

      <Section eyebrow="Team" title="Hafner – Care Team, keine Vorfälle">
        <p>
          17.00 – Kurzer Austausch mit Markus Hafner. Markus koordiniert das Care Team. Keine Vorfälle, alle Gäste
          haben einfach Spass.
        </p>
        <p>Mittlerweile ist der Club voll. Ich sehe nur glückliche Menschen. Magisch!</p>
      </Section>

      <div className="h-10" />

      <Gallery
        columns={3}
        items={[
          { id: "hafner", alt: "Markus Hafner – Care Team" },
          { id: "gluck1", alt: "Glücklicher Moment 1" },
          { id: "gluck2", alt: "Glücklicher Moment 2" },
        ]}
      />

      <div className="h-4" />

      <section className="max-w-6xl mx-auto px-4 md:px-0">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2 relative overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            <div className="aspect-[16/10]">
              <ResponsiveImage id="gluck3" alt="Glücklicher Moment 3" className="h-full w-full" rounded={false} />
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-brand-pink/15 to-white/5 p-6 flex items-center">
            <p className="text-white/90 text-lg leading-relaxed">
              “Es ist so schön hier.”
              <br />
              <span className="text-white/70 text-base">Dieser Satz kam immer wieder — und jedes Mal Gänsehaut.</span>
            </p>
          </div>
        </div>
      </section>

      <div className="h-12" />

      <Section eyebrow="Dokfilm" title="Christian – fast unbemerkt">
        <p>
          Ich beobachte den Dokfilmer Christian Guggenbühl von Hitschfilm. Er bewegt sich mit seiner Kamera fast
          unbemerkt durch den Club. Magisch!
        </p>
      </Section>

      <div className="h-10" />

      <ImageBreak id="hitsch" alt="Hitschfilm – Christian Guggenbühl filmt INCLUSIONS 2" />

      <div className="h-12" />

      <Section eyebrow="17.30" title="Dance Show – Tränen in den Augen">
        <p>
          Zum neu produzierten Remix von Samy Jackson von Voyage, Voyage startet die Show. Gänsehaut und Tränen in den
          Augen. Die Energie der Dance Crew ist… mir fehlen die Worte. Das muss man mal erleben.
        </p>
      </Section>

      <div className="h-10" />

      <Gallery
        columns={2}
        items={[
          { id: "dance-1", alt: "Dance Show – Moment 1" },
          { id: "dance-2", alt: "Dance Show – Moment 2" },
        ]}
      />

      <div className="h-12" />

      <Section eyebrow="Begegnungen" title="Neil, Umarmungen, Menschlichkeit">
        <p>
          Ich unterhalte mich mit einem walisischen Freund von Marc (Neil). Er hatte keine Ahnung, was INCLUSIONS ist.
          Mit wässrigen Augen sagt er mir, wie einmalig schön es hier ist. Alle Leute haben eine gute Zeit und man
          spürt die Freude. Wir brauchen mehr davon.
        </p>
        <p>
          Dauernd werde ich von Gästen begrüsst, umarmt und höre immer wieder “Es ist so schön hier.” Gänsehaut.
        </p>
      </Section>

      <div className="h-10" />

      <ImageBreak id="schon" alt="So schön hier – ein Moment" />

      <div className="h-12" />

      <Section eyebrow="Echt" title="Ein Mädchen will mittanzen">
        <p>
          Ein 10-jähriges Mädchen mit Trisomie 21 ist tanzend vor dem Eingang mit ihrer Mutter. Sie möchte auch kommen
          und mittanzen. Einlass ist eigentlich erst am 20-ig. Als ich ihr gesagt habe, dass sie reinkommen darf,
          leuchteten ihre Augen noch mehr.
        </p>
        <p>
          Später war sie dann aber doch wieder vor dem Ausgang und ass einen Hotdog. Zusammen mit Susanne vom
          Supermarket Team haben wir das Mädchen beobachtet und hatten beide Tränen in den Augen.
        </p>
        <p className="text-white/80">
          Der Security am Eingang sagt mir: <span className="text-white">“Es macht wirklich Spass heute zu arbeiten. Wir brauchen mehr solche Events.”</span>
        </p>
      </Section>

      <div className="h-12" />

      <Section eyebrow="Abend" title="Hoibaer & Jerry – der Dancefloor kocht">
        <p>
          Mittlerweile sind Hoibaer &amp; Jerry an den Decks. Jerry ist ein Zappelpeter und kann eigentlich keine drei
          Sekunden stillstehen. Hoibaer hat es aber geschafft, dass sie 90 Minuten zusammen an den Decks fokussiert
          auflegen. Sie liefern! Der Dancefloor kocht!
        </p>
      </Section>

      <div className="h-10" />

      <ImageBreak id="hoibaer-jerry" alt="Hoibaer & Jerry – INCLUSIONS 2" />

      <div className="h-12" />

      <Section eyebrow="Später" title="Anormal, SRF, Zagara, Coco & Timo">
        <p>
          Ich bin bei Ronny und Livia beim anormal Merch Stand. Auch sie strahlen und geniessen die Atmosphäre. Ronny
          meinte, lass uns vor den Club gehen für ein Interview.
        </p>
        <p>
          Ronny filmt, ein Mitarbeiter von ihm führt das Interview mit mir. Er macht einen super Job und stellt mir
          tolle Fragen. Ein Naturtalent.
        </p>
        <p>Reto sagt mir, dass Leute vom SRF hier sind und uns nächste Woche kontaktieren werden. WOW!</p>
        <p>
          Zagara trifft ein. Sie kommt direkt aus ihren Ferien. Die vollen Koffer stehen noch zu Hause. Zusammen mit
          Sarita geht es mit ihnen - nach Hoibaer &amp; Jerry - weiter. Wir haben heute vier DJ-Pairs am spielen.
          Einfach wunderbar das so zu erleben. Ich habe einige DJ Coachings im Studio von Reto miterlebt und nun diese
          Menschen mit Beeinträchtigung zusammen mit diesen renommierten DJs an den Decks zu sehen. Magisch!
        </p>
        <p>
          Immer wieder werde ich angesprochen. “So schön, was ihr hier macht.” Immer wieder herzliche Umarmungen, kurze
          berührende Gespräche. Mein Herz ist erfüllt.
        </p>
        <p>
          Zum Abschluss spielt Coco B2B mit Andreas K. Andreas K ist im andern Leben Timo, Küchenchef der RGZ und hat
          den Foodstand organisiert. Nun ist er zusammen mit Coco an den Decks. Einfach wunderbar.
        </p>
      </Section>

      <div className="h-10" />

      <Gallery
        columns={3}
        items={[
          { id: "anormal", alt: "Anormal – Merch & Atmosphäre" },
          { id: "zagara", alt: "Zagara – direkt aus den Ferien" },
          { id: "coco-timo", alt: "Coco B2B Andreas K (Timo) – Closing Vibes" },
        ]}
      />

      <div className="h-12" />

      <Section eyebrow="Natürlich" title="Rollstuhl am Beat">
        <p>
          Meine Beine sind müde, aber ich bin auf dem Dancefloor. Der Beat zwingt mich zum Tanzen. Neben mir ist ein
          Mädchen im Rollstuhl. Sie fährt zum Beat hin und her, um sie herum tanzenden Menschen. Es fühlt sich
          natürlich an. Gänsehaut.
        </p>
      </Section>

      <div className="h-10" />

      <ImageBreak id="rollstuhl" alt="Rollstuhl am Beat – es fühlt sich natürlich an" />

      <div className="h-12" />

      <Section eyebrow="Finale" title="Zugabe, Aufräumen, Markthalle">
        <p>
          9 Uhr – Es wird noch eine Zugabe gefordert und Timo spielt noch einen letzten Song. Alle, ich meine wirklich
          alle, sind am tanzen und geniessen noch diesen letzten Moment der INCLUSIONS 2.
        </p>
        <p>Dann geht die Musik aus. Wir räumen auf. Alle packen an.</p>
        <p>
          Anschliessend sitzen wir, knapp 20 Leute vom Team, in der Markthalle und essen gemeinsam. Erste Reflektionen.
          Wir sind alle erschöpft, aber zufrieden und glücklich.
        </p>
        <p>
          Ich schaue mir das Bild an, das Reto als Überraschung von Sandro erhalten hat. Es war ein wunderschöner
          Moment während unseres kurzen Speechs. Markus von insieme, ergreift noch kurz das Wort: Was wir hier
          geschaffen haben, ist einmalig und bedankt sich bei uns.
        </p>
        <p>
          Während wir am Essen sind, sendet uns Andrej schon ein erstes, kurzes INCLUSIONS 2 Video. Andrej, unser
          Content und PR Mann, war die ganze Zeit mit seiner Kamera vor Ort und hat viele INCLUSIONS 2 Momente
          verewigt. Ein weiterer toller Mensch, der INCLUSIONS möglich macht.
        </p>
      </Section>

      <div className="h-10" />

      <ImageBreak id="markthalle" alt="Markthalle – Team, Essen, erste Reflektionen" />

      <div className="h-12" />

      <Section eyebrow="Heimweg" title="Tränen in den Augen">
        <p>Um 23 Uhr verabschieden wir uns und machen uns auf den Heimweg…</p>
        <p>
          Ich sitze an der Haltestelle und warte auf meinen Bus. Tränen in den Augen. Ich bin überwältigt von meinen
          Emotionen. Was wir geschaffen haben, ist viel mehr als ein Day-Rave. Es ist erst der Anfang und zeigt mir:
          Menschen sind gut.
        </p>
        <p>
          An meinen Brother von another Mother Reto: Du hast uns am 5. April 2024 eine Mail mit dem Betreff “Insieme
          &amp; Techno - Inklusion” gesendet. Das war der Moment, als INCLUSIONS geboren wurde. Wir haben beide deine
          Vision in unserem Herzen gespürt und schau, was wir geschaffen haben! Magisch.
        </p>
      </Section>

      <div className="h-14" />

      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Danke.</h2>
            <p className="text-white/80">
              Wenn du willst: teile diese Seite — und lass uns weiter Räume bauen, in denen Menschen einfach Menschen sein dürfen.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/events"
              className="inline-flex items-center justify-center rounded-full bg-brand-pink px-6 py-3 text-black font-semibold hover:bg-brand-pink/90 transition-colors"
            >
              Nächster Event
            </Link>
            <Link
              href="/rueckblick"
              className="inline-flex items-center justify-center rounded-full border border-brand-pink px-6 py-3 text-brand-pink font-semibold hover:bg-brand-pink hover:text-black transition-colors"
            >
              Mehr Rückblick
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

