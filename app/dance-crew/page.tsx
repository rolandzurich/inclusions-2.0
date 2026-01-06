'use client';

import { useState } from "react";
import Image from "next/image";
import { FormNotification } from "@/components/FormNotification";

type SubmitStatus = "idle" | "success" | "error";

export default function DanceCrewPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    eventDate: "",
    eventTime: "",
    eventDuration: "",
    eventLocation: "",
    eventType: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const bookingData = {
        type: "dance-crew",
        bookingItem: "Inclusions Dance Crew",
        ...formData,
      };

      const response = await fetch("/api/booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      if (response.ok) {
        setSubmitStatus("success");
        setFormData({
          name: "",
          email: "",
          phone: "",
          eventDate: "",
          eventTime: "",
          eventDuration: "",
          eventLocation: "",
          eventType: "",
          message: "",
        });
      } else {
        setSubmitStatus("error");
      }
    } catch {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScrollToForm = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const formElement = document.getElementById('booking-form');
    if (formElement) {
      const offset = 100; // Offset in pixels nach oben
      const elementPosition = formElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <main className="min-h-screen max-w-6xl px-4 py-12 mx-auto space-y-16 text-white">
      {/* Hero */}
      <section className="grid gap-10 md:grid-cols-2 items-center">
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.3em] text-brand-pink">
            Inclusions Dance Crew
          </p>
          <h1 className="text-4xl md:text-5xl font-bold">
            Die Inclusions Dance Crew –{" "}
            <span className="text-brand-pink">Tanz, Energie, Inklusion.</span>
          </h1>
          <p className="text-lg text-white/90 leading-relaxed">
            Unsere Dance Crew bringt die Inclusions-Energie auf deine Bühne,
            in deinen Club oder an dein Festival. Menschen mit und ohne
            Beeinträchtigung tanzen gemeinsam – professionell, kraftvoll und
            zutiefst berührend.
          </p>
          <p className="text-white/85 leading-relaxed">
            Buche die Inclusions Dance Crew für Shows, Eröffnungen, Firmen-
            Events, Festivals oder inklusive Kulturprojekte.
          </p>
        </div>

        <div 
          className="relative h-80 md:h-[420px] rounded-3xl overflow-hidden"
          style={{ 
            backgroundImage: "url('/images/dance-crew-background.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/80 to-black/85" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col gap-4 text-center px-6 relative z-10">
              <p 
                className="text-sm uppercase tracking-[0.3em] text-white font-semibold"
                style={{ 
                  textShadow: '3px 3px 6px rgba(0, 0, 0, 0.95), 0 0 12px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 0, 0, 0.5)'
                }}
              >
                Dance Crew
              </p>
              <p 
                className="text-2xl md:text-3xl font-semibold text-white"
                style={{ 
                  textShadow: '4px 4px 8px rgba(0, 0, 0, 0.95), 0 0 16px rgba(0, 0, 0, 0.8), 0 0 24px rgba(0, 0, 0, 0.6)'
                }}
              >
                Wo Tanz und Inklusion
                <br />
                auf der Bühne sichtbar werden.
              </p>
              <p 
                className="text-sm md:text-base text-white font-medium"
                style={{ 
                  textShadow: '2px 2px 5px rgba(0, 0, 0, 0.95), 0 0 10px rgba(0, 0, 0, 0.7), 0 0 15px rgba(0, 0, 0, 0.5)'
                }}
              >
                Choreografierte Shows, improvisierte Momente und echte
                Begegnung – immer mit dem Inclusions-Spirit.
              </p>
              <a
                href="#booking-form"
                onClick={handleScrollToForm}
                className="inline-flex items-center justify-center rounded-full px-6 py-3 text-lg font-semibold hover:opacity-90 transition-opacity mt-4 w-auto mx-auto"
                style={{ 
                  backgroundColor: '#FF04D3',
                  color: '#000000'
                }}
              >
                Dance Crew buchen
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Medien – Bilder & Videos */}
      <section className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-semibold">Momente mit der Dance Crew</h2>
            <p className="mt-2 text-white/90 max-w-2xl leading-relaxed">
              Hier kannst du Eindrücke der Inclusions Dance Crew zeigen – Fotos von Auftritten,
              Proben oder Behind-the-Scenes sowie Videos, die die Energie auf der Bühne spürbar machen.
            </p>
          </div>
          <p className="text-sm text-white/60">
            Ersetze die Platzhalterbilder/-videos später durch dein eigenes Material.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="relative h-64 rounded-2xl overflow-hidden bg-white/5 group">
            <div className="absolute inset-0 animate-float">
              <Image
                src="/images/dance-crew-1.png"
                alt="Inclusions Dance Crew – Auftritt auf der Bühne mit Menschen mit und ohne Beeinträchtigung"
                fill
                className="object-cover scale-110 group-hover:scale-100 transition-transform duration-[20s] ease-out"
                loading="lazy"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
          </div>
          <div className="relative h-64 rounded-2xl overflow-hidden bg-white/5 group">
            <div className="absolute inset-0 animate-float">
              <Image
                src="/images/dance-crew-2.png"
                alt="Inclusions Dance Crew – gemeinsamer Tanzmoment in inklusiver Atmosphäre"
                fill
                className="object-cover scale-110 group-hover:scale-100 transition-transform duration-[20s] ease-out"
                loading="lazy"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
          </div>
          <div className="relative h-64 rounded-2xl overflow-hidden bg-white/5 group">
            <div className="absolute inset-0 animate-float">
              <Image
                src="/images/dance-crew-3.png"
                alt="Inclusions Dance Crew – Performance im Club mit inklusiver Tanzgruppe"
                fill
                className="object-cover scale-110 group-hover:scale-100 transition-transform duration-[20s] ease-out"
                loading="lazy"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
          </div>
        </div>

        <div className="w-full mt-4 md:mt-6">
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-white/5 group">
            <div className="absolute inset-0 animate-float">
              <Image
                src="/images/dance-crew-probe.png"
                alt="Inclusions Dance Crew – Probe im Studio mit inklusiver Tanzgruppe"
                fill
                className="object-cover scale-110 group-hover:scale-100 transition-transform duration-[20s] ease-out"
                loading="lazy"
                sizes="100vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Inhalte / USP */}
      <section className="space-y-6">
        <h2 className="text-3xl font-semibold">Was macht die Dance Crew aus?</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            "Echte Inklusion auf der Bühne: Menschen mit und ohne Beeinträchtigung tanzen gemeinsam – sichtbar, selbstbewusst und mit Freude.",
            "Professionelle Shows: Choreografien, die zu Clubkultur und Bühnen passen – von energiegeladen bis emotional.",
            "Flexibel buchbar: Für Festivals, Clubs, Firmen-Events, kulturelle Anlässe oder als Special Act bei deinem Event.",
          ].map((text) => (
            <article
              key={text}
              className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 p-6 text-white/95 font-medium leading-relaxed"
            >
              {text}
            </article>
          ))}
        </div>
      </section>

      {/* Booking Formular */}
      <section id="booking-form" className="rounded-3xl bg-white/10 p-8 space-y-6 scroll-mt-24">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="space-y-3 flex-1">
            <h2 className="text-3xl font-semibold">Dance Crew buchen</h2>
            <p className="text-white/90 max-w-2xl leading-relaxed">
              Du möchtest die Inclusions Dance Crew für deinen Event buchen?
              Fülle das Formular aus und wir melden uns bei dir mit weiteren
              Informationen, Verfügbarkeit und Konditionen.
            </p>
            <p className="text-sm text-white/60">
              Die Anfrage ist unverbindlich. Wir melden uns persönlich bei dir.
            </p>
          </div>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="rounded-full border border-brand-pink text-brand-pink px-6 py-3 hover:bg-brand-pink/10 transition-colors whitespace-nowrap flex items-center gap-2"
            style={{ 
              borderColor: '#FF04D3',
              color: '#FF04D3'
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#FF04D3' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Zurück
          </a>
        </div>

        {submitStatus === "success" && (
          <FormNotification
            type="success"
            message="Vielen Dank! Deine Anfrage für die Inclusions Dance Crew wurde erfolgreich gesendet. Wir melden uns bald bei dir."
            onClose={() => setSubmitStatus("idle")}
          />
        )}

        {submitStatus === "error" && (
          <FormNotification
            type="error"
            message="Es ist ein Fehler aufgetreten. Bitte versuche es erneut oder kontaktiere uns direkt per E-Mail."
            onClose={() => setSubmitStatus("idle")}
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Name *
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-brand-pink"
                placeholder="Dein Name"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                E-Mail *
              </label>
              <input
                type="email"
                id="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-brand-pink"
                placeholder="deine@email.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-2">
              Telefon
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-brand-pink"
              placeholder="+41 XX XXX XX XX"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label
                htmlFor="eventDate"
                className="block text-sm font-medium mb-2"
              >
                Event-Datum *
              </label>
              <input
                type="date"
                id="eventDate"
                required
                value={formData.eventDate}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-brand-pink"
              />
            </div>
            <div>
              <label
                htmlFor="eventLocation"
                className="block text-sm font-medium mb-2"
              >
                Event-Ort *
              </label>
              <input
                type="text"
                id="eventLocation"
                required
                value={formData.eventLocation}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-brand-pink"
                placeholder="Ort / Location"
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label
                htmlFor="eventTime"
                className="block text-sm font-medium mb-2"
              >
                Gewünschte Zeit des Auftritts *
              </label>
              <input
                type="time"
                id="eventTime"
                required
                value={formData.eventTime}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-brand-pink"
              />
            </div>
            <div>
              <label
                htmlFor="eventDuration"
                className="block text-sm font-medium mb-2"
              >
                Dauer des Auftritts *
              </label>
              <input
                type="text"
                id="eventDuration"
                required
                value={formData.eventDuration}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-brand-pink"
                placeholder="z.B. 2 Stunden, 90 Minuten"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="eventType"
              className="block text-sm font-medium mb-2"
            >
              Art des Events *
            </label>
            <input
              type="text"
              id="eventType"
              required
              value={formData.eventType}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-brand-pink"
              placeholder="z.B. Festival, Club Night, Firmen-Event"
            />
          </div>

          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium mb-2"
            >
              Nachricht
            </label>
            <textarea
              id="message"
              rows={5}
              value={formData.message}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-brand-pink resize-none"
              placeholder="Erzähl uns mehr über deinen Event, Rahmenbedingungen und Wünsche."
            />
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full px-6 py-3 text-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: '#FF04D3',
                color: '#000000'
              }}
            >
              {isSubmitting ? "Wird gesendet..." : "Unverbindliche Anfrage senden"}
            </button>
            <p className="text-sm text-white/60">
              Du bekommst von uns eine persönliche Rückmeldung per E-Mail.
            </p>
          </div>
        </form>
      </section>
    </main>
  );
}

