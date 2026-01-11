"use client";

import { useState } from "react";
import { FormNotification } from "@/components/FormNotification";

type SubmitStatus = "idle" | "success" | "error";

export default function NewsletterPage() {
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
    if (errors.interessiert) {
      setErrors((prev) => ({ ...prev, interessiert: "" }));
    }
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
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Bitte gib eine gültige E-Mail-Adresse ein";
    }
    if (!formData.beeintraechtigung) {
      newErrors.beeintraechtigung = "Bitte wähle eine Option";
    }
    if (formData.interessiert.length === 0) {
      newErrors.interessiert = "Bitte wähle mindestens eine Option";
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
    <main className="min-h-screen max-w-3xl px-4 py-12 mx-auto space-y-10 text-white">
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

      <section>
        <h1 className="text-4xl font-bold">Newsletter & Datenbank</h1>
        <p className="mt-3 text-lg text-white/70">
          Melde dich für den Newsletter an und bleib über unsere Events und Aktivitäten informiert. 
          Deine Daten helfen uns, die Inclusions-Community aufzubauen und dich gezielt anzusprechen.
        </p>
      </section>

      <form onSubmit={handleSubmit} className="space-y-8">
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
              <span className="ml-3">Ja</span>
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
              <span className="ml-3">Nein</span>
            </label>
          </div>
          {errors.beeintraechtigung && (
            <p className="mt-1 text-sm text-red-400">{errors.beeintraechtigung}</p>
          )}
        </div>

        {/* Interessen */}
        <div>
          <label className="block text-sm font-semibold mb-3">
            Ich möchte: <span className="text-brand-pink">*</span>
          </label>
          <div className="space-y-3">
            {[
              "Infos der nächsten Party",
              "Newsletter erhalten",
              "Bei Inclusions aktiv mitarbeiten",
              "Ein Gönner/Sponsor werden",
              "Ich bin von einer Institution und möchte mehr Informationen",
            ].map((option) => (
              <label key={option} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  value={option}
                  checked={formData.interessiert.includes(option)}
                  onChange={handleCheckboxChange}
                  className="w-5 h-5 text-brand-pink bg-white/10 border-white/20 rounded focus:ring-brand-pink focus:ring-2"
                />
                <span className="ml-3">{option}</span>
              </label>
            ))}
          </div>
          {errors.interessiert && (
            <p className="mt-1 text-sm text-red-400">{errors.interessiert}</p>
          )}
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full md:w-auto rounded-full bg-brand-pink px-8 py-4 text-lg font-semibold text-black hover:bg-brand-pink/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Wird gesendet..." : "Anmelden"}
        </button>
      </form>
    </main>
  );
}



