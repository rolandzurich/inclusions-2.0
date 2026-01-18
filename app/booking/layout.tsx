import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Booking - DJs & Dance Crew buchen | Inclusions",
  description: "Buche Inclusions DJs, DJ Pairs oder die Dance Crew für dein Event. Inklusives DJ-Pairing, Resident DJs und die Inclusions Dance Crew für Festivals, Clubs und Firmen-Events.",
  openGraph: {
    title: "Booking - DJs & Dance Crew buchen | Inclusions",
    description: "Buche Inclusions DJs, DJ Pairs oder die Dance Crew für dein Event.",
    images: [{ url: "/images/hero.jpg", width: 1200, height: 630, alt: "Inclusions DJs und Dance Crew" }],
  },
};

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
