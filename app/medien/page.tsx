import Image from "next/image";
import type { Metadata } from "next";
import { SocialLinks } from "@/components/SocialLinks";

export const metadata: Metadata = {
  title: "Medien - INCLUSIONS Presse, Fotos & Videos",
  description: "Medien zu INCLUSIONS: Fotos, Videos und Presseinformationen zum inklusiven Event. Musik, Tanz und gelebte Inklusion im Supermarket Zürich. Für Redaktionen und Interessierte.",
  openGraph: {
    title: "Medien - INCLUSIONS Presse & Fotos",
    description: "Fotos, Videos und Presseinformationen zum inklusiven Event INCLUSIONS im Supermarket Zürich.",
    images: [{ url: "/images/rueckblick-3.jpg", width: 1200, height: 630, alt: "INCLUSIONS Event - Menschen feiern gemeinsam" }],
  },
};

export default function MedienPage() {
  return (
    <main className="min-h-screen max-w-6xl px-4 py-12 mx-auto space-y-16 text-white">
      {/* Hero Section */}
      <section className="space-y-8">
        <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden group">
          <div className="absolute inset-0 animate-float">
            <Image
              src="/images/rueckblick-3.jpg"
              alt="INCLUSIONS Event - Menschen feiern gemeinsam"
              fill
              className="object-cover scale-110 group-hover:scale-100 transition-transform duration-[20s] ease-out"
              quality={95}
              priority
              sizes="100vw"
            />
          </div>
          
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
          
          {/* Text Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-end text-center px-4 z-10 pb-8 md:pb-12">
            <div className="space-y-4 animate-fade-in w-full">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white [text-shadow:_2px_2px_8px_rgb(0_0_0_/_90%)]">
                Musik, Tanz & gelebte Inklusion
              </h1>
              <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto [text-shadow:_1px_1px_4px_rgb(0_0_0_/_80%)]">
                Ein einzigartiger Event, bei dem Menschen mit und ohne Beeinträchtigung gemeinsam feiern, 
                performen, gestalten. Musik, die Barrieren bricht. Menschen, die verbinden. Ein Moment, der bleibt.
              </p>
            </div>
          </div>
        </div>

        {/* Wieso Inclusions */}
        <div className="rounded-2xl bg-blue-500/10 border border-blue-500/20 p-6 space-y-3">
          <h2 className="text-2xl md:text-3xl font-semibold text-white">Wieso haben wir INCLUSIONS ins Leben gerufen?</h2>
          <p className="text-white/90 leading-relaxed">
            Ganz einfach: Weil es Menschen mit Beeinträchtigung verdient haben an einer richtig coolen Techno-Party mit dabei zu sein und so richtig abfeiern zu dürfen. Deshalb sind diese Menschen auch unsere VIP Gäste und profitieren von kostenlosem Eintritt und Vergünstigungen an der Bar.
          </p>
        </div>
      </section>

      {/* Was macht Inclusions besonders */}
      <section className="space-y-6">
        <h2 className="text-3xl font-semibold">Was macht INCLUSIONS besonders?</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <article className="rounded-2xl bg-white/5 p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-brand-pink/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-brand-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Inklusive Acts</h3>
                <p className="text-white/80">
                  Menschen mit Beeinträchtigung sind nicht nur unsere VIP-Gäste sondern auch aktiv beteiligt – als DJ's, Tänzerinnen, Künstlerinnen, 
                  Designer*innen. Sie stehen im Mittelpunkt, nicht am Rand.
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-2xl bg-white/5 p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Einzigartige Atmosphäre</h3>
                <p className="text-white/80">
                  Elektronische Musik trifft auf Diversität, Offenheit und echte Begegnungen. 
                  Eine Party, die wirklich anders ist – und das spürst du.
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-2xl bg-white/5 p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Partner & Botschafter</h3>
                <ul className="text-white/80 space-y-1 list-disc list-inside">
                  <li>Denise Biellmann</li>
                  <li>insieme Zürich</li>
                  <li>Sandro Bohnenblust (Supermarket)</li>
                  <li>Islam Alijaj</li>
                  <li>Alex Bücheli (BCK Zürich)</li>
                  <li>Tixi Taxi</li>
                  <li>Alex Flach (PR)</li>
                  <li>Christian Guggenbühl (Hitschfilm)</li>
                </ul>
              </div>
            </div>
          </article>

          <article className="rounded-2xl bg-white/5 p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Aktive Mitarbeit</h3>
                <ul className="text-white/80 space-y-2 list-none">
                  <li><strong>Andrej Voina (AVTL Content):</strong> Kommunikation, Medien, Social Media</li>
                  <li><strong>DJ&apos;s:</strong> Zagara, Coco.bewegt, Samy Jackson, Hoibaer, Ashan</li>
                  <li><strong>Colette M:</strong> Dance Crew Leitung</li>
                  <li><strong>Joza Zeier:</strong> Sicherheit</li>
                  <li><strong>Markus Hafner:</strong> Care Team</li>
                </ul>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* Call to Action für Medien */}
      <section className="rounded-3xl bg-white/10 p-8 md:p-12 space-y-6">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold">Unterstütze uns mit deiner Reichweite</h2>
          <p className="text-lg text-white/80 max-w-3xl mx-auto">
            Wir stehen am Anfang und freuen uns, auch dich als Botschafter zu gewinnen! 
            Jede Erwähnung, Video, Artikel, Interview oder Social Media Beitrag hilft, 
            die INCLUSIONS-Botschaft zu verbreiten.
          </p>
          <div className="rounded-2xl bg-brand-pink/10 border border-brand-pink/30 p-6 max-w-2xl mx-auto">
            <p className="text-white/90 text-lg leading-relaxed">
              <strong className="text-white">Wir versichern dir:</strong> Es wird dich und deine 
              Leser/Hörer/Zuschauer berühren.
            </p>
          </div>
          <SocialLinks />
        </div>
      </section>

      {/* Medienunterlagen */}
      <section className="space-y-6">
        <div>
          <h2 className="text-3xl font-semibold mb-2">Medienunterlagen</h2>
          <p className="text-lg text-white/80 max-w-3xl">
            Hier findest du unsere Key Visuals, Logos sowie eine Übersicht der bisherigen Presseberichterstattung über INCLUSIONS.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Key Visuals & Logos */}
          <a
            href="https://drive.google.com/drive/folders/1me5SJpgN_8iuqgu8Os2KRwKdh7bMBxh0?usp=drive_link"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-2xl bg-white/5 p-6 border border-white/10 hover:border-brand-pink/40 hover:bg-white/[0.07] transition-colors group block"
          >
            <div className="w-12 h-12 rounded-full bg-brand-pink/20 flex items-center justify-center mb-4 group-hover:bg-brand-pink/30 transition-colors">
              <svg className="w-6 h-6 text-brand-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2 group-hover:text-brand-pink transition-colors">Key Visuals & Logos</h3>
            <p className="text-sm text-white/70 mb-3">
              Hochauflösende Logos, Keyvisuals und Bildmaterial für deine Berichterstattung.
            </p>
            <span className="text-brand-pink text-sm font-medium inline-flex items-center gap-1">
              Ordner öffnen
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            </span>
          </a>

          {/* Presseveröffentlichungen */}
          <div className="rounded-2xl bg-white/5 p-6 border border-white/10">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-4">Presseveröffentlichungen</h3>
            <ul className="space-y-4">
              <li>
                <a
                  href="https://photos.google.com/photo/AF1QipOtb8eJh0yOkBpahEEMw1h4BWxl9JfCmEykyPZD"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/90 hover:text-brand-pink transition-colors block group"
                >
                  <span className="font-medium">20 Minuten (Print)</span>
                  <span className="block text-sm text-white/70 group-hover:text-white/90">Berichterstattung in der Printausgabe der grössten Schweizer Tageszeitung.</span>
                </a>
              </li>
              <li>
                <a
                  href="https://ubwg.ch/event/inclusions-charity-rave-supermarket-zuerich-27-09-2025/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/90 hover:text-brand-pink transition-colors block group"
                >
                  <span className="font-medium">UBWG – Unsere Beweggründe</span>
                  <span className="block text-sm text-white/70 group-hover:text-white/90">Porträt von INCLUSIONS mit Initianten, Line-up und allen Infos zum Charity Rave im Supermarket.</span>
                </a>
              </li>
              <li>
                <a
                  href="https://tsri.ch/a/party-fuer-alle-so-barrierefrei-ist-das-zuercher-nachtleben"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/90 hover:text-brand-pink transition-colors block group"
                >
                  <span className="font-medium">Tsüri.ch</span>
                  <span className="block text-sm text-white/70 group-hover:text-white/90">«Party für alle? So barrierefrei ist das Zürcher Nachtleben» – Reportage über Barrierefreiheit in Zürcher Clubs und die Pionierrolle von INCLUSIONS.</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Kontakt */}
      <section className="space-y-6 rounded-3xl bg-white/10 p-8">
        <h2 className="text-3xl font-semibold">Wir freuen uns auf deine Anfrage</h2>
        <p className="text-lg text-white/80">
          Hast du Fragen, möchtest du ein Interview führen oder brauchst du spezifische Medienunterlagen? 
          Melde dich bei uns!
        </p>
        <div className="space-y-2">
          <p className="font-semibold text-white">Andrej Voina, Medienkontakt</p>
          <a 
            href="mailto:info@avtlcontent.com" 
            className="text-brand-pink hover:text-brand-pink/80 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            info@avtlcontent.com
          </a>
          <a 
            href="tel:+41763250007" 
            className="text-brand-pink hover:text-brand-pink/80 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            +41 76 325 00 07
          </a>
        </div>
      </section>
    </main>
  );
}



