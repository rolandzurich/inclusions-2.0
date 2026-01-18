import type { Metadata } from "next";
import { DJsSchema } from "./DJsSchema";

export const metadata: Metadata = {
  title: "Resident DJs & DJ Pairs - Inclusions Booking",
  description: "Buche unsere Resident DJs und inklusiven DJ Pairs für deinen Event. Professionelle DJs legen zusammen mit DJs mit Beeinträchtigung auf und schaffen ein inklusives, zugängliches Erlebnis auf der Tanzfläche.",
  openGraph: {
    title: "Resident DJs & DJ Pairs - Inclusions Booking",
    description: "Buche unsere Resident DJs und inklusiven DJ Pairs für deinen Event. Professionelle DJs legen zusammen mit DJs mit Beeinträchtigung auf.",
    images: [
      {
        url: "/images/hero.jpg",
        width: 1200,
        height: 630,
        alt: "Inclusions DJs - Inklusives DJ-Pairing",
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

