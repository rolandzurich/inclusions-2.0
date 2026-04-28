import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Persönlicher Rückblick – INCLUSIONS 2",
  description:
    "Wenn der Verstand ins Herzen rückt: ein persönlicher, visueller Rückblick auf INCLUSIONS 2 – roh, ungefiltert und voller Menschlichkeit.",
  openGraph: {
    title: "Persönlicher Rückblick – INCLUSIONS 2",
    description:
      "Ein persönlicher, visueller Rückblick auf INCLUSIONS 2 – roh, ungefiltert und voller Menschlichkeit.",
    images: [
      {
        url: "/rueckblick-inclusions2/optimized/verstand-herz-1600.jpg",
        width: 1600,
        height: 900,
        alt: "INCLUSIONS 2 – persönlicher Rückblick",
      },
    ],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

