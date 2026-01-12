"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  getBookableDJs,
  getAllDJPairs,
  getDJById,
  getDJPairWithDJs,
  getPairDisplayName,
} from "@/lib/dj-utils";
import { FormNotification } from "@/components/FormNotification";

type BookingType = "dj" | "pair" | "dance-crew";

const danceCrewOptions = [
  {
    id: "inclusions-dance-crew",
    name: "Inclusions Dance Crew",
  },
];

export default function BookingPage() {
  const searchParams = useSearchParams();
  const [selectedType, setSelectedType] = useState<BookingType | null>(null);
  const [selectedId, setSelectedId] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    eventDate: "",
    eventLocation: "",
    eventType: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const djs = getBookableDJs();
  const pairs = getAllDJPairs();

  useEffect(() => {
    const djParam = searchParams.get("dj");
    const pairParam = searchParams.get("pair");
    const danceCrewParam = searchParams.get("dance-crew");

    if (djParam) {
      setSelectedType("dj");
      setSelectedId(djParam);
    } else if (pairParam) {
      setSelectedType("pair");
      setSelectedId(pairParam);
    } else if (danceCrewParam) {
      setSelectedType("dance-crew");
      setSelectedId(danceCrewParam);
    } else if (!selectedType) {
      // Standardauswahl: erstes DJ Pair, sonst erster DJ, sonst Dance Crew
      if (pairs.length > 0) {
        setSelectedType("pair");
        setSelectedId(pairs[0].id);
      } else if (djs.length > 0) {
        setSelectedType("dj");
        setSelectedId(djs[0].id);
      } else if (danceCrewOptions.length > 0) {
        setSelectedType("dance-crew");
        setSelectedId(danceCrewOptions[0].id);
      }
    }
  }, [searchParams, selectedType, pairs, djs]);

  const selectedDJ = selectedType === "dj" ? getDJById(selectedId) : null;
  const selectedPair =
    selectedType === "pair" ? getDJPairWithDJs(selectedId) : null;

  const selectedDanceCrew =
    selectedType === "dance-crew"
      ? danceCrewOptions.find((crew) => crew.id === selectedId)
      : null;

  const bookingSelectValue =
    selectedType && selectedId ? `${selectedType}:${selectedId}` : "";

  const selectedBookingName =
    selectedDJ?.name || selectedPair?.name || selectedDanceCrew?.name;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const bookingData = {
        type: selectedType,
        booking_type: selectedType,
        bookingItem:
          selectedType === "dj"
            ? selectedDJ?.name
            : selectedType === "pair"
            ? selectedPair?.name
            : selectedDanceCrew?.name,
        booking_item:
          selectedType === "dj"
            ? selectedDJ?.name
            : selectedType === "pair"
            ? selectedPair?.name
            : selectedDanceCrew?.name,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
        event_date: formData.eventDate, // Korrigiert: eventDate -> event_date
        event_location: formData.eventLocation, // Korrigiert: eventLocation -> event_location
        event_type: formData.eventType, // Korrigiert: eventType -> event_type
        honeypot: '', // Honeypot-Feld
      };

      // API Route für E-Mail-Versand (wird später implementiert)
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
          eventLocation: "",
          eventType: "",
          message: "",
        });
        // Auswahl zurück auf Standard setzen
        if (pairs.length > 0) {
          setSelectedType("pair");
          setSelectedId(pairs[0].id);
        } else if (djs.length > 0) {
          setSelectedType("dj");
          setSelectedId(djs[0].id);
        } else if (danceCrewOptions.length > 0) {
          setSelectedType("dance-crew");
          setSelectedId(danceCrewOptions[0].id);
        } else {
          setSelectedType(null);
          setSelectedId("");
        }
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

  return (
    <main className="min-h-screen max-w-6xl px-4 py-12 mx-auto space-y-10 text-white">
      <section>
        <h1 className="text-4xl font-bold">Booking – DJs &amp; DJ Pairs</h1>
        <p className="mt-3 text-lg text-white/70">
          Buche unsere Resident DJs, DJ Pairs oder die Inclusions Dance Crew für deinen Event. Die DJ
          Pairs sind ein USP von Inclusions – professionelle DJs legen zusammen mit DJs mit
          Beeinträchtigung auf.
        </p>
      </section>

      {/* DJ Pairs */}
      <section className="space-y-6">
        <div>
          <h2 className="text-3xl font-semibold">DJ Pairs buchen</h2>
          <p className="mt-2 text-white/70">
            Diese DJ Pairs können zusammen gebucht werden und bringen das Inclusions-Gefühl auf
            deinen Event.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pairs.map((pair) => {
            const pairWithDJs = getDJPairWithDJs(pair.id);
            if (!pairWithDJs) return null;

            const isSelected = selectedType === "pair" && selectedId === pair.id;

            return (
              <button
                key={pair.id}
                onClick={() => {
                  setSelectedType("pair");
                  setSelectedId(pair.id);
                }}
                className={`rounded-2xl bg-white/5 p-6 text-left hover:bg-white/10 transition-all border-2 ${
                  isSelected ? "border-brand-pink" : "border-transparent"
                }`}
              >
                <div className="relative h-48 rounded-xl bg-white/10 mb-4 overflow-hidden">
                  {pair.image ? (
                    <Image src={pair.image} alt={pair.name} fill className="object-cover" />
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
                  {(pairWithDJs.dj1.hasDisability || pairWithDJs.dj2.hasDisability) && (
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400">
                      Inklusiv
                    </span>
                  )}
                </div>
                {pair.text && (
                  <p className="text-sm text-white/70">{pair.text}</p>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Einzelne DJs */}
      <section className="space-y-6">
        <div>
          <h2 className="text-3xl font-semibold">Einzelne DJs buchen</h2>
          <p className="mt-2 text-white/70">
            Diese DJs können einzeln gebucht werden und sind Teil des Inclusions DJ Pools.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {djs.map((dj) => {
            const isSelected = selectedType === "dj" && selectedId === dj.id;

            return (
              <button
                key={dj.id}
                onClick={() => {
                  setSelectedType("dj");
                  setSelectedId(dj.id);
                }}
                className={`rounded-2xl bg-white/5 p-6 text-left hover:bg-white/10 transition-all border-2 ${
                  isSelected ? "border-brand-pink" : "border-transparent"
                }`}
              >
                <div className="relative h-48 rounded-xl bg-white/10 mb-4 overflow-hidden">
                  {dj.image ? (
                    <Image src={dj.image} alt={dj.name} fill className="object-cover" />
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
                <h3 className="text-xl font-semibold mb-2">{dj.name}</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {dj.hasDisability && (
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400">
                      Inklusiv
                    </span>
                  )}
                  <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                    Einzeln buchbar
                  </span>
                </div>
                {dj.text && <p className="text-sm text-white/70">{dj.text}</p>}
              </button>
            );
          })}
        </div>
      </section>

      {/* Dance Crew */}
      <section className="space-y-6">
        <div>
          <h2 className="text-3xl font-semibold">Dance Crew buchen</h2>
          <p className="mt-2 text-white/70">
            Die Inclusions Dance Crew bringt die Inclusions-Energie auf deine Bühne, in deinen Club oder an dein Festival.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-1">
          {danceCrewOptions.map((crew) => {
            const isSelected = selectedType === "dance-crew" && selectedId === crew.id;

            return (
              <button
                key={crew.id}
                onClick={() => {
                  setSelectedType("dance-crew");
                  setSelectedId(crew.id);
                }}
                className={`rounded-2xl bg-white/5 p-6 text-left hover:bg-white/10 transition-all border-2 ${
                  isSelected ? "border-brand-pink" : "border-transparent"
                }`}
              >
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="relative h-48 md:h-32 md:w-48 rounded-xl bg-white/10 overflow-hidden flex-shrink-0">
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
                          d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{crew.name}</h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-400">
                        Dance Crew
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400">
                        Inklusiv
                      </span>
                    </div>
                    <p className="text-sm text-white/70">
                      Menschen mit und ohne Beeinträchtigung tanzen gemeinsam – professionell, kraftvoll und zutiefst berührend.
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Booking Formular */}
      <section className="rounded-3xl bg-white/10 p-8">
        <h2 className="text-3xl font-semibold mb-2">
          Booking-Anfrage{" "}
          {selectedBookingName ? `für ${selectedBookingName}` : "für Inclusions DJs & Dance Crew"}
        </h2>
          <p className="text-white/70 mb-6">
            Fülle das Formular aus und wir melden uns bei dir.
          </p>

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
                      {pair.name}
                    </option>
                  ))}
                </optgroup>
              )}
              {djs.length > 0 && (
                <optgroup label="Resident DJs (einzeln buchbar)">
                  {djs.map((dj) => (
                    <option key={dj.id} value={`dj:${dj.id}`}>
                      {dj.name}
                    </option>
                  ))}
                </optgroup>
              )}
              {danceCrewOptions.length > 0 && (
                <optgroup label="Dance Crew">
                  {danceCrewOptions.map((crew) => (
                    <option key={crew.id} value={`dance-crew:${crew.id}`}>
                      {crew.name}
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

            {/* Honeypot - für Bots unsichtbar */}
            <input
              type="text"
              name="website"
              style={{ display: 'none' }}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full bg-brand-pink px-6 py-3 text-lg font-semibold text-black hover:bg-brand-pink/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Wird gesendet..." : "Anfrage senden"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedType(null);
                  setSelectedId("");
                  setFormData({
                    name: "",
                    email: "",
                    phone: "",
                    eventDate: "",
                    eventLocation: "",
                    eventType: "",
                    message: "",
                  });
                  setSubmitStatus("idle");
                }}
                className="rounded-full border border-white/20 px-6 py-3 text-lg font-semibold text-white hover:bg-white/10 transition-colors"
              >
                Abbrechen
              </button>
            </div>
          </form>
      </section>
    </main>
  );
}
