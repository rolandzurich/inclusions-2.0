import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Newsletter - Anmeldung | Inclusions",
  description: "Melde dich für den Inclusions-Newsletter an. Bleib auf dem Laufenden zu Events, VIP-Anmeldung, Dance Crew und der inklusiven Bewegung.",
  openGraph: {
    title: "Newsletter - Anmeldung | Inclusions",
    description: "Melde dich für den Inclusions-Newsletter an.",
    images: [{ url: "/images/hero.jpg", width: 1200, height: 630, alt: "Inclusions" }],
  },
};

export default function AnmeldungLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
