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
    default: "INCLUSIONS 2.0 - Inklusives Event Zürich | Vom Event zur Bewegung",
    template: "%s | INCLUSIONS",
  },
  description:
    "INCLUSIONS verbindet Menschen mit und ohne Beeinträchtigung durch Musik, Begegnung und echte Menschlichkeit. Inklusives Event am 25. April 2026 im Supermarket Zürich.",
  keywords: [
    "INCLUSIONS",
    "Inklusion",
    "inklusive Events",
    "Zürich",
    "Supermarket",
    "Clubkultur",
    "Beeinträchtigung",
    "Gratis Eintritt Beeinträchtigung",
    "VIP INCLUSIONS",
    "DJ Pairs",
    "Dance Crew",
    "Techno",
    "INCLUSIONS 2",
    "25. April 2026",
  ],
  openGraph: {
    type: "website",
    locale: "de_CH",
    title: "INCLUSIONS 2.0 - Inklusives Event Zürich",
    description:
      "INCLUSIONS verbindet Menschen mit und ohne Beeinträchtigung durch Musik, Begegnung und echte Menschlichkeit. Inklusives Event am 25. April 2026 im Supermarket Zürich.",
    images: [{ url: "/images/hero.jpg", width: 1200, height: 630, alt: "INCLUSIONS Event im Supermarket Zürich" }],
    siteName: "INCLUSIONS",
  },
  twitter: {
    card: "summary_large_image",
    title: "INCLUSIONS 2.0 - Inklusives Event Zürich",
    description: "INCLUSIONS verbindet Menschen mit und ohne Beeinträchtigung durch Musik, Begegnung und echte Menschlichkeit.",
    images: ["/images/hero.jpg"],
  },
  robots: { index: true, follow: true },
  authors: [{ name: "INCLUSIONS", url: baseUrl }],
  creator: "INCLUSIONS",
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
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
