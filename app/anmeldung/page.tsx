"use client";

import { useState } from "react";
import Image from "next/image";
import { FormNotification } from "@/components/FormNotification";

type SubmitStatus = "idle" | "success" | "error";

export default function AnmeldungPage() {
  const [formData, setFormData] = useState({
    vorname: "",
    nachname: "",
    email: "",
    beeintraechtigung: "",
    interessiert: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      const interessiert = checked
        ? [...prev.interessiert, value]
        : prev.interessiert.filter((item) => item !== value);
      return { ...prev, interessiert };
    });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.vorname.trim()) {
      newErrors.vorname = "Vorname ist erforderlich";
    }
    if (!formData.nachname.trim()) {
      newErrors.nachname = "Nachname ist erforderlich";
    }
    if (!formData.email.trim()) {
      newErrors.email = "E-Mail ist erforderlich";
    } else     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Bitte gib eine gültige E-Mail-Adresse ein";
    }
    if (!formData.beeintraechtigung) {
      newErrors.beeintraechtigung = "Bitte wähle eine Option";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          first_name: formData.vorname,
          last_name: formData.nachname,
          has_disability: formData.beeintraechtigung === 'ja',
          interests: formData.interessiert,
          honeypot: '', // Honeypot-Feld
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSubmitStatus("success");
        // Formular zurücksetzen
        setFormData({
          vorname: "",
          nachname: "",
          email: "",
          beeintraechtigung: "",
          interessiert: [],
        });
      } else {
        setSubmitStatus("error");
      }
    } catch (error) {
      console.error('Error submitting newsletter form:', error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen max-w-6xl px-4 py-8 md:py-12 mx-auto space-y-12 text-white">
      {submitStatus === "success" && (
        <FormNotification
          type="success"
          message="Vielen Dank für deine Anmeldung! Bitte bestätige deine E-Mail-Adresse, indem du auf den Link in der E-Mail klickst, die wir dir gerade gesendet haben."
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

      {/* Hero Headline - Kompakt */}
      <section className="text-center space-y-4 pt-4">
        <h1 className="text-4xl md:text-5xl font-bold">Werde Teil der Bewegung!</h1>
        <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto">
          Verpasse keine Momente. Erhalte exklusive Updates zu unseren Events, DJs und der Inclusions-Community.
        </p>
      </section>

      {/* Anmeldeformular - Above the fold */}
      <section className="rounded-3xl bg-white/10 p-6 md:p-8 lg:p-12 space-y-6">
        <div className="text-center space-y-3">
          <h2 className="text-2xl md:text-3xl font-bold">Jetzt anmelden – es dauert nur 30 Sekunden</h2>
          <p className="text-base md:text-lg text-white/80 max-w-2xl mx-auto">
            Melde dich jetzt für unseren Newsletter an und werde Teil der Inclusions-Community. 
            Wir senden dir regelmässig spannende Updates – versprochen, keine Spam-Mails!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Vorname */}
            <div>
              <label htmlFor="vorname" className="block text-sm font-semibold mb-2">
                Vorname <span className="text-brand-pink">*</span>
              </label>
              <input
                type="text"
                id="vorname"
                name="vorname"
                value={formData.vorname}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg bg-white/10 border ${
                  errors.vorname ? "border-amber-500/60" : "border-white/20"
                } text-white placeholder-white/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink transition-colors duration-200`}
                placeholder="Dein Vorname"
              />
              {errors.vorname && (
                <p className="mt-1 text-sm text-amber-200">{errors.vorname}</p>
              )}
            </div>

            {/* Nachname */}
            <div>
              <label htmlFor="nachname" className="block text-sm font-semibold mb-2">
                Nachname <span className="text-brand-pink">*</span>
              </label>
              <input
                type="text"
                id="nachname"
                name="nachname"
                value={formData.nachname}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg bg-white/10 border ${
                  errors.nachname ? "border-amber-500/60" : "border-white/20"
                } text-white placeholder-white/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink transition-colors duration-200`}
                placeholder="Dein Nachname"
              />
              {errors.nachname && (
                <p className="mt-1 text-sm text-amber-200">{errors.nachname}</p>
              )}
            </div>
          </div>

          {/* E-Mail */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold mb-2">
              E-Mail <span className="text-brand-pink">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg bg-white/10 border ${
                  errors.email ? "border-amber-500/60" : "border-white/20"
                } text-white placeholder-white/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink transition-colors duration-200`}
              placeholder="deine.email@beispiel.ch"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-amber-200">{errors.email}</p>
            )}
          </div>

          {/* Beeinträchtigung */}
          <div>
            <label className="block text-sm font-semibold mb-3">
              Ich habe eine Beeinträchtigung: <span className="text-brand-pink">*</span>
            </label>
            <div className="space-y-3">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="beeintraechtigung"
                  value="ja"
                  checked={formData.beeintraechtigung === "ja"}
                  onChange={handleRadioChange}
                  className="w-5 h-5 text-brand-pink bg-white/10 border-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink"
                />
                <span className="ml-3 text-white/90">Ja</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="beeintraechtigung"
                  value="nein"
                  checked={formData.beeintraechtigung === "nein"}
                  onChange={handleRadioChange}
                  className="w-5 h-5 text-brand-pink bg-white/10 border-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink"
                />
                <span className="ml-3 text-white/90">Nein</span>
              </label>
            </div>
            {errors.beeintraechtigung && (
              <p className="mt-1 text-sm text-amber-200">{errors.beeintraechtigung}</p>
            )}
          </div>

          {/* Interessen (optional) */}
          <div>
            <label className="block text-sm font-semibold mb-3">
              Ich interessiere mich für (optional):
            </label>
            <div className="space-y-3">
              {[
                "Newsletter mit Event-Updates",
                "VIP-Anmeldung für Menschen mit Beeinträchtigung",
                "Aktive Mitarbeit bei Inclusions",
                "Sponsoring-Möglichkeiten",
                "Institutionelle Partnerschaften",
              ].map((option) => (
                <label key={option} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    value={option}
                    checked={formData.interessiert.includes(option)}
                    onChange={handleCheckboxChange}
                    className="w-5 h-5 text-brand-pink bg-white/10 border-white/20 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink"
                  />
                  <span className="ml-3 text-white/90">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full bg-brand-pink px-8 py-4 text-lg font-semibold text-black hover:bg-brand-pink/90 transition-colors duration-200 ease-in-out shadow-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink focus-visible:ring-offset-2 focus-visible:ring-offset-brand-gray"
            >
              {isSubmitting ? "Wird gesendet..." : "Jetzt kostenlos anmelden"}
            </button>
            <p className="mt-3 text-sm text-white/60 text-center">
              Du kannst dich jederzeit wieder abmelden. Wir respektieren deine Privatsphäre.
            </p>
          </div>
        </form>
      </section>

      {/* Warum anmelden - Nach dem Formular */}
      <section className="grid gap-6 md:grid-cols-3">
        <article className="rounded-2xl bg-white/5 p-6 space-y-4">
          <div className="w-12 h-12 rounded-full bg-brand-pink/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-brand-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold">Exklusive Updates</h3>
          <p className="text-white/80">
            Erfahre als Erster von neuen Events, Line-ups und besonderen Aktionen. Keine wichtigen Infos mehr verpassen.
          </p>
        </article>

        <article className="rounded-2xl bg-white/5 p-6 space-y-4">
          <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          <h3 className="text-xl font-semibold">Teil einer Community</h3>
          <p className="text-white/80">
            Werde Teil einer Bewegung, die Menschen verbindet und echte Inklusion lebt. Gemeinsam schaffen wir etwas Grosses.
          </p>
        </article>

        <article className="rounded-2xl bg-white/5 p-6 space-y-4">
          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold">Frühbucher-Vorteile</h3>
          <p className="text-white/80">
            Als Newsletter-Abonnent profitierst du von exklusiven Angeboten, Early-Bird-Tickets und besonderen Aktionen.
          </p>
        </article>
      </section>

      {/* Zusätzliche Motivation */}
      <section className="grid gap-6 md:grid-cols-2">
        <div className="relative h-64 rounded-2xl overflow-hidden group">
          <div className="absolute inset-0 animate-float">
            <Image
              src="/images/rueckblick-2.jpg"
              alt="Inclusions Event - Gemeinsam tanzen"
              fill
              className="object-cover scale-110 group-hover:scale-100 transition-transform duration-[20s] ease-out"
            />
          </div>
        </div>
        <div className="rounded-2xl bg-white/5 p-6 flex flex-col justify-center space-y-4">
          <h3 className="text-2xl font-semibold">Über 400 Menschen feierten bei der 1. Edition</h3>
          <p className="text-white/80">
            Sei dabei, wenn wir Geschichte schreiben. Die Inclusions-Community wächst täglich – 
            und du kannst Teil davon sein. Melde dich jetzt an und verpasse keine Momente voller 
            Energie, Verbindung und purem Spass.
          </p>
          <div className="flex items-center gap-2 text-brand-pink">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            <span className="font-semibold">Gemeinsam anders. Gemeinsam stärker.</span>
          </div>
        </div>
      </section>
    </main>
  );
}


