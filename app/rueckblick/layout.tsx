import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rückblick - Unsere Reise im ersten Jahr | Inclusions",
  description: "Rückblick auf das erste Jahr von Inclusions: Über 400 Menschen tanzten zusammen im Supermarket Zürich. Erlebe die Reise von der ersten Idee bis zum erfolgreichen Event mit DJ-Workshops, Dance Crew, Kunstprojekten und mehr.",
  openGraph: {
    title: "Rückblick - Unsere Reise im ersten Jahr | Inclusions",
    description: "Rückblick auf das erste Jahr von Inclusions: Über 400 Menschen tanzten zusammen im Supermarket Zürich. Erlebe die Reise von der ersten Idee bis zum erfolgreichen Event.",
    images: [
      {
        url: "/images/rueckblick/rueckblick-21.png",
        width: 1200,
        height: 630,
        alt: "Inclusions Event im Supermarket Zürich - Über 400 Menschen tanzen zusammen",
      },
    ],
  },
};

export default function RueckblickLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

