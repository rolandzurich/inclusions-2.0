/**
 * GEO (Generative Engine Optimization) – Schema.org JSON-LD Helfer
 * Macht Inhalte für KI-Suchmaschinen (ChatGPT, Perplexity, Gemini etc.) maschinenlesbar.
 */

export function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://inclusions.zone";
}

const BASE = getBaseUrl();

/** Erweiterte Organization für E-E-A-T und Entity-Erkennung */
export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${BASE}/#organization`,
    name: "Inclusions",
    url: BASE,
    logo: { "@type": "ImageObject", url: `${BASE}/images/inclusions-logo.png` },
    description: "Inclusions verbindet Menschen mit und ohne Beeinträchtigung durch Musik, Begegnung und echte Menschlichkeit. Inklusives Event im Supermarket Zürich. Verein aus Zürich, politisch und religiös neutral.",
    foundingDate: "2024",
    address: { "@type": "PostalAddress", addressLocality: "Zürich", addressCountry: "CH" },
    sameAs: [
      "https://www.instagram.com/inclusions.zone/",
      "https://supermarket.li/",
    ].filter(Boolean),
    knowsAbout: [
      "Inklusion",
      "inklusive Events",
      "Clubkultur",
      "Barrierefreiheit",
      "Menschen mit Beeinträchtigung",
      "DJ Pairs",
      "Dance Crew",
    ],
    areaServed: { "@type": "Country", name: "Schweiz" },
  };
}

/** WebSite-Schema für bessere Auffindbarkeit in KI-Suchen */
export function getWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${BASE}/#website`,
    url: BASE,
    name: "Inclusions",
    description: "Inclusions – Inklusives Event Zürich. Vom Event zur Bewegung. Musik, Begegnung, Inklusion.",
    publisher: { "@id": `${BASE}/#organization` },
    inLanguage: "de-CH",
  };
}

export interface FAQItem {
  question: string;
  answer: string;
}

/** FAQPage – antwortet auf typische Prompts wie «Was ist Inclusions?», «Wie VIP?» */
export function getFAQPageSchema(faq: FAQItem[], pageUrl?: string) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
    ...(pageUrl && { url: pageUrl }),
  };
}

export interface EventSchemaInput {
  id: string;
  name: string;
  description: string;
  startDate: string; // ISO
  endDate?: string;
  location: string;
  image?: string;
  status?: "upcoming" | "past";
  offers?: { url: string };
}

/** Event-Schema für Kalender und KI-Antworten zu «Wann», «Wo» */
export function getEventSchema(e: EventSchemaInput) {
  const start = e.startDate.includes("T") ? e.startDate : `${e.startDate}T13:00:00+02:00`;
  const end = e.endDate || (e.startDate.includes("T") ? undefined : `${e.startDate}T21:00:00+02:00`);
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: e.name,
    description: e.description,
    startDate: start,
    ...(end && { endDate: end }),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: e.location.split(",")[0]?.trim() || "Supermarket",
      address: { "@type": "PostalAddress", addressLocality: "Zürich", addressCountry: "CH" },
    },
    image: e.image ? (e.image.startsWith("http") ? e.image : `${BASE}${e.image}`) : `${BASE}/images/hero.jpg`,
    organizer: { "@id": `${BASE}/#organization` },
    ...(e.offers?.url && { offers: { "@type": "Offer", url: e.offers.url } }),
  };
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

/** BreadcrumbList für Kontext in KI-Antworten */
export function getBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${BASE}${item.url}`,
    })),
  };
}

export interface PersonSchemaInput {
  name: string;
  jobTitle: string;
  image: string;
  description: string;
  worksFor?: { name: string; url: string };
}

/** Person für Über-uns, E-E-A-T */
export function getPersonSchema(p: PersonSchemaInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: p.name,
    jobTitle: p.jobTitle,
    image: p.image.startsWith("http") ? p.image : `${BASE}${p.image}`,
    description: p.description,
    ...(p.worksFor && { worksFor: { "@type": "Organization", name: p.worksFor.name, url: p.worksFor.url } }),
  };
}

/** AboutPage / WebPage für Über-uns */
export function getAboutPageSchema(description: string, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    url: url.startsWith("http") ? url : `${BASE}${url}`,
    name: "Über uns – Inclusions Team & Vision",
    description,
    publisher: { "@id": `${BASE}/#organization` },
    inLanguage: "de-CH",
  };
}
