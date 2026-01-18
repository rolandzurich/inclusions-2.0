import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Newsletter - Inclusions",
  description: "Melde dich für den Inclusions-Newsletter an. Erhalte Infos zu Events, VIP-Anmeldung, Dance Crew, DJs und der inklusiven Bewegung in Zürich.",
  openGraph: {
    title: "Newsletter - Inclusions",
    description: "Melde dich für den Inclusions-Newsletter an. Infos zu Events, VIP-Anmeldung und mehr.",
    images: [{ url: "/images/hero.jpg", width: 1200, height: 630, alt: "Inclusions" }],
  },
};

export default function NewsletterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
