import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community & Mitmachen - Inclusions",
  description: "Inclusions lebt von dir. Werde Community Member, unterstütze als Institution, Volunteer, DJ oder kreativer Mensch. Tanzen, helfen, gemeinsam Events erleben.",
  openGraph: {
    title: "Community & Mitmachen - Inclusions",
    description: "Inclusions lebt von dir. Werde Community Member, Volunteer oder unterstütze uns.",
    images: [{ url: "/images/hero.jpg", width: 1200, height: 630, alt: "Inclusions Community" }],
  },
};

const cards = [
  { title: "Community Member", text: "Tanze mit uns mit – ganz ohne Anmeldung oder Hürden." },
  { title: "Institution", text: "Du betreust Gruppen? Lass uns Events gemeinsam planen." },
  { title: "Unterstützen", text: "Du kannst Programm oder Infrastruktur beisteuern? Melde dich." },
  { title: "Helfen", text: "Wir freuen uns über Volunteers, DJs und kreative Menschen." }
];

export default function CommunityPage() {
  return (
    <main className="min-h-screen max-w-6xl px-4 py-12 mx-auto space-y-10 text-white">
      <section>
        <h1 className="text-4xl font-bold">Community &amp; Mitmachen</h1>
        <p className="mt-3 text-lg text-white/70">
          Inclusions lebt von dir. Egal, ob du tanzen, unterstützen oder einfach dabei sein möchtest –
          komm in die Community.
        </p>
      </section>
      <section className="grid gap-6 md:grid-cols-2">
        {cards.map((card) => (
          <article key={card.title} className="rounded-2xl bg-white/5 p-6">
            <h2 className="text-2xl font-semibold">{card.title}</h2>
            <p className="mt-2 text-white/70">{card.text}</p>
          </article>
        ))}
      </section>
      <Link
        href="#"
        className="inline-flex rounded-full bg-brand-pink px-6 py-3 text-lg font-semibold text-black"
      >
        Jetzt kostenlos registrieren
      </Link>
    </main>
  );
}

