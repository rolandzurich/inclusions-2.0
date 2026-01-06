"use client";

import { useState } from "react";
import { FormNotification } from "@/components/FormNotification";

interface VIPData {
  vorname: string;
  nachname: string;
  adresse: string;
  email: string;
  telefon: string;
  alter: string;
  ivAusweis: string;
  beeintraechtigung: string;
  ankunftszeit: string;
  tixiTaxi: string;
  tixiAdresse: string;
  brauchtBetreuer: string;
  betreuerName: string;
  betreuerTelefon: string;
  besondereBeduerfnisse: string;
}

export default function VIPAnmeldungPage() {
  const [formData, setFormData] = useState({
    // Wer meldet an?
    anmeldungDurch: "selbst", // "selbst" oder "betreuer"
    
    // Betreuer-Daten (wenn Betreuer anmeldet)
    betreuerVorname: "",
    betreuerNachname: "",
    betreuerEmail: "",
    betreuerTelefon: "",
    
    // VIP-Daten (für selbst-Anmeldung oder Array für Betreuer)
    vips: [{
      vorname: "",
      nachname: "",
      adresse: "",
      email: "",
      telefon: "",
      alter: "",
      ivAusweis: "",
      beeintraechtigung: "",
      ankunftszeit: "",
      tixiTaxi: "nein",
      tixiAdresse: "",
      brauchtBetreuer: "nein",
      betreuerName: "",
      betreuerTelefon: "",
      besondereBeduerfnisse: "",
    }] as VIPData[],
    
    // Kontaktperson für Notfälle (optional, nur bei selbst-Anmeldung)
    kontaktpersonName: "",
    kontaktpersonTelefon: "",
    brauchtKontaktperson: "nein", // "ja" oder "nein"
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Wenn es ein VIP-Feld ist (mit vipIndex)
    if (name.startsWith("vip_")) {
      const [_, vipIndex, fieldName] = name.split("_");
      const index = parseInt(vipIndex);
      setFormData((prev) => ({
        ...prev,
        vips: prev.vips.map((vip, i) => 
          i === index ? { ...vip, [fieldName]: value } : vip
        )
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    
    // Fehler löschen
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Wenn es ein VIP-Feld ist (mit vipIndex)
    if (name.startsWith("vip_")) {
      const [_, vipIndex, fieldName] = name.split("_");
      const index = parseInt(vipIndex);
      setFormData((prev) => ({
        ...prev,
        vips: prev.vips.map((vip, i) => 
          i === index ? { ...vip, [fieldName]: value } : vip
        )
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      
      // Wenn Betreuer gewählt wird, automatisch Kontaktperson setzen
      if (name === "anmeldungDurch" && value === "betreuer") {
        setFormData((prev) => ({
          ...prev,
          brauchtKontaktperson: "nein", // Wird automatisch durch Betreuer-Daten gefüllt
        }));
      }
    }
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const addVIP = () => {
    setFormData((prev) => ({
      ...prev,
      vips: [...prev.vips, {
        vorname: "",
        nachname: "",
        adresse: "",
        email: "",
        telefon: "",
        alter: "",
        ivAusweis: "",
        beeintraechtigung: "",
        ankunftszeit: "",
        tixiTaxi: "nein",
        tixiAdresse: "",
        brauchtBetreuer: "nein",
        betreuerName: "",
        betreuerTelefon: "",
        besondereBeduerfnisse: "",
      }]
    }));
  };

  const removeVIP = (index: number) => {
    if (formData.vips.length > 1) {
      setFormData((prev) => ({
        ...prev,
        vips: prev.vips.filter((_, i) => i !== index)
      }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    // Betreuer-Daten (wenn Betreuer anmeldet)
    if (formData.anmeldungDurch === "betreuer") {
      if (!formData.betreuerVorname.trim()) {
        newErrors.betreuerVorname = "Vorname des/der Betreuer:in ist erforderlich";
      }
      if (!formData.betreuerNachname.trim()) {
        newErrors.betreuerNachname = "Nachname des/der Betreuer:in ist erforderlich";
      }
      if (!formData.betreuerEmail.trim()) {
        newErrors.betreuerEmail = "E-Mail des/der Betreuer:in ist erforderlich";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.betreuerEmail)) {
        newErrors.betreuerEmail = "Bitte gib eine gültige E-Mail-Adresse ein";
      }
      if (!formData.betreuerTelefon.trim()) {
        newErrors.betreuerTelefon = "Telefonnummer des/der Betreuer:in ist erforderlich";
      }
    }

    // Kontaktperson (nur bei selbst-Anmeldung)
    if (formData.anmeldungDurch === "selbst" && formData.brauchtKontaktperson === "ja") {
      if (!formData.kontaktpersonName.trim()) {
        newErrors.kontaktpersonName = "Name der Kontaktperson ist erforderlich";
      }
      if (!formData.kontaktpersonTelefon.trim()) {
        newErrors.kontaktpersonTelefon = "Telefonnummer der Kontaktperson ist erforderlich";
      }
    }

    // VIP-Daten validieren (für alle VIPs)
    formData.vips.forEach((vip, index) => {
      if (!vip.vorname.trim()) {
        newErrors[`vip_${index}_vorname`] = "Vorname ist erforderlich";
      }
      if (!vip.nachname.trim()) {
        newErrors[`vip_${index}_nachname`] = "Nachname ist erforderlich";
      }
      if (!vip.adresse.trim()) {
        newErrors[`vip_${index}_adresse`] = "Adresse ist erforderlich";
      }
      if (!vip.email.trim()) {
        newErrors[`vip_${index}_email`] = "E-Mail ist erforderlich";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(vip.email)) {
        newErrors[`vip_${index}_email`] = "Bitte gib eine gültige E-Mail-Adresse ein";
      }
      if (!vip.telefon.trim()) {
        newErrors[`vip_${index}_telefon`] = "Telefonnummer ist erforderlich";
      }
      if (!vip.alter) {
        newErrors[`vip_${index}_alter`] = "Alter ist erforderlich";
      } else if (parseInt(vip.alter) < 20) {
        newErrors[`vip_${index}_alter`] = "Du musst mindestens 20 Jahre alt sein";
      }
      if (!vip.ivAusweis) {
        newErrors[`vip_${index}_ivAusweis`] = "Bitte gib an, ob ein IV-Ausweis vorhanden ist";
      }
      if (!vip.beeintraechtigung) {
        newErrors[`vip_${index}_beeintraechtigung`] = "Bitte gib an, ob eine Beeinträchtigung vorhanden ist";
      }
      if (!vip.ankunftszeit) {
        newErrors[`vip_${index}_ankunftszeit`] = "Bitte wähle eine Ankunftszeit";
      }

      // TIXI-Taxi Adresse (wenn benötigt)
      if (vip.tixiTaxi === "ja" && !vip.tixiAdresse.trim()) {
        newErrors[`vip_${index}_tixiAdresse`] = "Bitte gib die Abholadresse an";
      }

      // Betreuer (wenn benötigt)
      if (vip.brauchtBetreuer === "ja") {
        if (!vip.betreuerName.trim()) {
          newErrors[`vip_${index}_betreuerName`] = "Name des/der Betreuer:in ist erforderlich";
        }
        if (!vip.betreuerTelefon.trim()) {
          newErrors[`vip_${index}_betreuerTelefon`] = "Telefonnummer des/der Betreuer:in ist erforderlich";
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    
    if (!validate()) {
      setSubmitError('Bitte fülle alle erforderlichen Felder aus.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Für jede VIP-Anmeldung einen Request senden
      const promises = formData.vips.map(async (vip) => {
        const response = await fetch('/api/vip', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: `${vip.vorname} ${vip.nachname}`.trim(),
            email: vip.email,
            phone: vip.telefon,
            event_date: '2026-04-25', // Inclusions 2 Event
            event_location: 'Supermarket, Zürich',
            message: `VIP-Anmeldung${formData.anmeldungDurch === 'betreuer' ? ' (durch Betreuer)' : ''}\n\n` +
              `Alter: ${vip.alter}\n` +
              `IV-Ausweis: ${vip.ivAusweis}\n` +
              `Beeinträchtigung: ${vip.beeintraechtigung}\n` +
              `Ankunftszeit: ${vip.ankunftszeit}\n` +
              `TIXI-Taxi: ${vip.tixiTaxi === 'ja' ? `Ja, Adresse: ${vip.tixiAdresse}` : 'Nein'}\n` +
              `Betreuer benötigt: ${vip.brauchtBetreuer === 'ja' ? `Ja, Name: ${vip.betreuerName}, Tel: ${vip.betreuerTelefon}` : 'Nein'}\n` +
              (vip.besondereBeduerfnisse ? `Besondere Bedürfnisse: ${vip.besondereBeduerfnisse}\n` : '') +
              (formData.anmeldungDurch === 'betreuer' ? `\nBetreuer: ${formData.betreuerVorname} ${formData.betreuerNachname}, Email: ${formData.betreuerEmail}, Tel: ${formData.betreuerTelefon}` : '') +
              (formData.brauchtKontaktperson === 'ja' ? `\nKontaktperson: ${formData.kontaktpersonName}, Tel: ${formData.kontaktpersonTelefon}` : ''),
            honeypot: '', // Honeypot-Feld
          }),
        });

        const result = await response.json();
        return { success: response.ok && result.success, result };
      });

      const results = await Promise.all(promises);
      const allSuccess = results.every(r => r.success);

      if (allSuccess) {
        const message = formData.anmeldungDurch === "betreuer" 
          ? `Vielen Dank für die Anmeldung von ${formData.vips.length} VIP${formData.vips.length > 1 ? 's' : ''}! Wir melden uns bald bei dir.`
          : "Vielen Dank für deine VIP-Anmeldung! Wir melden uns bald bei dir.";
        setNotification({
          type: "success",
          message: message,
        });
        
        // Formular zurücksetzen
        setFormData({
          anmeldungDurch: "selbst",
          betreuerVorname: "",
          betreuerNachname: "",
          betreuerEmail: "",
          betreuerTelefon: "",
          vips: [{
            vorname: "",
            nachname: "",
            adresse: "",
            email: "",
            telefon: "",
            alter: "",
            ivAusweis: "",
            beeintraechtigung: "",
            ankunftszeit: "",
            tixiTaxi: "nein",
            tixiAdresse: "",
            brauchtBetreuer: "nein",
            betreuerName: "",
            betreuerTelefon: "",
            besondereBeduerfnisse: "",
          }],
          kontaktpersonName: "",
          kontaktpersonTelefon: "",
          brauchtKontaktperson: "nein",
        });
        setSubmitError(null);
      } else {
        const errorMessage = results.find(r => !r.success)?.result?.message || 'Fehler bei der Anmeldung. Bitte versuche es erneut.';
        setSubmitError(errorMessage);
        setNotification({
          type: "error",
          message: errorMessage,
        });
      }
    } catch (error) {
      console.error('Error submitting VIP form:', error);
      const errorMessage = error instanceof Error ? error.message : 'Fehler bei der Anmeldung. Bitte versuche es erneut.';
      setSubmitError(errorMessage);
      setNotification({
        type: "error",
        message: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen max-w-3xl px-4 py-12 mx-auto space-y-10 text-white">
      {notification && (
        <FormNotification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <section>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-pink text-white text-sm font-semibold mb-4">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          VIP-Anmeldung
        </div>
        <h1 className="text-4xl font-bold">VIP-Anmeldung für Inclusions 2</h1>
        <p className="mt-3 text-lg text-white/70">
          Du hast einen IV-Ausweis, eine Beeinträchtigung oder Behinderung? Dann melde dich hier als VIP-Gast an! 
          Die Anmeldung ist wichtig, damit wir sicherstellen können, dass du gratis reinkommst und unser Helfer-Team 
          dich unterstützen kann, wenn du es brauchst.
        </p>
        
        <div className="mt-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <p className="text-sm text-white/90 mb-2">
            <strong className="text-white">Wichtig:</strong>
          </p>
          <ul className="text-sm text-white/80 space-y-1 list-disc list-inside">
            <li><strong>Anmeldung im Vorfeld erforderlich</strong></li>
            <li><strong>Du musst mindestens 20 Jahre alt sein</strong></li>
            <li>Betreuer kommen nur gratis, wenn du auf 1-zu-1 Betreuung angewiesen bist</li>
            <li>Nur <span className="whitespace-nowrap">VIPs</span> kommen gratis rein – Freunde, Familie und Betreuer laden wir ein, ein Ticket zu kaufen, um den <span className="whitespace-nowrap">VIP's</span> den gratis Eintritt zu ermöglichen. <a href="https://supermarket.li" target="_blank" rel="noopener noreferrer" className="text-brand-pink hover:underline">Link zum Ticketkauf</a></li>
          </ul>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Wer meldet an? */}
        <div className="rounded-2xl bg-white/5 p-6 border border-white/10">
          <h2 className="text-xl font-semibold mb-4">Wer meldet an?</h2>
          <div className="space-y-3">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="anmeldungDurch"
                value="selbst"
                checked={formData.anmeldungDurch === "selbst"}
                onChange={handleRadioChange}
                className="w-5 h-5 text-brand-pink bg-white/10 border-white/20 focus:ring-brand-pink focus:ring-2"
              />
              <span className="ml-3">Ich melde mich selbst an</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="anmeldungDurch"
                value="betreuer"
                checked={formData.anmeldungDurch === "betreuer"}
                onChange={handleRadioChange}
                className="w-5 h-5 text-brand-pink bg-white/10 border-white/20 focus:ring-brand-pink focus:ring-2"
              />
              <span className="ml-3">Ich melde als Betreuer:in an</span>
            </label>
          </div>
        </div>

        {/* Betreuer-Daten (wenn Betreuer anmeldet) */}
        {formData.anmeldungDurch === "betreuer" && (
          <div className="rounded-2xl bg-white/5 p-6 border border-white/10">
            <h2 className="text-xl font-semibold mb-4">Daten des/der Betreuer:in</h2>
            <p className="text-sm text-white/70 mb-4">
              Bitte gib zuerst deine eigenen Daten an. Diese werden auch als Notfallkontakt für alle angemeldeten VIPs verwendet.
            </p>
            
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="betreuerVorname" className="block text-sm font-semibold mb-2">
                    Vorname <span className="text-brand-pink">*</span>
                  </label>
                  <input
                    type="text"
                    id="betreuerVorname"
                    name="betreuerVorname"
                    value={formData.betreuerVorname}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg bg-white/10 border ${
                      errors.betreuerVorname ? "border-red-500" : "border-white/20"
                    } text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-brand-pink`}
                    placeholder="Vorname"
                  />
                  {errors.betreuerVorname && (
                    <p className="mt-1 text-sm text-red-400">{errors.betreuerVorname}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="betreuerNachname" className="block text-sm font-semibold mb-2">
                    Nachname <span className="text-brand-pink">*</span>
                  </label>
                  <input
                    type="text"
                    id="betreuerNachname"
                    name="betreuerNachname"
                    value={formData.betreuerNachname}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg bg-white/10 border ${
                      errors.betreuerNachname ? "border-red-500" : "border-white/20"
                    } text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-brand-pink`}
                    placeholder="Nachname"
                  />
                  {errors.betreuerNachname && (
                    <p className="mt-1 text-sm text-red-400">{errors.betreuerNachname}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="betreuerEmail" className="block text-sm font-semibold mb-2">
                    E-Mail <span className="text-brand-pink">*</span>
                  </label>
                  <input
                    type="email"
                    id="betreuerEmail"
                    name="betreuerEmail"
                    value={formData.betreuerEmail}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg bg-white/10 border ${
                      errors.betreuerEmail ? "border-red-500" : "border-white/20"
                    } text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-brand-pink`}
                    placeholder="email@beispiel.ch"
                  />
                  {errors.betreuerEmail && (
                    <p className="mt-1 text-sm text-red-400">{errors.betreuerEmail}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="betreuerTelefon" className="block text-sm font-semibold mb-2">
                    Telefonnummer <span className="text-brand-pink">*</span>
                  </label>
                  <input
                    type="tel"
                    id="betreuerTelefon"
                    name="betreuerTelefon"
                    value={formData.betreuerTelefon}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg bg-white/10 border ${
                      errors.betreuerTelefon ? "border-red-500" : "border-white/20"
                    } text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-brand-pink`}
                    placeholder="+41 XX XXX XX XX"
                  />
                  {errors.betreuerTelefon && (
                    <p className="mt-1 text-sm text-red-400">{errors.betreuerTelefon}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}


        {/* Kontaktperson für Notfälle (nur bei selbst-Anmeldung) */}
        {formData.anmeldungDurch === "selbst" && (
        <div className="rounded-2xl bg-white/5 p-6 border border-white/10">
          <h2 className="text-xl font-semibold mb-4">Kontaktperson für Notfälle</h2>
          <p className="text-sm text-white/70 mb-4">
            Falls du selbständig bist und keine Kontaktperson brauchst, kannst du diesen Abschnitt überspringen.
          </p>
          
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-3">
              Brauchst du eine Kontaktperson für Notfälle?
            </label>
            <div className="space-y-2">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="brauchtKontaktperson"
                  value="ja"
                  checked={formData.brauchtKontaktperson === "ja"}
                  onChange={handleRadioChange}
                  className="w-5 h-5 text-brand-pink bg-white/10 border-white/20 focus:ring-brand-pink focus:ring-2"
                />
                <span className="ml-3">Ja</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="brauchtKontaktperson"
                  value="nein"
                  checked={formData.brauchtKontaktperson === "nein"}
                  onChange={handleRadioChange}
                  className="w-5 h-5 text-brand-pink bg-white/10 border-white/20 focus:ring-brand-pink focus:ring-2"
                />
                <span className="ml-3">Nein</span>
              </label>
            </div>
          </div>

          {formData.brauchtKontaktperson === "ja" && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="kontaktpersonName" className="block text-sm font-semibold mb-2">
                    Name <span className="text-brand-pink">*</span>
                  </label>
                  <input
                    type="text"
                    id="kontaktpersonName"
                    name="kontaktpersonName"
                    value={formData.kontaktpersonName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg bg-white/10 border ${
                      errors.kontaktpersonName ? "border-red-500" : "border-white/20"
                    } text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-brand-pink`}
                    placeholder="Name der Kontaktperson"
                  />
                  {errors.kontaktpersonName && (
                    <p className="mt-1 text-sm text-red-400">{errors.kontaktpersonName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="kontaktpersonTelefon" className="block text-sm font-semibold mb-2">
                    Telefonnummer <span className="text-brand-pink">*</span>
                  </label>
                  <input
                    type="tel"
                    id="kontaktpersonTelefon"
                    name="kontaktpersonTelefon"
                    value={formData.kontaktpersonTelefon}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg bg-white/10 border ${
                      errors.kontaktpersonTelefon ? "border-red-500" : "border-white/20"
                    } text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-brand-pink`}
                    placeholder="+41 XX XXX XX XX"
                  />
                  {errors.kontaktpersonTelefon && (
                    <p className="mt-1 text-sm text-red-400">{errors.kontaktpersonTelefon}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        )}

        {/* VIP-Daten - für alle VIPs */}
        {formData.vips.map((vip, vipIndex) => (
          <div key={vipIndex} className="rounded-2xl bg-white/5 p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                {formData.anmeldungDurch === "betreuer" 
                  ? `VIP ${vipIndex + 1} - Daten des VIP-Gasts`
                  : "Daten des VIP-Gasts"}
              </h2>
              {formData.anmeldungDurch === "betreuer" && formData.vips.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeVIP(vipIndex)}
                  className="px-3 py-1 text-sm text-red-400 hover:text-red-300 border border-red-400/30 rounded-lg hover:bg-red-400/10 transition-colors"
                >
                  Entfernen
                </button>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor={`vip_${vipIndex}_vorname`} className="block text-sm font-semibold mb-2">
                    Vorname <span className="text-brand-pink">*</span>
                  </label>
                  <input
                    type="text"
                    id={`vip_${vipIndex}_vorname`}
                    name={`vip_${vipIndex}_vorname`}
                    value={vip.vorname}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg bg-white/10 border ${
                      errors[`vip_${vipIndex}_vorname`] ? "border-red-500" : "border-white/20"
                    } text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-brand-pink`}
                    placeholder="Vorname"
                  />
                  {errors[`vip_${vipIndex}_vorname`] && (
                    <p className="mt-1 text-sm text-red-400">{errors[`vip_${vipIndex}_vorname`]}</p>
                  )}
                </div>

                <div>
                  <label htmlFor={`vip_${vipIndex}_nachname`} className="block text-sm font-semibold mb-2">
                    Nachname <span className="text-brand-pink">*</span>
                  </label>
                  <input
                    type="text"
                    id={`vip_${vipIndex}_nachname`}
                    name={`vip_${vipIndex}_nachname`}
                    value={vip.nachname}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg bg-white/10 border ${
                      errors[`vip_${vipIndex}_nachname`] ? "border-red-500" : "border-white/20"
                    } text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-brand-pink`}
                    placeholder="Nachname"
                  />
                  {errors[`vip_${vipIndex}_nachname`] && (
                    <p className="mt-1 text-sm text-red-400">{errors[`vip_${vipIndex}_nachname`]}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor={`vip_${vipIndex}_adresse`} className="block text-sm font-semibold mb-2">
                  Adresse <span className="text-brand-pink">*</span>
                </label>
                <input
                  type="text"
                  id={`vip_${vipIndex}_adresse`}
                  name={`vip_${vipIndex}_adresse`}
                  value={vip.adresse}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg bg-white/10 border ${
                    errors[`vip_${vipIndex}_adresse`] ? "border-red-500" : "border-white/20"
                  } text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-brand-pink`}
                  placeholder="Strasse, PLZ Ort"
                />
                {errors[`vip_${vipIndex}_adresse`] && (
                  <p className="mt-1 text-sm text-red-400">{errors[`vip_${vipIndex}_adresse`]}</p>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor={`vip_${vipIndex}_email`} className="block text-sm font-semibold mb-2">
                    E-Mail <span className="text-brand-pink">*</span>
                  </label>
                  <input
                    type="email"
                    id={`vip_${vipIndex}_email`}
                    name={`vip_${vipIndex}_email`}
                    value={vip.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg bg-white/10 border ${
                      errors[`vip_${vipIndex}_email`] ? "border-red-500" : "border-white/20"
                    } text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-brand-pink`}
                    placeholder="email@beispiel.ch"
                  />
                  {errors[`vip_${vipIndex}_email`] && (
                    <p className="mt-1 text-sm text-red-400">{errors[`vip_${vipIndex}_email`]}</p>
                  )}
                </div>

                <div>
                  <label htmlFor={`vip_${vipIndex}_telefon`} className="block text-sm font-semibold mb-2">
                    Telefonnummer <span className="text-brand-pink">*</span>
                  </label>
                  <input
                    type="tel"
                    id={`vip_${vipIndex}_telefon`}
                    name={`vip_${vipIndex}_telefon`}
                    value={vip.telefon}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg bg-white/10 border ${
                      errors[`vip_${vipIndex}_telefon`] ? "border-red-500" : "border-white/20"
                    } text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-brand-pink`}
                    placeholder="+41 XX XXX XX XX"
                  />
                  {errors[`vip_${vipIndex}_telefon`] && (
                    <p className="mt-1 text-sm text-red-400">{errors[`vip_${vipIndex}_telefon`]}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor={`vip_${vipIndex}_alter`} className="block text-sm font-semibold mb-2">
                    Alter <span className="text-brand-pink">*</span>
                  </label>
                  <input
                    type="number"
                    id={`vip_${vipIndex}_alter`}
                    name={`vip_${vipIndex}_alter`}
                    min="20"
                    value={vip.alter}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg bg-white/10 border ${
                      errors[`vip_${vipIndex}_alter`] ? "border-red-500" : "border-white/20"
                    } text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-brand-pink`}
                    placeholder="20"
                  />
                  {errors[`vip_${vipIndex}_alter`] && (
                    <p className="mt-1 text-sm text-red-400">{errors[`vip_${vipIndex}_alter`]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Hast du einen IV-Ausweis? <span className="text-brand-pink">*</span>
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name={`vip_${vipIndex}_ivAusweis`}
                        value="ja"
                        checked={vip.ivAusweis === "ja"}
                        onChange={handleRadioChange}
                        className="w-5 h-5 text-brand-pink bg-white/10 border-white/20 focus:ring-brand-pink focus:ring-2"
                      />
                      <span className="ml-3">Ja</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name={`vip_${vipIndex}_ivAusweis`}
                        value="nein"
                        checked={vip.ivAusweis === "nein"}
                        onChange={handleRadioChange}
                        className="w-5 h-5 text-brand-pink bg-white/10 border-white/20 focus:ring-brand-pink focus:ring-2"
                      />
                      <span className="ml-3">Nein</span>
                    </label>
                  </div>
                  {errors[`vip_${vipIndex}_ivAusweis`] && (
                    <p className="mt-1 text-sm text-red-400">{errors[`vip_${vipIndex}_ivAusweis`]}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Hast du eine Beeinträchtigung/Behinderung? <span className="text-brand-pink">*</span>
                </label>
                <div className="space-y-2">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name={`vip_${vipIndex}_beeintraechtigung`}
                      value="ja"
                      checked={vip.beeintraechtigung === "ja"}
                      onChange={handleRadioChange}
                      className="w-5 h-5 text-brand-pink bg-white/10 border-white/20 focus:ring-brand-pink focus:ring-2"
                    />
                    <span className="ml-3">Ja</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name={`vip_${vipIndex}_beeintraechtigung`}
                      value="nein"
                      checked={vip.beeintraechtigung === "nein"}
                      onChange={handleRadioChange}
                      className="w-5 h-5 text-brand-pink bg-white/10 border-white/20 focus:ring-brand-pink focus:ring-2"
                    />
                    <span className="ml-3">Nein</span>
                  </label>
                </div>
                {errors[`vip_${vipIndex}_beeintraechtigung`] && (
                  <p className="mt-1 text-sm text-red-400">{errors[`vip_${vipIndex}_beeintraechtigung`]}</p>
                )}
              </div>

              {/* Event-Details für diesen VIP */}
              <div className="pt-4 border-t border-white/10">
                <h3 className="text-lg font-semibold mb-4">Event-Details</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor={`vip_${vipIndex}_ankunftszeit`} className="block text-sm font-semibold mb-2">
                      Wann möchtest du kommen? <span className="text-brand-pink">*</span>
                    </label>
                    <select
                      id={`vip_${vipIndex}_ankunftszeit`}
                      name={`vip_${vipIndex}_ankunftszeit`}
                      value={vip.ankunftszeit}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-lg bg-white/10 border ${
                        errors[`vip_${vipIndex}_ankunftszeit`] ? "border-red-500" : "border-white/20"
                      } text-white focus:outline-none focus:ring-2 focus:ring-brand-pink`}
                    >
                      <option value="">-- Bitte wählen --</option>
                      <option value="13-17">13:00 - 17:00 Uhr</option>
                      <option value="17-21">17:00 - 21:00 Uhr</option>
                      <option value="ganze-zeit">Ganze Zeit (13:00 - 21:00 Uhr)</option>
                    </select>
                    {errors[`vip_${vipIndex}_ankunftszeit`] && (
                      <p className="mt-1 text-sm text-red-400">{errors[`vip_${vipIndex}_ankunftszeit`]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-3">
                      Möchtest du von TIXI-Taxi abgeholt werden?
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name={`vip_${vipIndex}_tixiTaxi`}
                          value="ja"
                          checked={vip.tixiTaxi === "ja"}
                          onChange={handleRadioChange}
                          className="w-5 h-5 text-brand-pink bg-white/10 border-white/20 focus:ring-brand-pink focus:ring-2"
                        />
                        <span className="ml-3">Ja</span>
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name={`vip_${vipIndex}_tixiTaxi`}
                          value="nein"
                          checked={vip.tixiTaxi === "nein"}
                          onChange={handleRadioChange}
                          className="w-5 h-5 text-brand-pink bg-white/10 border-white/20 focus:ring-brand-pink focus:ring-2"
                        />
                        <span className="ml-3">Nein</span>
                      </label>
                    </div>
                    
                    {vip.tixiTaxi === "ja" && (
                      <div className="mt-4">
                        <label htmlFor={`vip_${vipIndex}_tixiAdresse`} className="block text-sm font-semibold mb-2">
                          Abholadresse <span className="text-brand-pink">*</span>
                        </label>
                        <input
                          type="text"
                          id={`vip_${vipIndex}_tixiAdresse`}
                          name={`vip_${vipIndex}_tixiAdresse`}
                          value={vip.tixiAdresse}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 rounded-lg bg-white/10 border ${
                            errors[`vip_${vipIndex}_tixiAdresse`] ? "border-red-500" : "border-white/20"
                          } text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-brand-pink`}
                          placeholder="Strasse, PLZ Ort"
                        />
                        {errors[`vip_${vipIndex}_tixiAdresse`] && (
                          <p className="mt-1 text-sm text-red-400">{errors[`vip_${vipIndex}_tixiAdresse`]}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Betreuer für diesen VIP */}
              <div className="pt-4 border-t border-white/10">
                <h3 className="text-lg font-semibold mb-4">Betreuer:in</h3>
                <p className="text-sm text-white/70 mb-4">
                  Falls der/die VIP im Alltag auf eine 1-zu-1 Betreuung angewiesen ist, ist der/die Betreuer:in auch ein VIP 
                  und kommt gratis rein. Andere Betreuer:innen müssen ein Ticket kaufen.
                </p>
                
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-3">
                    Braucht der/die VIP einen Betreuer:in, der/die mitkommen muss?
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name={`vip_${vipIndex}_brauchtBetreuer`}
                        value="ja"
                        checked={vip.brauchtBetreuer === "ja"}
                        onChange={handleRadioChange}
                        className="w-5 h-5 text-brand-pink bg-white/10 border-white/20 focus:ring-brand-pink focus:ring-2"
                      />
                      <span className="ml-3">Ja</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name={`vip_${vipIndex}_brauchtBetreuer`}
                        value="nein"
                        checked={vip.brauchtBetreuer === "nein"}
                        onChange={handleRadioChange}
                        className="w-5 h-5 text-brand-pink bg-white/10 border-white/20 focus:ring-brand-pink focus:ring-2"
                      />
                      <span className="ml-3">Nein</span>
                    </label>
                  </div>
                </div>

                {vip.brauchtBetreuer === "ja" && (
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label htmlFor={`vip_${vipIndex}_betreuerName`} className="block text-sm font-semibold mb-2">
                          Name des/der Betreuer:in <span className="text-brand-pink">*</span>
                        </label>
                        <input
                          type="text"
                          id={`vip_${vipIndex}_betreuerName`}
                          name={`vip_${vipIndex}_betreuerName`}
                          value={vip.betreuerName}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 rounded-lg bg-white/10 border ${
                            errors[`vip_${vipIndex}_betreuerName`] ? "border-red-500" : "border-white/20"
                          } text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-brand-pink`}
                          placeholder="Name des/der Betreuer:in"
                        />
                        {errors[`vip_${vipIndex}_betreuerName`] && (
                          <p className="mt-1 text-sm text-red-400">{errors[`vip_${vipIndex}_betreuerName`]}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor={`vip_${vipIndex}_betreuerTelefon`} className="block text-sm font-semibold mb-2">
                          Telefonnummer <span className="text-brand-pink">*</span>
                        </label>
                        <input
                          type="tel"
                          id={`vip_${vipIndex}_betreuerTelefon`}
                          name={`vip_${vipIndex}_betreuerTelefon`}
                          value={vip.betreuerTelefon}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 rounded-lg bg-white/10 border ${
                            errors[`vip_${vipIndex}_betreuerTelefon`] ? "border-red-500" : "border-white/20"
                          } text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-brand-pink`}
                          placeholder="+41 XX XXX XX XX"
                        />
                        {errors[`vip_${vipIndex}_betreuerTelefon`] && (
                          <p className="mt-1 text-sm text-red-400">{errors[`vip_${vipIndex}_betreuerTelefon`]}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Besondere Bedürfnisse für diesen VIP */}
              <div className="pt-4 border-t border-white/10">
                <h3 className="text-lg font-semibold mb-4">Besondere Bedürfnisse</h3>
                <p className="text-sm text-white/70 mb-4">
                  Gibt es wichtige Informationen, die unser Helfer-Team wissen sollte?
                </p>
                <textarea
                  id={`vip_${vipIndex}_besondereBeduerfnisse`}
                  name={`vip_${vipIndex}_besondereBeduerfnisse`}
                  value={vip.besondereBeduerfnisse}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-brand-pink"
                  placeholder="Z.B. spezielle Bedürfnisse, Allergien, wichtige Hinweise..."
                />
              </div>
            </div>
          </div>
        ))}

        {/* Button zum Hinzufügen weiterer VIPs (nur bei Betreuer-Anmeldung) */}
        {formData.anmeldungDurch === "betreuer" && (
          <button
            type="button"
            onClick={addVIP}
            className="w-full rounded-full bg-white/10 border border-white/20 px-8 py-4 text-lg font-semibold text-white hover:bg-white/20 transition-colors"
          >
            + Weitere/n VIP hinzufügen
          </button>
        )}


        {/* Hinweis zu Tickets */}
        <div className="rounded-xl bg-yellow-500/10 border border-yellow-500/20 p-4">
          <p className="text-sm text-white/90">
            <strong className="text-white">Wichtig:</strong> Nur <span className="whitespace-nowrap">VIPs</span> kommen gratis rein. Freunde, Familie 
            und Betreuer laden wir ein, ein Ticket zu kaufen, um den <span className="whitespace-nowrap">VIP's</span> den gratis Eintritt zu ermöglichen. 
            Betreuer kommen nur gratis, wenn du auf 1-zu-1 Betreuung angewiesen bist. 
            <a href="https://supermarket.li" target="_blank" rel="noopener noreferrer" className="text-brand-pink hover:underline ml-1">Link zum Ticketkauf</a>
          </p>
        </div>


        {/* Submit Button */}
        {/* Honeypot - für Bots unsichtbar */}
        <input
          type="text"
          name="website"
          style={{ display: 'none' }}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-full bg-brand-pink px-8 py-4 text-lg font-semibold text-black hover:bg-brand-pink/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Wird gesendet...' : 'VIP-Anmeldung absenden'}
        </button>
      </form>
    </main>
  );
}




