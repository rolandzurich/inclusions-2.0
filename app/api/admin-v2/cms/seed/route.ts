export const dynamic = 'force-dynamic';

/**
 * CMS Seed API
 * POST: Erstellt Beispiel-Seiten mit Content aus bestehenden Seiten
 * Perfekt zum Testen und als Vorlage
 */

import { NextResponse } from 'next/server';
import { query } from '@/lib/db-postgres';

const SEED_PAGES = [
  {
    title: 'FAQ - Fragen & Antworten',
    slug: 'faq-neu',
    description: 'Häufige Fragen zu INCLUSIONS: Was ist INCLUSIONS? Wann und wo? VIP-Anmeldung, Tickets, DJ Pairs und Dance Crew.',
    status: 'published',
    is_homepage: false,
    sections: [
      {
        section_type: 'hero',
        title: 'Häufige Fragen zu INCLUSIONS',
        content: {
          subtitle: 'Hier finden Sie Antworten zu Event, VIP-Anmeldung, Tickets, DJ Pairs und Dance Crew – kurz und verständlich.',
          image: '',
          buttons: [],
        },
        sort_order: 0,
      },
      {
        section_type: 'faq',
        title: 'Fragen & Antworten',
        content: {
          items: [
            { question: 'Was ist INCLUSIONS?', answer: 'INCLUSIONS ist ein inklusives Event in Zürich. Wir verbinden Menschen mit und ohne Beeinträchtigung durch Musik, Begegnung und echte Menschlichkeit. Im Supermarket Zürich feiern wir gemeinsam – mit DJ\'s, Dance Crew, Techno und einer offenen Clubkultur für alle.' },
            { question: 'Wann ist das nächste INCLUSIONS Event?', answer: 'INCLUSIONS 2 findet am 25. April 2026 von 13:00 bis 21:00 Uhr im Supermarket Zürich statt. Tickets gibt es über supermarket.li/events/inclusions/.' },
            { question: 'Wo findet INCLUSIONS statt?', answer: 'INCLUSIONS findet im Supermarket (Club) in Zürich statt. Der Ort ist barrierefrei. Adresse und Wegbeschreibung findest du auf supermarket.li.' },
            { question: 'Wie komme ich als VIP gratis zu INCLUSIONS?', answer: 'Menschen mit IV-Ausweis, Beeinträchtigung oder Behinderung können sich als VIP anmelden und erhalten gratis Eintritt, vergünstigtes Essen und Getränke, ein Helfer-Team und auf Wunsch TIXI-Taxi. Anmeldung im Vorfeld unter inclusions.zone/anmeldung/vip erforderlich. Mindestalter 20 Jahre.' },
            { question: 'Wo kaufe ich Tickets für INCLUSIONS?', answer: 'Tickets für INCLUSIONS 2 kaufst du über den Supermarket: supermarket.li/events/inclusions/. Party People kaufen ein Ticket; VIPs mit Beeinträchtigung melden sich unter inclusions.zone/anmeldung/vip an und kommen gratis.' },
            { question: 'Was sind DJ Pairs bei INCLUSIONS?', answer: 'DJ Pairs sind ein Markenzeichen von INCLUSIONS: Professionelle DJ\'s legen zusammen mit DJ\'s mit Beeinträchtigung auf. So entsteht ein inklusives Erlebnis auf der Tanzfläche. DJ Pairs und Resident DJ\'s können auch für externe Events gebucht werden.' },
            { question: 'Was ist die INCLUSIONS Dance Crew?', answer: 'Die INCLUSIONS Dance Crew sind Tänzer:innen mit und ohne Beeinträchtigung, die gemeinsam performen. Sie treten bei INCLUSIONS auf und sind buchbar für Festivals, Firmen-Events und inklusive Kulturprojekte.' },
          ],
        },
        sort_order: 1,
      },
      {
        section_type: 'cta',
        title: 'Noch Fragen?',
        content: {
          body: 'Schreibe uns eine E-Mail an reto@inclusions.zone oder roland@inclusions.zone – wir helfen gerne!',
          buttons: [
            { text: 'E-Mail schreiben', href: 'mailto:roland@inclusions.zone', style: 'primary' },
          ],
        },
        sort_order: 2,
      },
    ],
  },
  {
    title: 'Über uns',
    slug: 'ueber-uns-neu',
    description: 'Erfahre mehr über INCLUSIONS – unsere Mission, unser Team und unsere Vision für eine inklusive Clubkultur.',
    status: 'published',
    is_homepage: false,
    sections: [
      {
        section_type: 'hero',
        title: 'Über INCLUSIONS',
        content: {
          subtitle: 'Vom Event zur Bewegung – wir verbinden Menschen mit und ohne Beeinträchtigung durch Musik und echte Menschlichkeit.',
          image: '/images/hero.jpg',
          image_alt: 'INCLUSIONS Event - Menschen tanzen zusammen',
          buttons: [],
        },
        sort_order: 0,
      },
      {
        section_type: 'cards',
        title: 'Was ist INCLUSIONS?',
        content: {
          cards: [
            { title: 'Gemeinsam anders', text: 'Bei INCLUSIONS schaffen wir Räume, in denen Menschen echt und auf Augenhöhe zusammenkommen.', icon: '🤝' },
            { title: 'Musik verbindet', text: 'Wir feiern eine Clubkultur, die offen für alle ist – unabhängig von Fähigkeit, Herkunft oder Background.', icon: '🎵' },
            { title: 'Eine Bewegung', text: 'Nach dem Erfolg der ersten Edition gehen wir den Weg weiter: vom Event zur Community.', icon: '💜' },
          ],
        },
        sort_order: 1,
      },
      {
        section_type: 'text',
        title: 'Unsere Vision',
        content: {
          body: 'INCLUSIONS steht für eine Welt, in der Inklusion nicht erklärt werden muss – sondern gelebt wird.\nWir glauben, dass Musik die universelle Sprache ist, die alle Grenzen überwindet.\nUnsere Events zeigen: Wenn Menschen mit und ohne Beeinträchtigung gemeinsam feiern, entsteht pure Magie.',
          subtitle: 'Eine inklusive Clubkultur für alle.',
        },
        sort_order: 2,
      },
      {
        section_type: 'quotes',
        title: 'Was andere über uns sagen',
        content: {
          quotes: [
            { text: 'Ich habe mich noch nie so frei gefühlt wie bei INCLUSIONS.', author: '' },
            { text: 'Hier tanzen Menschen wirklich miteinander – nicht nebeneinander.', author: '' },
            { text: 'Das war einer der schönsten Tage meines Lebens.', author: '' },
            { text: 'Musik verbindet uns alle – das spürt man hier so stark.', author: '' },
          ],
        },
        sort_order: 3,
      },
      {
        section_type: 'cta',
        title: 'Werde Teil der Bewegung',
        content: {
          body: 'INCLUSIONS ist eine gemeinnützige Bewegung. Mit deiner Unterstützung ermöglichen wir Events, Begleitung und Teilhabe.',
          buttons: [
            { text: 'Spenden', href: '/spenden', style: 'primary' },
            { text: 'Partner werden', href: '/spenden', style: 'outline' },
          ],
        },
        sort_order: 4,
      },
    ],
  },
];

export async function POST() {
  const results: any[] = [];

  for (const pageData of SEED_PAGES) {
    // Prüfe ob Slug schon existiert
    const { data: existing } = await query('SELECT id FROM cms_pages WHERE slug = $1', [pageData.slug]);
    if (existing && existing.length > 0) {
      results.push({ page: pageData.title, status: 'übersprungen (existiert bereits)' });
      continue;
    }

    // Seite erstellen
    const { data: pageResult, error: pageError } = await query(
      `INSERT INTO cms_pages (title, slug, description, status, is_homepage)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [pageData.title, pageData.slug, pageData.description, pageData.status, pageData.is_homepage]
    );

    if (pageError || !pageResult?.length) {
      results.push({ page: pageData.title, status: 'fehler', error: pageError });
      continue;
    }

    const pageId = pageResult[0].id;

    // Sections erstellen
    let sectionCount = 0;
    for (const section of pageData.sections) {
      const { error: sectionError } = await query(
        `INSERT INTO cms_sections (page_id, section_type, title, content, sort_order)
         VALUES ($1, $2, $3, $4, $5)`,
        [pageId, section.section_type, section.title, JSON.stringify(section.content), section.sort_order]
      );
      if (!sectionError) sectionCount++;
    }

    results.push({ page: pageData.title, status: 'erstellt', sections: sectionCount });
  }

  return NextResponse.json({ success: true, results });
}
