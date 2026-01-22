import { getFAQPageSchema, getBreadcrumbSchema, getBaseUrl } from "@/lib/geo-schema";

const faqDJs = [
  {
    question: "Was sind DJ Pairs bei INCLUSIONS?",
    answer: "DJ Pairs sind ein Markenzeichen von INCLUSIONS: Ein professioneller DJ legt zusammen mit einem DJ mit Beeinträchtigung auf. So entsteht ein inklusives, zugängliches Erlebnis auf der Tanzfläche. DJ Pairs können für Festivals, Clubs, Firmen-Events und private Anlässe gebucht werden.",
  },
  {
    question: "Wie buche ich einen DJ oder ein DJ Pair von INCLUSIONS?",
    answer: "Über das Booking-Formular auf inclusions.zone/djs. Wähle den DJ oder das Pair, gib Datum, Ort, Art und Dauer des Events an. Die Anfrage ist unverbindlich; wir melden uns mit Verfügbarkeit und Konditionen.",
  },
  {
    question: "Wer sind die Resident DJ's von INCLUSIONS?",
    answer: "Die Resident DJ's legen ohne Gage bei INCLUSIONS auf und unterstützen das Projekt als Botschafter. Einige sind einzeln buchbar, andere nur als Teil eines DJ Pairs. Dazu zählen u.a. Samy Jackson, Zagara, Hoibaer sowie die INCLUSIONS DJ's (Menschen mit Beeinträchtigung) in den Pairs.",
  },
];

export function DJsSchema() {
  const baseUrl = getBaseUrl();
  const jsonLdFAQ = getFAQPageSchema(faqDJs, baseUrl + "/djs");
  const jsonLdBreadcrumb = getBreadcrumbSchema([
    { name: "INCLUSIONS", url: "/" },
    { name: "DJ's & DJ Pairs", url: "/djs" },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFAQ) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }} />
    </>
  );
}
