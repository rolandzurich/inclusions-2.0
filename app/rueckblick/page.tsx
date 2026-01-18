"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getAllRueckblickImages, categories } from "@/lib/rueckblick-utils";
import { RueckblickImage } from "@/components/RueckblickImage";

export default function RueckblickPage() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const images = getAllRueckblickImages();
  
  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedImage) return;
      
      if (e.key === "Escape") {
        setSelectedImage(null);
      } else if (e.key === "ArrowLeft") {
        const currentIndex = images.findIndex((img) => img.id === selectedImage);
        const prevImage = images[currentIndex - 1];
        if (prevImage) setSelectedImage(prevImage.id);
      } else if (e.key === "ArrowRight") {
        const currentIndex = images.findIndex((img) => img.id === selectedImage);
        const nextImage = images[currentIndex + 1];
        if (nextImage) setSelectedImage(nextImage.id);
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImage, images]);
  
  // Gruppiere Bilder nach Kategorien
  const groupedImages = images.reduce((acc, img) => {
    if (!acc[img.category]) {
      acc[img.category] = [];
    }
    acc[img.category].push(img);
    return acc;
  }, {} as Record<string, typeof images>);

  const selectedImageData = selectedImage
    ? images.find((img) => img.id === selectedImage)
    : null;

  return (
    <main className="min-h-screen max-w-6xl px-4 py-12 mx-auto space-y-16 text-white">
      {/* Hero Section */}
      <section className="space-y-8">
        <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden group">
          <div className="absolute inset-0 animate-float">
            <Image
              src="/images/rueckblick/rueckblick-21.png"
              alt="Inclusions Event im Supermarket Zürich - Über 400 Menschen mit und ohne Beeinträchtigung tanzen zusammen mit INCLUSIONS Projektion"
              fill
              className="object-cover scale-110 group-hover:scale-100 transition-transform duration-[20s] ease-out"
              quality={95}
              priority
              sizes="100vw"
              loading="eager"
            />
          </div>
          
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
          
          {/* Text Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-10">
            <div className="space-y-4 animate-fade-in w-full">
              <p className="text-sm uppercase tracking-[0.3em] text-brand-pink mb-1">Rückblick</p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white [text-shadow:_2px_2px_8px_rgb(0_0_0_/_90%)]">
                Unsere Reise
              </h1>
              <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto [text-shadow:_1px_1px_4px_rgb(0_0_0_/_80%)]">
                Von der ersten Besichtigung bis zum erfolgreichen Event – ein visueller Rückblick auf die Entstehung von Inclusions
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Einführung */}
      <section className="space-y-6">
        <div className="rounded-3xl bg-gradient-to-br from-brand-pink/20 to-brand-pink/10 p-8 md:p-12 border-2 border-brand-pink/30">
          <div className="max-w-4xl mx-auto space-y-4 text-center">
            <p className="text-lg text-white/90 leading-relaxed">
              Am 27. September 2025 haben wir Geschichte geschrieben. Über 400 Menschen – mit und ohne Beeinträchtigung – 
              tanzten zusammen im Supermarket Zürich. Diese Bilder erzählen die Geschichte unserer Reise: von der ersten Idee 
              bis zum erfolgreichen Event.
            </p>
            <p className="text-white/80">
              Energie. Verbindung. Menschlichkeit. Pure Freude.
            </p>
          </div>
        </div>
      </section>

      {/* Bildergalerie nach Kategorien */}
      <section className="space-y-12">
        {Object.entries(groupedImages).map(([category, categoryImages]) => (
          <div key={category} className="space-y-6">
            <div>
              <h2 className="text-3xl font-semibold text-white">
                {categories[category as keyof typeof categories] || category}
              </h2>
              <div className="mt-2 h-1 w-24 bg-brand-pink rounded-full" />
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {categoryImages.map((image) => (
                <RueckblickImage
                  key={image.id}
                  src={`/images/rueckblick/${image.filename}`}
                  alt={image.title}
                  title={image.title}
                  description={image.description}
                  onClick={() => setSelectedImage(image.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* Lightbox Modal */}
      {selectedImageData && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-5xl w-full space-y-4" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white hover:text-brand-pink transition-colors z-10 bg-black/50 rounded-full p-2"
              aria-label="Schließen"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="relative w-full h-[70vh] rounded-2xl overflow-hidden bg-black/50">
              <Image
                src={`/images/rueckblick/${selectedImageData.filename}`}
                alt={`${selectedImageData.title} - ${selectedImageData.description || "Inclusions Rückblick"}`}
                fill
                className="object-contain"
                sizes="100vw"
                priority
                loading="eager"
              />
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <h3 className="text-2xl font-bold text-white mb-2">
                {selectedImageData.title}
              </h3>
              <p className="text-white/80">
                {selectedImageData.description}
              </p>
            </div>
            
            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const currentIndex = images.findIndex((img) => img.id === selectedImageData.id);
                  const prevImage = images[currentIndex - 1];
                  if (prevImage) setSelectedImage(prevImage.id);
                }}
                disabled={images.findIndex((img) => img.id === selectedImageData.id) === 0}
                className="px-6 py-3 rounded-full bg-brand-pink text-black font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-pink/90 transition-colors"
              >
                ← Zurück
              </button>
              
              <span className="text-white/60">
                {images.findIndex((img) => img.id === selectedImageData.id) + 1} / {images.length}
              </span>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const currentIndex = images.findIndex((img) => img.id === selectedImageData.id);
                  const nextImage = images[currentIndex + 1];
                  if (nextImage) setSelectedImage(nextImage.id);
                }}
                disabled={images.findIndex((img) => img.id === selectedImageData.id) === images.length - 1}
                className="px-6 py-3 rounded-full bg-brand-pink text-black font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-pink/90 transition-colors"
              >
                Weiter →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <section className="space-y-6 text-center rounded-3xl bg-white/10 p-8 md:p-12">
        <h2 className="text-3xl font-semibold text-white">
          Die Reise geht weiter
        </h2>
        <p className="text-lg text-white/80 max-w-2xl mx-auto">
          Inclusions 2 findet am 25. April 2026, 13:00 - 21:00 statt. Sei dabei und werde Teil dieser Bewegung!
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="https://supermarket.li/events/inclusions/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-brand-pink px-6 py-3 text-lg font-semibold text-black hover:bg-brand-pink/90 transition-colors"
          >
            <span>Zum nächsten Event</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-brand-pink px-6 py-3 text-lg font-semibold text-brand-pink hover:bg-brand-pink hover:text-black transition-colors"
          >
            <span>Zur Startseite</span>
          </Link>
        </div>
      </section>
    </main>
  );
}

