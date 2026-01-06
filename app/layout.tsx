import type { Metadata } from "next";
import { Bangers } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import UmamiScript from "@/components/UmamiScript";

const bangers = Bangers({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bangers",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://magnificent-dragon-0989ed.netlify.app"),
  title: {
    default: "Inclusions 2.0 - Inklusives Event Zürich | Vom Event zur Bewegung",
    template: "%s | Inclusions"
  },
  description: "Inclusions verbindet Menschen mit und ohne Beeinträchtigung durch Musik, Begegnung und echte Menschlichkeit. Inklusives Event am 25. April 2026 im Supermarket Zürich. DJ-Workshops, Dance Crew, inklusive Clubkultur.",
  keywords: ["Inclusions", "Zürich", "inklusives Event", "Supermarket Zürich", "DJ-Workshop", "Dance Crew", "insieme", "Barrierefreiheit", "Inklusion", "Clubkultur", "inklusive Musik", "DJ-Pairing"],
  authors: [{ name: "Inclusions" }],
  creator: "Inclusions",
  publisher: "Inclusions",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "de_CH",
    url: "https://magnificent-dragon-0989ed.netlify.app",
    siteName: "Inclusions",
    title: "Inclusions 2.0 - Inklusives Event Zürich",
    description: "Inclusions verbindet Menschen mit und ohne Beeinträchtigung durch Musik, Begegnung und echte Menschlichkeit. Inklusives Event am 25. April 2026 im Supermarket Zürich.",
    images: [
      {
        url: "/images/hero.jpg",
        width: 1200,
        height: 630,
        alt: "Inclusions Event - Menschen mit und ohne Beeinträchtigung tanzen zusammen",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Inclusions 2.0 - Inklusives Event Zürich",
    description: "Inclusions verbindet Menschen mit und ohne Beeinträchtigung durch Musik, Begegnung und echte Menschlichkeit.",
    images: ["/images/hero.jpg"],
  },
  alternates: {
    canonical: "https://magnificent-dragon-0989ed.netlify.app",
  },
  other: {
    "geo.region": "CH-ZH",
    "geo.placename": "Zürich",
    "geo.position": "47.3769;8.5417",
    "ICBM": "47.3769, 8.5417",
  },
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de-CH" className={bangers.variable}>
      <head>
        <link rel="preconnect" href="https://magnificent-dragon-0989ed.netlify.app" />
        <link rel="dns-prefetch" href="https://magnificent-dragon-0989ed.netlify.app" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Inclusions",
              "url": "https://magnificent-dragon-0989ed.netlify.app",
              "logo": "https://magnificent-dragon-0989ed.netlify.app/images/Inclusions_POS_rgb.png",
              "description": "Inklusives Event-Projekt für Menschen mit und ohne Beeinträchtigung in Zürich",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Zürich",
                "addressRegion": "ZH",
                "addressCountry": "CH"
              },
              "sameAs": []
            })
          }}
        />
      </head>
      <body className="bg-brand-gray text-white">
        <UmamiScript />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
