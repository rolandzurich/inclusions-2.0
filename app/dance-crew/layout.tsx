import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dance Crew - Inklusive Tanzgruppe buchen | Inclusions",
  description: "Buche die Inclusions Dance Crew für Shows, Eröffnungen, Firmen-Events, Festivals oder inklusive Kulturprojekte. Menschen mit und ohne Beeinträchtigung tanzen gemeinsam – professionell, kraftvoll und zutiefst berührend.",
  openGraph: {
    title: "Dance Crew - Inklusive Tanzgruppe buchen | Inclusions",
    description: "Buche die Inclusions Dance Crew für Shows, Eröffnungen, Firmen-Events, Festivals oder inklusive Kulturprojekte.",
    images: [
      {
        url: "/images/dance-crew-background.jpg",
        width: 1200,
        height: 630,
        alt: "Inclusions Dance Crew - Inklusive Tanzgruppe auf der Bühne",
      },
    ],
  },
};

export default function DanceCrewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

