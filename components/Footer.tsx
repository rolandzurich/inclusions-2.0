import Link from "next/link";

const navLinks = [
  { href: "/events", label: "Events" },
  { href: "/rueckblick", label: "Rückblick" },
  { href: "/djs", label: "DJ's" },
  { href: "/dance-crew", label: "Dance Crew" },
  { href: "/medien", label: "Medien" },
  { href: "/ueber-uns", label: "Über uns" },
];

export function Footer() {
  return (
    <footer className="bg-gradient-to-b from-brand-dark to-black border-t border-white/10 text-sm text-white">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Über uns */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Über uns</h3>
            <p className="text-white/70 mb-4">
              Inclusions verbindet Menschen mit und ohne Beeinträchtigung. Vom Event
              zur Bewegung – gemeinsam gestalten wir eine neue Clubkultur.
            </p>
            <p className="text-xs text-white/60">
              Verein Inclusions<br />
              Zürich<br />
              gegründet: Januar 2025
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Links</h3>
            <div className="space-y-2 text-white/70">
              <Link href="/anmeldung" className="block hover:text-white transition-colors">
                Newsletter
              </Link>
              {navLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  className="block hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pl-2 space-y-1">
                <Link href="/ueber-uns" className="block hover:text-white transition-colors">
                  Über uns
                </Link>
                <Link href="/vision" className="block hover:text-white transition-colors">
                  Unsere Vision
                </Link>
              </div>
              <Link href="/spenden" className="block hover:text-white transition-colors">
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
                  className="hover:text-white transition-colors"
                >
                  reto@inclusions.zone
                </a>
              </div>
              <div>
                <p className="font-medium">Roland Lüthi</p>
                <a 
                  href="mailto:roland@inclusions.zone" 
                  className="hover:text-white transition-colors"
                >
                  roland@inclusions.zone
                </a>
              </div>
            </div>
          </div>

          {/* Rechtliches & Spenden */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Rechtliches</h3>
            <div className="space-y-2 text-white/70 mb-6">
              <Link href="/rechtliches" className="block hover:text-white transition-colors">
                Datenschutz &amp; Impressum
              </Link>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-2">Vereinskonto für Spenden</h4>
              <p className="text-xs text-white/70">
                Raiffeisenbank<br />
                CH87 8080 8006 0762 5517 5
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/60">
          <p>© Inclusions – Vom Event zur Bewegung</p>
          <div className="flex items-center gap-4">
            <Link
              href="/admin/login"
              className="text-white/60 hover:text-white transition-colors"
            >
              Admin
            </Link>
            <p>
              Webseite erstellt durch{" "}
              <a
                href="https://www.linkedin.com/in/roland-luethi-digital-marketer-wald-botschafter/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/80 hover:text-white transition-colors underline"
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

