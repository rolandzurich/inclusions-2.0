import type { Metadata } from "next";
import { DJsSchema } from "./DJsSchema";

export const metadata: Metadata = {
  title: "Resident DJ's & DJ Pairs - INCLUSIONS Booking",
  description: "Buche unsere Resident DJ's und inklusiven DJ Pairs für deinen Event. Professionelle DJ's legen zusammen mit DJ's mit Beeinträchtigung auf und schaffen ein inklusives, zugängliches Erlebnis auf der Tanzfläche.",
  openGraph: {
    title: "Resident DJ's & DJ Pairs - INCLUSIONS Booking",
    description: "Buche unsere Resident DJ's und inklusiven DJ Pairs für deinen Event. Professionelle DJ's legen zusammen mit DJ's mit Beeinträchtigung auf.",
    images: [
      {
        url: "/images/hero.jpg",
        width: 1200,
        height: 630,
        alt: "INCLUSIONS DJ's - Inklusives DJ-Pairing",
      },
    ],
  },
};

export default function DJsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DJsSchema />
      {children}
    </>
  );
}

