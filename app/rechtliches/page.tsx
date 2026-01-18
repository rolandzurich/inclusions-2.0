import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rechtliches - Datenschutz & Impressum | Inclusions",
  description: "Datenschutz, Impressum und rechtliche Hinweise des Vereins Inclusions, Zürich. Inklusives Event und Bewegung für Menschen mit und ohne Beeinträchtigung.",
  robots: { index: true, follow: true },
};

export default function LegalPage() {
  return (
    <main className="min-h-screen max-w-6xl px-4 py-12 mx-auto space-y-8 text-white">
      <section>
        <h1 className="text-4xl font-bold">Rechtliches</h1>
        <p className="mt-3 text-lg text-white/70">
          Platzhalter für Datenschutz, Impressum und wichtige Hinweise.
        </p>
      </section>
      <section className="space-y-4 rounded-2xl bg-white/5 p-6">
        <h2 className="text-2xl font-semibold">Datenschutz</h2>
        <p className="text-white/70">Texte folgen.</p>
      </section>
      <section className="space-y-4 rounded-2xl bg-white/5 p-6">
        <h2 className="text-2xl font-semibold">Impressum</h2>
        <p className="text-white/70">Verein Inclusions, Zürich. Weitere Angaben folgen.</p>
      </section>
    </main>
  );
}

