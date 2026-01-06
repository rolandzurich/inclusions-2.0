import Link from "next/link";
import Image from "next/image";
import { getUpcomingEvents, getPastEvents, formatDate } from "@/lib/event-utils";
import { getLineupItems, getDJById, getDJPairById } from "@/lib/dj-utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Events & Erlebnisse - Inclusions",
  description: "Kommende Inclusions Events und Rückblicke auf vergangene Veranstaltungen. Inklusives Event am 25. April 2026 im Supermarket Zürich. DJ-Lineup, Dance Crew und mehr.",
  openGraph: {
    title: "Events & Erlebnisse - Inclusions",
    description: "Kommende Inclusions Events und Rückblicke auf vergangene Veranstaltungen. Inklusives Event am 25. April 2026 im Supermarket Zürich.",
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

  return (
    <main className="min-h-screen max-w-6xl px-4 py-12 mx-auto space-y-10 text-white">
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
                {formatDate(nextEvent.date)}{nextEvent.id === "inclusions-2nd-edition" ? ", 13:00 - 21:00" : ""} · {nextEvent.location}
              </p>
              {nextEvent.description && (
                <p className="mt-4 text-white/70">{nextEvent.description}</p>
              )}

              {/* Lineup */}
              {nextEvent.lineup && nextEvent.lineup.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-xl font-semibold mb-3">Lineup</h3>
                  <div className="space-y-2">
                    {getLineupItems(nextEvent.lineup).map((item) => (
                      <div
                        key={item.data.id}
                        className="flex items-center gap-3 p-3 rounded-xl bg-white/5"
                      >
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                          <svg
                            className="w-5 h-5 text-brand-pink"
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
                        <div>
                          <p className="font-semibold">{item.data.name}</p>
                          {item.type === "pair" && (
                            <p className="text-xs text-white/60">DJ Pair</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Link
                href="/anmeldung"
                className="mt-6 inline-flex rounded-full bg-brand-pink px-6 py-3 text-lg font-semibold text-brand-dark"
              >
                Infos erhalten
              </Link>
            </div>
            <div className="w-full mt-6 md:mt-0 aspect-square">
              <iframe
                src="https://drive.google.com/file/d/1WyW2nXsGczJIpQ5_K9xScMPl3nxLAuys/preview"
                className="w-full h-full min-h-[260px] rounded-2xl"
                allow="autoplay"
                allowFullScreen
                title="Inclusions 2. Edition - Promo-Video"
                loading="lazy"
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
                    <p className="text-sm font-medium mb-2">Lineup:</p>
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
                {event.lineup && event.lineup.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Lineup:</p>
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
    </main>
  );
}

