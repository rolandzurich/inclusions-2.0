"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function AnmeldungPage() {
  const [formData, setFormData] = useState({
    vorname: "",
    nachname: "",
    email: "",
    beeintraechtigung: "",
    interessiert: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      // Hier würde normalerweise die Formular-Daten an einen Server gesendet werden
      console.log("Newsletter-Anmeldung:", formData);
      setSubmitted(true);
      // Formular zurücksetzen nach 3 Sekunden
      setTimeout(() => {
        setFormData({
          vorname: "",
          nachname: "",
          email: "",
          beeintraechtigung: "",
          interessiert: [],
        });
        setSubmitted(false);
      }, 5000);
    }
  };

  if (submitted) {
    return (
      <main className="min-h-screen max-w-6xl px-4 py-12 mx-auto space-y-16 text-white">
        <section className="text-center space-y-8 py-20">
          <div className="w-24 h-24 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
            <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold">Willkommen in der Inclusions-Community!</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Vielen Dank für deine Anmeldung! Du erhältst jetzt die neuesten Infos zu unseren Events, 
            exklusive Updates und wirst Teil einer Bewegung, die wirklich etwas bewegt.
          </p>
          <Link
            href="/"
            className="inline-flex rounded-full bg-brand-pink px-8 py-4 text-lg font-semibold text-black hover:bg-brand-pink/90 transition-colors"
          >
            Zur Startseite
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen max-w-6xl px-4 py-12 mx-auto space-y-16 text-white">
      {/* Hero Section with Image */}
      <section className="space-y-8">
        <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden group">
          <div className="absolute inset-0 animate-float">
            <Image
              src="/images/rueckblick-1.jpg"
              alt="Inclusions Event - Menschen feiern gemeinsam"
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
                Werde Teil der Bewegung!
              </h1>
              <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto [text-shadow:_1px_1px_4px_rgb(0_0_0_/_80%)]">
                Verpasse keine Momente. Erhalte exklusive Updates zu unseren Events, DJs und der Inclusions-Community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Warum anmelden */}
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

      {/* Anmeldeformular */}
      <section className="rounded-3xl bg-white/10 p-8 md:p-12 space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold">Jetzt anmelden – es dauert nur 30 Sekunden</h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
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
                  errors.vorname ? "border-red-500" : "border-white/20"
                } text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-brand-pink`}
                placeholder="Dein Vorname"
              />
              {errors.vorname && (
                <p className="mt-1 text-sm text-red-400">{errors.vorname}</p>
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
                  errors.nachname ? "border-red-500" : "border-white/20"
                } text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-brand-pink`}
                placeholder="Dein Nachname"
              />
              {errors.nachname && (
                <p className="mt-1 text-sm text-red-400">{errors.nachname}</p>
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
                errors.email ? "border-red-500" : "border-white/20"
              } text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-brand-pink`}
              placeholder="deine.email@beispiel.ch"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-400">{errors.email}</p>
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
                  className="w-5 h-5 text-brand-pink bg-white/10 border-white/20 focus:ring-brand-pink focus:ring-2"
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
                  className="w-5 h-5 text-brand-pink bg-white/10 border-white/20 focus:ring-brand-pink focus:ring-2"
                />
                <span className="ml-3 text-white/90">Nein</span>
              </label>
            </div>
            {errors.beeintraechtigung && (
              <p className="mt-1 text-sm text-red-400">{errors.beeintraechtigung}</p>
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
                    className="w-5 h-5 text-brand-pink bg-white/10 border-white/20 rounded focus:ring-brand-pink focus:ring-2"
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
              className="w-full rounded-full bg-brand-pink px-8 py-4 text-lg font-semibold text-black hover:bg-brand-pink/90 transition-colors shadow-lg"
            >
              Jetzt kostenlos anmelden
            </button>
            <p className="mt-3 text-sm text-white/60 text-center">
              Du kannst dich jederzeit wieder abmelden. Wir respektieren deine Privatsphäre.
            </p>
          </div>
        </form>
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


