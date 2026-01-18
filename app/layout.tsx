import type { Metadata } from "next";
import { Bangers } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import UmamiScript from "@/components/UmamiScript";
import { ClientCSSCheck } from "@/components/AgentDebug";
import { getOrganizationSchema, getWebSiteSchema } from "@/lib/geo-schema";

const bangers = Bangers({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bangers",
  preload: true,
});

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://inclusions.zone";

const jsonLdOrganization = getOrganizationSchema();
const jsonLdWebSite = getWebSiteSchema();

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Inclusions 2.0 - Inklusives Event Zürich | Vom Event zur Bewegung",
    template: "%s | Inclusions",
  },
  description:
    "Inclusions verbindet Menschen mit und ohne Beeinträchtigung durch Musik, Begegnung und echte Menschlichkeit. Inklusives Event am 25. April 2026 im Supermarket Zürich.",
  keywords: [
    "Inclusions",
    "Inklusion",
    "inklusive Events",
    "Zürich",
    "Supermarket",
    "Clubkultur",
    "Beeinträchtigung",
    "Gratis Eintritt Beeinträchtigung",
    "VIP Inclusions",
    "DJ Pairs",
    "Dance Crew",
    "Techno",
    "Inclusions 2",
    "25. April 2026",
  ],
  openGraph: {
    type: "website",
    locale: "de_CH",
    title: "Inclusions 2.0 - Inklusives Event Zürich",
    description:
      "Inclusions verbindet Menschen mit und ohne Beeinträchtigung durch Musik, Begegnung und echte Menschlichkeit. Inklusives Event am 25. April 2026 im Supermarket Zürich.",
    images: [{ url: "/images/hero.jpg", width: 1200, height: 630, alt: "Inclusions Event im Supermarket Zürich" }],
    siteName: "Inclusions",
  },
  twitter: {
    card: "summary_large_image",
    title: "Inclusions 2.0 - Inklusives Event Zürich",
    description: "Inclusions verbindet Menschen mit und ohne Beeinträchtigung durch Musik, Begegnung und echte Menschlichkeit.",
    images: ["/images/hero.jpg"],
  },
  robots: { index: true, follow: true },
  authors: [{ name: "Inclusions", url: baseUrl }],
  creator: "Inclusions",
  icons: { icon: "/images/inclusions-logo.png" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de-CH" className={bangers.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebSite) }}
        />
      </head>
      <body
        className="bg-brand-gray text-white"
        style={{
          margin: 0,
          backgroundColor: "#0F1017",
          color: "#fff",
          minHeight: "100vh",
        }}
      >
        <UmamiScript />
        <Header />
        {children}
        <Footer />
        <ClientCSSCheck />
      </body>
    </html>
  );
}
