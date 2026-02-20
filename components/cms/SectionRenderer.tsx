'use client';

/**
 * CMS Section Renderer
 * Rendert eine Section basierend auf ihrem Typ und Content (JSONB)
 */

import Link from 'next/link';
import Image from 'next/image';

// === Typ-Definitionen ===

interface CmsSection {
  id: string;
  section_type: string;
  title?: string;
  content: any;
  sort_order: number;
  is_visible: boolean;
  css_classes?: string;
}

// === Einzelne Section-Komponenten ===

/**
 * Hero Section
 * content: { subtitle, image, image_alt, buttons: [{ text, href, style }] }
 */
function HeroSection({ section }: { section: CmsSection }) {
  const { subtitle, image, image_alt, buttons } = section.content;

  return (
    <section className={`space-y-8 ${section.css_classes || ''}`}>
      {image && (
        <div className="relative w-full h-[400px] sm:h-[500px] md:h-[600px] rounded-2xl overflow-hidden">
          <Image
            src={image}
            alt={image_alt || section.title || ''}
            fill
            className="object-cover"
            quality={90}
            priority
            sizes="(max-width: 1024px) 100vw, 1152px"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-4">
            {section.title && (
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white [text-shadow:_2px_2px_4px_rgb(0_0_0_/_80%)]">
                {section.title}
              </h1>
            )}
            {subtitle && (
              <p className="mt-4 text-xl md:text-2xl text-white/90 [text-shadow:_2px_2px_4px_rgb(0_0_0_/_80%)] max-w-3xl">
                {subtitle}
              </p>
            )}
            {buttons && buttons.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-4 justify-center">
                {buttons.map((btn: any, i: number) => (
                  <Link
                    key={i}
                    href={btn.href || '#'}
                    target={btn.href?.startsWith('http') ? '_blank' : undefined}
                    rel={btn.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className={
                      btn.style === 'outline'
                        ? 'rounded-full border-2 border-brand-pink bg-black/50 px-6 py-3 text-lg font-semibold text-brand-pink hover:bg-brand-pink hover:text-black transition-colors'
                        : 'rounded-full bg-brand-pink px-6 py-3 text-lg font-semibold text-black hover:bg-brand-pink/90 transition-colors'
                    }
                  >
                    {btn.text}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {!image && section.title && (
        <div className="text-white">
          <h1 className="text-4xl font-bold md:text-5xl">{section.title}</h1>
          {subtitle && (
            <p className="mt-4 text-xl text-white/80 max-w-3xl">{subtitle}</p>
          )}
          {buttons && buttons.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-4">
              {buttons.map((btn: any, i: number) => (
                <Link
                  key={i}
                  href={btn.href || '#'}
                  className={
                    btn.style === 'outline'
                      ? 'rounded-full border border-brand-pink px-6 py-3 text-lg font-semibold text-brand-pink hover:bg-brand-pink hover:text-black transition-colors'
                      : 'rounded-full bg-brand-pink px-6 py-3 text-lg font-semibold text-black hover:bg-brand-pink/90 transition-colors'
                  }
                >
                  {btn.text}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

/**
 * Text Section
 * content: { body, subtitle }
 */
function TextSection({ section }: { section: CmsSection }) {
  const { body, subtitle } = section.content;

  return (
    <section className={`space-y-4 ${section.css_classes || ''}`}>
      {section.title && (
        <h2 className="text-3xl font-semibold text-white">{section.title}</h2>
      )}
      {subtitle && (
        <p className="text-lg text-white/80">{subtitle}</p>
      )}
      {body && (
        <div className="text-white/80 space-y-3 leading-relaxed max-w-4xl">
          {body.split('\n').filter(Boolean).map((paragraph: string, i: number) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      )}
    </section>
  );
}

/**
 * Text + Image Section
 * content: { body, image, image_alt, image_position, buttons }
 */
function TextImageSection({ section }: { section: CmsSection }) {
  const { body, image, image_alt, image_position, buttons } = section.content;
  const imageRight = image_position !== 'left';

  return (
    <section className={`rounded-3xl bg-white/10 p-8 text-white shadow-lg ${section.css_classes || ''}`}>
      <div className={`grid gap-6 md:grid-cols-2 items-center ${imageRight ? '' : 'direction-rtl'}`}>
        <div>
          {section.title && (
            <h2 className="text-3xl font-semibold">{section.title}</h2>
          )}
          {body && (
            <div className="mt-4 text-white/80 space-y-2 leading-relaxed">
              {body.split('\n').filter(Boolean).map((p: string, i: number) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          )}
          {buttons && buttons.length > 0 && (
            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              {buttons.map((btn: any, i: number) => (
                <Link
                  key={i}
                  href={btn.href || '#'}
                  target={btn.href?.startsWith('http') ? '_blank' : undefined}
                  rel={btn.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className={
                    btn.style === 'outline'
                      ? 'inline-flex items-center justify-center gap-2 rounded-full border border-brand-pink px-6 py-3 text-lg font-semibold text-brand-pink hover:bg-brand-pink hover:text-black transition-colors'
                      : 'inline-flex items-center justify-center gap-2 rounded-full bg-brand-pink px-6 py-3 text-lg font-semibold text-black hover:bg-brand-pink/90 transition-colors'
                  }
                >
                  {btn.text}
                </Link>
              ))}
            </div>
          )}
        </div>
        {image && (
          <div className="w-full aspect-square relative rounded-2xl overflow-hidden">
            <Image
              src={image}
              alt={image_alt || section.title || ''}
              fill
              className="object-cover rounded-2xl"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * Cards Section
 * content: { cards: [{ title, text, icon, image, link }] }
 */
function CardsSection({ section }: { section: CmsSection }) {
  const { cards } = section.content;

  return (
    <section className={`space-y-6 ${section.css_classes || ''}`}>
      {section.title && (
        <h2 className="text-3xl font-semibold text-white">{section.title}</h2>
      )}
      <div className={`grid gap-6 md:grid-cols-${Math.min(cards?.length || 3, 4)}`}>
        {(cards || []).map((card: any, i: number) => (
          <article key={i} className="rounded-2xl bg-white/5 p-6 hover:bg-white/10 transition-all">
            {card.image && (
              <div className="relative h-48 rounded-xl overflow-hidden mb-4">
                <Image src={card.image} alt={card.title || ''} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
              </div>
            )}
            {card.icon && (
              <div className="text-3xl mb-3">{card.icon}</div>
            )}
            {card.title && (
              <h3 className="text-xl font-semibold text-white mb-2">{card.title}</h3>
            )}
            {card.text && (
              <p className="text-white/80 leading-relaxed">{card.text}</p>
            )}
            {card.link && (
              <Link href={card.link} className="mt-3 inline-block text-sm text-brand-pink hover:text-brand-pink/80 transition-colors">
                Mehr erfahren →
              </Link>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

/**
 * FAQ Section
 * content: { items: [{ question, answer }] }
 */
function FAQSection({ section }: { section: CmsSection }) {
  const { items } = section.content;

  return (
    <section className={`space-y-6 ${section.css_classes || ''}`}>
      {section.title && (
        <h2 className="text-3xl font-semibold text-white">{section.title}</h2>
      )}
      <dl className="space-y-4">
        {(items || []).map((item: any, i: number) => (
          <div key={i} className="rounded-2xl bg-white/5 p-6 border border-white/5">
            <dt className="text-lg font-semibold text-white">{item.question}</dt>
            <dd className="mt-2 text-white/80 leading-relaxed">{item.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/**
 * Gallery Section
 * content: { images: [{ src, alt }], columns }
 */
function GallerySection({ section }: { section: CmsSection }) {
  const { images, columns } = section.content;
  const cols = columns || 3;

  return (
    <section className={`space-y-6 ${section.css_classes || ''}`}>
      {section.title && (
        <h2 className="text-3xl font-semibold text-white">{section.title}</h2>
      )}
      <div className={`grid gap-4 md:grid-cols-${cols}`}>
        {(images || []).map((img: any, i: number) => (
          <div key={i} className="relative h-64 rounded-2xl overflow-hidden group">
            <Image
              src={img.src}
              alt={img.alt || ''}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes={`(max-width: 768px) 100vw, ${Math.floor(100 / cols)}vw`}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * Partners Section
 * content: { subtitle, partners: [{ name, logo, url }] }
 */
function PartnersSection({ section }: { section: CmsSection }) {
  const { subtitle, partners } = section.content;

  return (
    <section className={`space-y-6 ${section.css_classes || ''}`}>
      <div className="text-center">
        {section.title && (
          <h2 className="text-3xl font-semibold text-white">{section.title}</h2>
        )}
        {subtitle && (
          <p className="mt-2 text-white/70">{subtitle}</p>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
        {(partners || []).map((partner: any, i: number) => {
          const content = partner.logo ? (
            <div className="relative w-full h-full">
              <Image
                src={partner.logo}
                alt={partner.name}
                fill
                className="object-contain p-2"
                sizes="150px"
              />
            </div>
          ) : (
            <span className="text-xs text-white/70 text-center px-2">{partner.name}</span>
          );

          if (partner.url) {
            return (
              <Link
                key={i}
                href={partner.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 h-32"
              >
                {content}
              </Link>
            );
          }

          return (
            <div key={i} className="flex items-center justify-center p-4 rounded-xl bg-white/5 h-32">
              {content}
            </div>
          );
        })}
      </div>
    </section>
  );
}

/**
 * CTA Section
 * content: { body, buttons: [{ text, href, style }] }
 */
function CTASection({ section }: { section: CmsSection }) {
  const { body, buttons } = section.content;

  return (
    <section className={`space-y-4 rounded-3xl bg-white/5 p-8 text-white ${section.css_classes || ''}`}>
      {section.title && (
        <h2 className="text-3xl font-semibold">{section.title}</h2>
      )}
      {body && (
        <p className="text-lg text-white/80 max-w-3xl">{body}</p>
      )}
      {buttons && buttons.length > 0 && (
        <div className="flex flex-wrap gap-4 items-center">
          {buttons.map((btn: any, i: number) => (
            <Link
              key={i}
              href={btn.href || '#'}
              target={btn.href?.startsWith('http') ? '_blank' : undefined}
              rel={btn.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
              className={
                btn.style === 'outline'
                  ? 'inline-flex rounded-full border border-brand-pink px-6 py-3 text-lg font-semibold text-brand-pink hover:bg-brand-pink hover:text-black transition-colors'
                  : 'inline-flex rounded-full bg-brand-pink px-6 py-3 text-lg font-semibold text-black hover:bg-brand-pink/90 transition-colors'
              }
            >
              {btn.text}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

/**
 * Quotes Section
 * content: { quotes: [{ text, author }] }
 */
function QuotesSection({ section }: { section: CmsSection }) {
  const { quotes } = section.content;

  return (
    <section className={`space-y-6 ${section.css_classes || ''}`}>
      {section.title && (
        <h2 className="text-3xl font-semibold text-white">{section.title}</h2>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {(quotes || []).map((quote: any, i: number) => (
          <article key={i} className="rounded-3xl bg-white/5 p-6 text-lg text-white/80">
            <p className="italic">&ldquo;{quote.text}&rdquo;</p>
            {quote.author && (
              <p className="mt-3 text-sm text-brand-pink font-medium">— {quote.author}</p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

/**
 * Lineup Section
 * content: { subtitle, artists: [{ name, role, image }] }
 */
function LineupSection({ section }: { section: CmsSection }) {
  const { subtitle, artists } = section.content;

  return (
    <section className={`space-y-6 ${section.css_classes || ''}`}>
      {section.title && (
        <h2 className="text-3xl font-semibold text-white">{section.title}</h2>
      )}
      {subtitle && (
        <p className="text-lg text-white/80">{subtitle}</p>
      )}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {(artists || []).map((artist: any, i: number) => (
          <div key={i} className="rounded-2xl bg-white/5 p-4 text-center hover:bg-white/10 transition-all">
            {artist.image && (
              <div className="relative w-24 h-24 mx-auto rounded-full overflow-hidden mb-3">
                <Image src={artist.image} alt={artist.name} fill className="object-cover" sizes="96px" />
              </div>
            )}
            <p className="font-semibold text-white">{artist.name}</p>
            {artist.role && (
              <p className="text-sm text-brand-pink">{artist.role}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * Custom HTML Section
 * content: { html }
 */
function CustomHTMLSection({ section }: { section: CmsSection }) {
  const { html } = section.content;

  return (
    <section className={section.css_classes || ''}>
      {section.title && (
        <h2 className="text-3xl font-semibold text-white mb-4">{section.title}</h2>
      )}
      <div
        className="prose prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: html || '' }}
      />
    </section>
  );
}

// === Haupt-Renderer ===

const SECTION_COMPONENTS: Record<string, React.FC<{ section: CmsSection }>> = {
  hero: HeroSection,
  text: TextSection,
  text_image: TextImageSection,
  cards: CardsSection,
  faq: FAQSection,
  gallery: GallerySection,
  partners: PartnersSection,
  cta: CTASection,
  quotes: QuotesSection,
  lineup: LineupSection,
  custom_html: CustomHTMLSection,
};

export function SectionRenderer({ section }: { section: CmsSection }) {
  if (!section.is_visible) return null;

  const Component = SECTION_COMPONENTS[section.section_type];

  if (!Component) {
    return (
      <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-red-400">
        Unbekannter Section-Typ: <code>{section.section_type}</code>
      </div>
    );
  }

  return <Component section={section} />;
}

export function PageRenderer({ sections }: { sections: CmsSection[] }) {
  return (
    <main className="min-h-screen max-w-6xl px-4 py-12 mx-auto space-y-16">
      {sections
        .filter((s) => s.is_visible)
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((section) => (
          <SectionRenderer key={section.id} section={section} />
        ))}
    </main>
  );
}

// Export Types
export type { CmsSection };

// Export Section-Typen-Info für Admin-UI
export const SECTION_TYPES = [
  { value: 'hero', label: 'Hero Banner', icon: '🖼️', description: 'Grosses Bild mit Titel und Buttons' },
  { value: 'text', label: 'Text', icon: '📝', description: 'Titel mit Fliesstext' },
  { value: 'text_image', label: 'Text + Bild', icon: '📰', description: 'Text neben einem Bild' },
  { value: 'cards', label: 'Karten', icon: '🃏', description: 'Mehrere Karten in einem Grid' },
  { value: 'faq', label: 'FAQ', icon: '❓', description: 'Fragen und Antworten' },
  { value: 'gallery', label: 'Galerie', icon: '🖼️', description: 'Bilder-Grid' },
  { value: 'partners', label: 'Partner', icon: '🤝', description: 'Partner-Logos mit Links' },
  { value: 'cta', label: 'Call to Action', icon: '📢', description: 'Aufruf mit Buttons' },
  { value: 'quotes', label: 'Zitate', icon: '💬', description: 'Testimonials und Zitate' },
  { value: 'lineup', label: 'Line-Up', icon: '🎵', description: 'Künstler-Auflistung' },
  { value: 'custom_html', label: 'Custom HTML', icon: '🧩', description: 'Freies HTML' },
];

// Default Content-Templates für neue Sections
export const SECTION_DEFAULTS: Record<string, any> = {
  hero: { subtitle: '', image: '', image_alt: '', buttons: [{ text: 'Mehr erfahren', href: '#', style: 'primary' }] },
  text: { body: '', subtitle: '' },
  text_image: { body: '', image: '', image_alt: '', image_position: 'right', buttons: [] },
  cards: { cards: [{ title: 'Karte 1', text: 'Beschreibung...', icon: '', image: '', link: '' }] },
  faq: { items: [{ question: 'Frage?', answer: 'Antwort.' }] },
  gallery: { images: [{ src: '', alt: '' }], columns: 3 },
  partners: { subtitle: '', partners: [{ name: 'Partner', logo: '', url: '' }] },
  cta: { body: '', buttons: [{ text: 'Jetzt handeln', href: '#', style: 'primary' }] },
  quotes: { quotes: [{ text: 'Ein tolles Zitat.', author: '' }] },
  lineup: { subtitle: '', artists: [{ name: 'Künstler', role: '', image: '' }] },
  custom_html: { html: '<div class="text-white">Eigener Inhalt</div>' },
};
