import Image from "next/image";
import { getUpcomingEvents, getPastEvents, formatDate } from "@/lib/event-utils";
import { getLineupItems, getLineupPairDisplayName } from "@/lib/dj-utils";
import { getEventSchema, getBreadcrumbSchema, getBaseUrl } from "@/lib/geo-schema";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Events & Erlebnisse - Inclusions",
  description: "Kommende INCLUSIONS Events und Rückblicke auf vergangene Veranstaltungen. Nächstes Event: INCLUSIONS 3 am 3. Oktober 2026 im Supermarket Zürich. Line-up folgt.",
  openGraph: {
    title: "Events & Erlebnisse - Inclusions",
    description: "Kommende Inclusions Events und Rückblicke auf vergangene Veranstaltungen. Nächstes Event: INCLUSIONS 3 am 3. Oktober 2026 im Supermarket Zürich.",
    images: [
      {
        url: "/images/1-edition-moment.png",
        width: 1200,
        height: 630,
        alt: "Inclusions 1. Edition - Moment der Begegnung im Supermarket Zürich",
      },
    ],
  },
};

export default function EventsPage() {
  const upcomingEvents = getUpcomingEvents();
  const pastEvents = getPastEvents();
  const nextEvent = upcomingEvents[0];
  const baseUrl = getBaseUrl();

  const jsonLdEvents = upcomingEvents.slice(0, 3).map((e) =>
    getEventSchema({
      id: e.id,
      name: e.name,
      description: e.description || `Inclusions Event im Supermarket Zürich. ${e.name}.`,
      startDate: `${e.date}T13:00:00+02:00`,
      endDate: `${e.date}T21:00:00+02:00`,
      location: e.location,
      offers: undefined,
    })
  );

  const jsonLdBreadcrumb = getBreadcrumbSchema([
    { name: "INCLUSIONS", url: "/" },
    { name: "Events", url: "/events" },
  ]);

  return (
    <main className="min-h-screen max-w-6xl px-4 py-12 mx-auto space-y-10 text-white">
      {jsonLdEvents.map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }} />
      <section>
        <h1 className="text-4xl font-bold">Events &amp; Erlebnisse</h1>
        <p className="mt-3 text-lg text-white/70">
          Hier findest du die kommenden Termine und Rückblicke auf unsere gemeinsamen Momente.
        </p>
      </section>

      {/* Nächster Event */}
      {nextEvent && (
        <section className="rounded-3xl bg-white/10 p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-brand-pink">Nächster Event</p>
              <h2 className="mt-2 text-3xl font-semibold">{nextEvent.name}</h2>
              <p className="mt-2 text-lg">
                {formatDate(nextEvent.date)}, 13:00 - 21:00 · {nextEvent.location}
              </p>
              {nextEvent.description && (
                <p className="mt-4 text-white/70">{nextEvent.description}</p>
              )}

              {/* Line-up */}
              <div className="mt-6">
                <h3 className="text-xl font-semibold mb-3">Line-up</h3>
                {nextEvent.lineup && nextEvent.lineup.length > 0 ? (
                  <div className="space-y-2">
                    {getLineupItems(nextEvent.lineup).map((item) => {
                      if (item.type === "dj") {
                        const name = item.data.name;
                        return (
                          <div key={item.data.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                              <svg className="w-5 h-5 text-brand-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                              </svg>
                            </div>
                            <div>
                              <p className="font-semibold">{name}</p>
                            </div>
                          </div>
                        );
                      }

                      const display = getLineupPairDisplayName(item.data.id) || item.data.name;
                      return (
                        <div key={item.data.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-brand-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-semibold">{display}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-2xl bg-white/5 p-4 border border-white/10 text-white/80">
                    Details folgen – das Line-up veröffentlichen wir später.
                  </div>
                )}
              </div>

              <div className="mt-6 rounded-2xl bg-white/5 p-4 border border-white/10 text-white/80">
                Details zu Tickets und weiteren Infos folgen.
              </div>
            </div>
            <div className="w-full mt-6 md:mt-0 aspect-[3/4] relative rounded-2xl overflow-hidden">
              <Image
                src="/rueckblick-inclusions2/optimized/dancefloor-magie-1600.jpg"
                alt="INCLUSIONS 2 – Magie auf dem Dancefloor"
                fill
                className="object-cover"
                loading="lazy"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </section>
      )}

      {/* Weitere kommende Events */}
      {upcomingEvents.length > 1 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Weitere Events</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {upcomingEvents.slice(1).map((event) => (
              <article key={event.id} className="rounded-2xl bg-white/5 p-5">
                <p className="text-sm uppercase tracking-[0.3em] text-brand-pink">
                  {event.name.includes("Edition") && event.name.match(/\d+\./)?.[0] ? event.name.match(/\d+\./)?.[0] + " Edition" : "Inclusions Event"}
                </p>
                <h3 className="mt-2 text-xl font-semibold">{event.name}</h3>
                <p className="mt-2 text-lg">
                  {formatDate(event.date)}{event.id === "inclusions-2nd-edition" ? ", 13:00 - 21:00" : ""} · {event.location}
                </p>
                {event.description && (
                  <p className="mt-2 text-white/70">{event.description}</p>
                )}
                {event.lineup && event.lineup.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Line-up:</p>
                    <div className="flex flex-wrap gap-2">
                      {getLineupItems(event.lineup).map((item) => (
                        <span
                          key={item.data.id}
                          className="text-xs px-2 py-1 rounded-full bg-white/10"
                        >
                          {item.data.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Vergangene Events */}
      {pastEvents.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Vergangene Events</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {pastEvents.map((event) => (
              <article key={event.id} className="rounded-2xl bg-white/5 p-5">
                <p className="text-sm uppercase tracking-[0.3em] text-brand-pink">
                  {event.name.includes("Edition") && event.name.match(/\d+\./)?.[0] ? event.name.match(/\d+\./)?.[0] + " Edition" : "Inclusions Event"}
                </p>
                <h3 className="mt-2 text-xl font-semibold">{event.name}</h3>
                <p className="mt-2 text-white/70">
                  {formatDate(event.date)} · {event.location}
                </p>
                {event.description && (
                  <p className="mt-2 text-white/70">{event.description}</p>
                )}
                {event.id === "inclusions-2nd-edition" && (
                  <div className="mt-4 space-y-3">
                    <div className="relative h-64 rounded-xl overflow-hidden">
                      <Image
                        src="/rueckblick-inclusions2/optimized/verstand-herz-1600.jpg"
                        alt="INCLUSIONS 2 – Wenn der Verstand ins Herzen rückt"
                        fill
                        className="object-cover"
                        loading="lazy"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        style={{ filter: "brightness(0.6) contrast(1.1) saturate(1.05)" }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">Line-up:</p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          "Samy Jackson & Jimmytschanga",
                          "Zagara & Sarita Duracel",
                          "_miniArt°°° & SandroM",
                          "Hoibaer & Jerry",
                          "Coco.bewegt B2B Andreas K",
                          "Ashan (live)",
                        ].map((name) => (
                          <span key={name} className="text-xs px-2 py-1 rounded-full bg-white/10">
                            {name}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">Highlights:</p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          "INCLUSIONS Dance Crew Show",
                          "Trina’s Gwunder Bar",
                          "Barrierefrei & Care Team",
                          "Foodstand",
                        ].map((h) => (
                          <span key={h} className="text-xs px-2 py-1 rounded-full bg-brand-pink/15 border border-brand-pink/30 text-white/90">
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {event.id === "inclusions-1st-edition" && (
                  <div className="mt-4 relative h-64 rounded-xl overflow-hidden group">
                    <Image
                      src="/images/1-edition-moment.png"
                      alt="Inclusions 1. Edition - Moment der Begegnung im Supermarket Zürich mit über 400 Menschen mit und ohne Beeinträchtigung"
                      fill
                      className="object-cover"
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      style={{
                        filter: "brightness(0.35) contrast(1.3) saturate(0.85)",
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-purple-900/20 via-transparent to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/50" />
                  </div>
                )}
                {/* Line-up wird aktuell nur für INCLUSIONS 2 explizit aufgeführt (siehe oben). */}
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

