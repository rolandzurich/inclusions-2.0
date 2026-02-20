import Link from "next/link";
import Image from "next/image";
import { SocialLinks } from "@/components/SocialLinks";

const navLinks = [
  { href: "/events", label: "Events" },
  { href: "/djs", label: "DJ's" },
  { href: "/dance-crew", label: "Dance Crew" },
  { href: "/medien", label: "Medien" },
  { href: "/ueber-uns", label: "Über uns" },
];

export function Footer() {
  return (
    <footer className="bg-gradient-to-b from-brand-dark to-black border-t border-white/10 text-sm text-white" role="contentinfo">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Über uns */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Über uns</h3>
            <p className="text-white/70 mb-4">
              INCLUSIONS verbindet Menschen mit und ohne Beeinträchtigung. Vom Event
              zur Bewegung – gemeinsam gestalten wir eine neue Clubkultur.
            </p>
            <p className="text-white/70 mb-4">
              Wir sind politisch und religiös neutral.
            </p>
            <p className="text-xs text-white/60 mb-4">
              Verein INCLUSIONS<br />
              Zürich<br />
              gegründet: Januar 2025
            </p>
            <div>
              <h4 className="text-sm font-semibold mb-2">Folge uns</h4>
              <SocialLinks className="!justify-start gap-3" />
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Links</h3>
            <div className="space-y-2 text-white/70">
              <Link href="/anmeldung" className="block hover:text-white transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink focus-visible:ring-inset rounded">
                Newsletter
              </Link>
              {navLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  className="block hover:text-white transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink focus-visible:ring-inset rounded"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pl-2 space-y-1">
                <Link href="/ueber-uns" className="block hover:text-white transition-colors">
                  Über uns
                </Link>
                <Link href="/rueckblick" className="block hover:text-white transition-colors">
                  Rückblick
                </Link>
                <Link href="/vision" className="block hover:text-white transition-colors">
                  Unsere Vision
                </Link>
                <Link href="/faq" className="block hover:text-white transition-colors">
                  Fragen & Antworten
                </Link>
              </div>
              <Link href="/spenden" className="block hover:text-white transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink focus-visible:ring-inset rounded">
                Spenden
              </Link>
            </div>
          </div>

          {/* Kontakt */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Kontakt</h3>
            <div className="space-y-2 text-white/70">
              <div>
                <p className="font-medium">Reto Willi</p>
                <a 
                  href="mailto:reto@inclusions.zone" 
                  className="hover:text-white transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink focus-visible:ring-inset rounded"
                >
                  reto@inclusions.zone
                </a>
              </div>
              <div>
                <p className="font-medium">Roland Lüthi</p>
                <a 
                  href="mailto:roland@inclusions.zone" 
                  className="hover:text-white transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink focus-visible:ring-inset rounded"
                >
                  roland@inclusions.zone
                </a>
              </div>
            </div>
          </div>

          {/* Rechtliches & Spenden */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Rechtliches</h3>
            <nav aria-label="Rechtliche Links">
              <div className="space-y-2 text-white/70 mb-6">
              <Link href="/rechtliches" className="block hover:text-white transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink focus-visible:ring-inset rounded">
                Datenschutz &amp; Impressum
              </Link>
              </div>
            </nav>
            <div>
              <h4 className="text-sm font-semibold mb-2">Vereinskonto für Spenden</h4>
              <p className="text-xs text-white/70">
                Raiffeisenbank<br />
                CH87 8080 8006 0762 5517 5
              </p>
            </div>
          </div>
        </div>

        {/* Strategischer Partner */}
        <div className="border-t border-white/10 pt-6 pb-2 flex items-center justify-center gap-3">
          <span className="text-xs text-white/50">Strategischer Partner:</span>
          <Link
            href="https://insieme-zuerich.ch/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Image
              src="/images/partners/insieme.png"
              alt="insieme Zürich"
              width={80}
              height={30}
              className="h-6 w-auto object-contain brightness-110"
            />
          </Link>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/60">
          <p>© INCLUSIONS – Vom Event zur Bewegung</p>
          <div className="flex items-center gap-4">
            <Link
              href="/admin-v2/dashboard"
              className="text-white/60 hover:text-white transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink focus-visible:ring-inset rounded"
              aria-label="Admin-Bereich"
            >
              Admin-Bereich
            </Link>
            <p>
              Webseite erstellt durch{" "}
              <a
                href="https://www.linkedin.com/in/roland-luethi-digital-marketer-wald-botschafter/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/80 hover:text-white transition-colors duration-200 ease-in-out underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink focus-visible:ring-offset-1 rounded"
              >
                Roland Lüthi
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

