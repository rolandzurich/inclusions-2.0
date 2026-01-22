"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getAllDJs, getAllDJPairs, getDJPairWithDJs, getBookableDJs, getDJById, getPairDisplayName } from "@/lib/dj-utils";
import { FormNotification } from "@/components/FormNotification";

type BookingType = "dj" | "pair";

export default function DJsPage() {
  const searchParams = useSearchParams();
  const djs = getAllDJs();
  const bookableDJs = getBookableDJs();
  const pairs = getAllDJPairs();
  
  const [selectedType, setSelectedType] = useState<BookingType | null>(null);
  const [selectedId, setSelectedId] = useState<string>("");
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
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    const djParam = searchParams.get("dj");
    const pairParam = searchParams.get("pair");

    if (djParam) {
      setSelectedType("dj");
      setSelectedId(djParam);
      // Scroll zum Formular
      setTimeout(() => {
        document.getElementById("booking-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } else if (pairParam) {
      setSelectedType("pair");
      setSelectedId(pairParam);
      // Scroll zum Formular
      setTimeout(() => {
        document.getElementById("booking-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [searchParams]);

  const selectedDJ = selectedType === "dj" ? getDJById(selectedId) : null;
  const selectedPair = selectedType === "pair" ? getDJPairWithDJs(selectedId) : null;

  const bookingSelectValue = selectedType && selectedId ? `${selectedType}:${selectedId}` : "";

  const selectedBookingName = selectedDJ?.name || (selectedPair ? getPairDisplayName(selectedPair.id) || selectedPair.name : null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const bookingData = {
        type: selectedType,
        bookingItem:
          selectedType === "dj" ? selectedDJ?.name : (selectedPair ? getPairDisplayName(selectedPair.id) || selectedPair.name : null),
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
        setSelectedType(null);
        setSelectedId("");
      } else {
        setSubmitStatus("error");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToForm = () => {
    document.getElementById("booking-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handlePairClick = (pairId: string) => {
    setSelectedType("pair");
    setSelectedId(pairId);
    setTimeout(() => {
      scrollToForm();
    }, 100);
  };

  return (
    <main className="min-h-screen max-w-6xl px-4 py-12 mx-auto space-y-10 text-white">
      <section>
        <h1 className="text-4xl font-bold">Resident DJs &amp; DJ Pairs</h1>
        <p className="mt-3 text-lg text-white/70">
          Unsere Resident DJ's sind mit Herz und Seele Teil von INCLUSIONS. Sie legen ohne Gage auf
          und unterstützen das Projekt als Botschafter.
        </p>
        <p className="mt-2 text-white/70">
          Ein USP von INCLUSIONS sind die DJ Pairs: professionelle DJ's legen zusammen mit DJ's mit
          Beeinträchtigung auf und schaffen ein inklusives, zugängliches Erlebnis auf der
          Tanzfläche.
        </p>
        <div className="mt-6">
          <button
            onClick={scrollToForm}
            className="inline-flex items-center rounded-full bg-brand-pink px-6 py-3 text-lg font-semibold text-black hover:bg-brand-pink/90 transition-colors"
          >
            DJ's für deinen Event anfragen
          </button>
        </div>
      </section>

      {/* DJ Pairs */}
      <section className="space-y-6">
        <div>
          <h2 className="text-3xl font-semibold">DJ Pairs</h2>
          <p className="mt-2 text-white/70">
            Diese DJ Pairs können gemeinsam gebucht werden. Sie bringen das INCLUSIONS-Gefühl auf
            deinen Event und verbinden Cluberfahrung mit gelebter Inklusion.
          </p>
          <p className="mt-2 text-white/70">
            Die Zusammensetzungen entwickeln sich weiter und können sich ändern: Beim DJ-Coaching kommen regelmässig neue talentierte Menschen mit Beeinträchtigung dazu, die DJ werden möchten.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pairs.map((pair) => {
            const pairWithDJs = getDJPairWithDJs(pair.id);
            if (!pairWithDJs) return null;

            return (
              <article
                key={pair.id}
                className="rounded-2xl bg-white/5 p-6 hover:bg-white/10 transition-all"
              >
                <div className="relative h-48 rounded-xl bg-white/10 mb-4 overflow-hidden group">
                  {pair.image ? (
                    <div className="absolute inset-0 animate-float">
                      <Image
                        src={pair.image}
                        alt={`${pair.name} - Inklusives DJ-Pairing für das INCLUSIONS Event${pairWithDJs.dj1.hasDisability || pairWithDJs.dj2.hasDisability ? " mit DJ's mit Beeinträchtigung" : ""}`}
                        fill
                        className="object-cover scale-110 group-hover:scale-100 transition-transform duration-[20s] ease-out"
                        loading="lazy"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/40">
                      <svg
                        className="w-16 h-16"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-semibold mb-2">{getPairDisplayName(pair.id) || pair.name}</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="text-xs px-2 py-1 rounded-full bg-brand-pink/20 text-brand-pink">
                    DJ Pair
                  </span>
                  {pairWithDJs.dj1.hasDisability && (
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400">
                      Inklusiv
                    </span>
                  )}
                  {pairWithDJs.dj2.hasDisability && (
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400">
                      Inklusiv
                    </span>
                  )}
                </div>
                {pair.text && (
                  <p className="text-sm text-white/70 mb-4">{pair.text}</p>
                )}
                <button
                  onClick={() => handlePairClick(pair.id)}
                  className="inline-block text-sm text-brand-pink hover:text-brand-pink/80 transition-colors"
                >
                  Jetzt buchen →
                </button>
              </article>
            );
          })}
        </div>
      </section>

      {/* Alle Resident DJs (inkl. nicht einzeln buchbare) */}
      <section className="space-y-6">
        <div>
          <h2 className="text-3xl font-semibold">Alle Resident DJ's</h2>
          <p className="mt-2 text-white/70">
            Übersicht aller DJ's im INCLUSIONS Pool. Einige sind nur als Teil eines Pairs buchbar.
            Die Badges zeigen dir, ob jemand inklusiv mit Beeinträchtigung auflegt oder nur als
            Pair verfügbar ist.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {djs.map((dj) => (
            <article
              key={dj.id}
              className="rounded-xl bg-white/5 p-4 hover:bg-white/10 transition-all"
            >
              <div className="relative h-32 rounded-lg bg-white/10 mb-3 overflow-hidden group">
                {dj.image ? (
                  <div className="absolute inset-0 animate-float">
                    <Image 
                      src={dj.image} 
                      alt={`${dj.name} - Resident DJ bei INCLUSIONS${dj.hasDisability ? " mit Beeinträchtigung" : ""}${dj.bookableIndividually ? " - Einzeln buchbar" : " - Nur als Pair buchbar"}`}
                      fill 
                      className={`object-cover scale-110 group-hover:scale-100 transition-transform duration-[20s] ease-out ${
                        dj.id === "samy-jackson" || dj.id === "hoibaer" 
                          ? "object-top" 
                          : ""
                      }`}
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/40">
                    <svg
                      className="w-12 h-12"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                      />
                    </svg>
                  </div>
                )}
              </div>
              <h3 className="text-lg font-semibold mb-2">{dj.name}</h3>
              <div className="flex flex-wrap gap-2 mb-2">
                {dj.hasDisability && (
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400">
                    Inklusiv
                  </span>
                )}
                {dj.bookableIndividually ? (
                  <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                    Einzeln buchbar
                  </span>
                ) : (
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-500/20 text-gray-400">
                    Nur als Pair
                  </span>
                )}
              </div>
              {dj.text && (
                <p className="text-sm text-white/70 mb-2">{dj.text}</p>
              )}
              {dj.soundcloud && (
                <a
                  href={dj.soundcloud}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-brand-pink hover:text-brand-pink/80 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.84-.179-.84-.66 0-.359.24-.66.54-.779 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.242 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                  </svg>
                  SoundCloud
                </a>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* Booking Formular */}
      <section id="booking-form" className="rounded-3xl bg-white/10 p-8 space-y-6">
        <div className="space-y-3">
          <h2 className="text-3xl font-semibold">
            Booking-Anfrage {selectedBookingName ? `für ${selectedBookingName}` : "für DJ's & DJ Pairs"}
          </h2>
          <p className="text-white/80 max-w-2xl">
            Du möchtest unsere Resident DJ's oder DJ Pairs für deinen Event buchen? Fülle das Formular aus 
            und wir melden uns bei dir mit weiteren Informationen, Verfügbarkeit und Konditionen.
          </p>
          <p className="text-sm text-white/60">
            Die Anfrage ist unverbindlich. Wir melden uns persönlich bei dir.
          </p>
        </div>

        {submitStatus === "success" && (
          <FormNotification
            type="success"
            message="Vielen Dank! Deine Anfrage wurde erfolgreich gesendet. Wir melden uns bald bei dir."
            onClose={() => setSubmitStatus("idle")}
            autoCloseDelay={30000}
          />
        )}

        {submitStatus === "error" && (
          <FormNotification
            type="error"
            message="Es ist ein Fehler aufgetreten. Bitte versuche es erneut oder kontaktiere uns direkt per E-Mail."
            onClose={() => setSubmitStatus("idle")}
            autoCloseDelay={30000}
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="bookingItem" className="block text-sm font-medium mb-2">
              Was möchtest du buchen? *
            </label>
            <select
              id="bookingItem"
              required
              value={bookingSelectValue}
              onChange={(e) => {
                const value = e.target.value;
                if (!value) {
                  setSelectedType(null);
                  setSelectedId("");
                  return;
                }
                const [type, id] = value.split(":") as [BookingType, string];
                setSelectedType(type);
                setSelectedId(id);
              }}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-brand-pink"
            >
              <option value="">Bitte auswählen</option>
              {pairs.length > 0 && (
                <optgroup label="DJ Pairs">
                  {pairs.map((pair) => (
                    <option key={pair.id} value={`pair:${pair.id}`}>
                      {getPairDisplayName(pair.id) || pair.name}
                    </option>
                  ))}
                </optgroup>
              )}
              {bookableDJs.length > 0 && (
                <optgroup label="Resident DJ's (einzeln buchbar)">
                  {bookableDJs.map((dj) => (
                    <option key={dj.id} value={`dj:${dj.id}`}>
                      {dj.name}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

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
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-brand-pink"
              placeholder="+41 XX XXX XX XX"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="eventDate" className="block text-sm font-medium mb-2">
                Event-Datum *
              </label>
              <input
                type="date"
                id="eventDate"
                required
                value={formData.eventDate}
                onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-brand-pink"
              />
            </div>
            <div>
              <label htmlFor="eventLocation" className="block text-sm font-medium mb-2">
                Event-Ort *
              </label>
              <input
                type="text"
                id="eventLocation"
                required
                value={formData.eventLocation}
                onChange={(e) => setFormData({ ...formData, eventLocation: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-brand-pink"
                placeholder="Zürich, Supermarket"
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="eventTime" className="block text-sm font-medium mb-2">
                Gewünschte Zeit des Auftritts *
              </label>
              <input
                type="time"
                id="eventTime"
                required
                value={formData.eventTime}
                onChange={(e) => setFormData({ ...formData, eventTime: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-brand-pink"
              />
            </div>
            <div>
              <label htmlFor="eventDuration" className="block text-sm font-medium mb-2">
                Dauer des Auftritts *
              </label>
              <input
                type="text"
                id="eventDuration"
                required
                value={formData.eventDuration}
                onChange={(e) => setFormData({ ...formData, eventDuration: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-brand-pink"
                placeholder="z.B. 2 Stunden, 90 Minuten"
              />
            </div>
          </div>

          <div>
            <label htmlFor="eventType" className="block text-sm font-medium mb-2">
              Art des Events *
            </label>
            <input
              type="text"
              id="eventType"
              required
              value={formData.eventType}
              onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-brand-pink"
              placeholder="z.B. Club Night, Festival, Private Event"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-2">
              Nachricht
            </label>
            <textarea
              id="message"
              rows={5}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-brand-pink resize-none"
              placeholder="Weitere Informationen zu deinem Event..."
            />
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-brand-pink px-6 py-3 text-lg font-semibold text-black hover:bg-brand-pink/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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


