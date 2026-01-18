import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "VIP-Anmeldung - Gratis Eintritt | Inclusions",
  description: "VIP-Anmeldung für Inclusions: Gratis Eintritt mit IV-Ausweis oder Beeinträchtigung. Günstige Getränke, Helfer-Team, barrierefrei. Am 25. April 2026 im Supermarket Zürich. Anmeldung erforderlich.",
  openGraph: {
    title: "VIP-Anmeldung - Gratis Eintritt | Inclusions",
    description: "Gratis Eintritt mit IV-Ausweis. Günstige Getränke, barrierefrei. Anmeldung erforderlich.",
    images: [{ url: "/images/hero.jpg", width: 1200, height: 630, alt: "Inclusions VIP - Gratis Eintritt" }],
  },
};

export default function VIPLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
