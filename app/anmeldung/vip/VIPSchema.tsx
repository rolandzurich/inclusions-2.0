import { getFAQPageSchema, getBreadcrumbSchema, getBaseUrl } from "@/lib/geo-schema";

const faqVIP = [
  {
    question: "Was ist VIP bei INCLUSIONS?",
    answer: "VIP-Gäste bei INCLUSIONS sind Menschen mit IV-Ausweis, Beeinträchtigung oder Behinderung. Sie erhalten gratis Eintritt, vergünstigtes Essen und Getränke, ein Helfer-Team vor Ort, barrierefreien Zugang und auf Wunsch TIXI-Taxi. Anmeldung im Vorfeld erforderlich.",
  },
  {
    question: "Wer kann sich als VIP für INCLUSIONS anmelden?",
    answer: "Menschen mit IV-Ausweis, Beeinträchtigung oder Behinderung, mindestens 20 Jahre alt. Betreuer:in kommen nur gratis, wenn du auf 1-zu-1 Betreuung angewiesen bist. Freunde, Familie und andere Begleitpersonen kaufen ein Ticket.",
  },
  {
    question: "Wie melde ich mich als VIP für INCLUSIONS an?",
    answer: "Über das Anmeldeformular auf inclusions.zone/anmeldung/vip. Du oder dein Betreuer:in füllen die Daten aus. Anmeldung im Vorfeld ist erforderlich. Ohne Anmeldung ist kein garantierter gratis Eintritt.",
  },
  {
    question: "Kommen Betreuer:in und Begleiter gratis zu INCLUSIONS?",
    answer: "Nur wenn du auf 1-zu-1 Betreuung angewiesen bist, kommt dein Betreuer:in gratis. Freunde, Familie und andere Begleiter kaufen ein Ticket über supermarket.li/events/inclusions/, um den gratis VIP-Eintritt zu ermöglichen.",
  },
  {
    question: "Kann ich mit TIXI-Taxi zu INCLUSIONS kommen?",
    answer: "Ja. Bei der VIP-Anmeldung kannst du angeben, ob du von TIXI-Taxi abgeholt werden möchtest, und deine Abholadresse angeben. TIXI ist Partner von INCLUSIONS.",
  },
];

export function VIPSchema() {
  const baseUrl = getBaseUrl();
  const jsonLdFAQ = getFAQPageSchema(faqVIP, baseUrl + "/anmeldung/vip");
  const jsonLdBreadcrumb = getBreadcrumbSchema([
    { name: "INCLUSIONS", url: "/" },
    { name: "Anmeldung", url: "/anmeldung" },
    { name: "VIP-Anmeldung", url: "/anmeldung/vip" },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFAQ) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }} />
    </>
  );
}
