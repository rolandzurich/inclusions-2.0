'use client';

import { useState } from 'react';

type Step = 'email' | 'login' | 'setup' | 'forgot';

export default function CrewLoginPage() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Schritt 1: E-Mail prüfen
  async function handleEmailCheck(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!data.exists) {
        setError('Kein Konto gefunden. Bitte einen Admin kontaktieren, um eingeladen zu werden.');
        setLoading(false);
        return;
      }

      if (data.status === 'disabled') {
        setError('Dein Konto ist deaktiviert. Bitte einen Admin kontaktieren.');
        setLoading(false);
        return;
      }

      setUserName(data.name || '');

      if (data.status === 'pending') {
        // Noch kein Passwort gesetzt → Setup
        setStep('setup');
      } else {
        // Aktiver Account → Login
        setStep('login');
      }
    } catch {
      setError('Verbindungsfehler. Bitte versuche es erneut.');
    } finally {
      setLoading(false);
    }
  }

  // Schritt 2a: Login (aktiver Account)
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Anmeldung fehlgeschlagen.');
        setLoading(false);
        return;
      }

      // Weiterleitung basierend auf Rolle
      if (data.user?.role === 'admin') {
        window.location.href = '/admin-v2/dashboard';
      } else {
        window.location.href = '/crew';
      }
    } catch {
      setError('Verbindungsfehler.');
      setLoading(false);
    }
  }

  // Schritt 2b: Passwort setzen (eingeladener Account)
  async function handleSetup(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== passwordConfirm) {
      setError('Die Passwörter stimmen nicht überein.');
      return;
    }

    if (password.length < 8) {
      setError('Passwort muss mindestens 8 Zeichen lang sein.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/setup-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Fehler beim Einrichten.');
        setLoading(false);
        return;
      }

      // Erfolgreich → weiterleiten
      if (data.user?.role === 'admin') {
        window.location.href = '/admin-v2/dashboard';
      } else {
        window.location.href = '/crew';
      }
    } catch {
      setError('Verbindungsfehler.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo + Titel */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg shadow-blue-500/25">
            I
          </div>
          <h1 className="text-2xl font-bold text-white">Inclusions Crew</h1>
          <p className="text-gray-400 mt-1 text-sm">Kalender & Events für das Team</p>
        </div>

        {/* === SCHRITT 1: E-Mail eingeben === */}
        {step === 'email' && (
          <form onSubmit={handleEmailCheck} className="bg-white rounded-2xl shadow-xl p-8 space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                E-Mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="deine@email.ch"
                required
                autoFocus
                autoComplete="email"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2.5 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50"
            >
              {loading ? 'Prüfe...' : 'Weiter'}
            </button>
          </form>
        )}

        {/* === SCHRITT 2a: Passwort eingeben (aktiver Account) === */}
        {step === 'login' && (
          <form onSubmit={handleLogin} className="bg-white rounded-2xl shadow-xl p-8 space-y-5">
            {userName && (
              <div className="text-center pb-2">
                <p className="text-sm text-gray-500">Willkommen zurück,</p>
                <p className="text-lg font-semibold text-gray-900">{userName}</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Passwort
                </label>
                <span className="text-xs text-gray-400">{email}</span>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoFocus
                autoComplete="current-password"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2.5 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50"
            >
              {loading ? 'Anmelden...' : 'Anmelden'}
            </button>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => { setStep('email'); setPassword(''); setError(''); }}
                className="text-sm text-gray-400 hover:text-gray-600"
              >
                ← Andere E-Mail
              </button>
              <button
                type="button"
                onClick={() => { setStep('forgot'); setPassword(''); setError(''); }}
                className="text-sm text-blue-500 hover:text-blue-700"
              >
                Passwort vergessen?
              </button>
            </div>
          </form>
        )}

        {/* === SCHRITT: Passwort vergessen === */}
        {step === 'forgot' && (
          <ForgotPasswordForm
            email={email}
            onBack={() => { setStep('login'); setError(''); }}
          />
        )}

        {/* === SCHRITT 2b: Passwort erstmalig setzen (eingeladener Account) === */}
        {step === 'setup' && (
          <form onSubmit={handleSetup} className="bg-white rounded-2xl shadow-xl p-8 space-y-5">
            <div className="text-center pb-2">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🎉</span>
              </div>
              <p className="text-sm text-gray-500">
                {userName ? `Hallo ${userName}!` : 'Willkommen!'}
              </p>
              <p className="text-lg font-semibold text-gray-900">
                Wähle dein Passwort
              </p>
              <p className="text-xs text-gray-400 mt-1">{email}</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Passwort
              </label>
              <input
                id="new-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mind. 8 Zeichen"
                required
                minLength={8}
                autoFocus
                autoComplete="new-password"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
              />
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Passwort bestätigen
              </label>
              <input
                id="confirm-password"
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="Nochmals eingeben"
                required
                minLength={8}
                autoComplete="new-password"
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400 ${
                  passwordConfirm && password !== passwordConfirm
                    ? 'border-red-300 bg-red-50'
                    : passwordConfirm && password === passwordConfirm
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-300'
                }`}
              />
              {passwordConfirm && password !== passwordConfirm && (
                <p className="text-xs text-red-500 mt-1">Passwörter stimmen nicht überein</p>
              )}
              {passwordConfirm && password === passwordConfirm && password.length >= 8 && (
                <p className="text-xs text-green-600 mt-1">Passwörter stimmen überein ✓</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || password !== passwordConfirm || password.length < 8}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2.5 rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Wird eingerichtet...' : 'Konto aktivieren'}
            </button>

            <button
              type="button"
              onClick={() => { setStep('email'); setPassword(''); setPasswordConfirm(''); setError(''); }}
              className="w-full text-sm text-gray-400 hover:text-gray-600 py-1"
            >
              ← Andere E-Mail
            </button>
          </form>
        )}

        <p className="text-center text-gray-500 text-xs mt-6">
          Zugang nur für eingeladene Team-Mitglieder.
        </p>
      </div>
    </div>
  );
}

// === Passwort-vergessen Formular ===
function ForgotPasswordForm({
  email,
  onBack,
}: {
  email: string;
  onBack: () => void;
}) {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Fehler beim Senden.');
        setLoading(false);
        return;
      }

      setSent(true);
    } catch {
      setError('Verbindungsfehler.');
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
          <span className="text-2xl">📧</span>
        </div>
        <h2 className="text-lg font-bold text-gray-900">E-Mail gesendet</h2>
        <p className="text-sm text-gray-500">
          Falls ein Konto mit <strong>{email}</strong> existiert, haben wir einen
          Link zum Zurücksetzen gesendet. Prüfe dein Postfach.
        </p>
        <p className="text-xs text-gray-400">
          Der Link ist 1 Stunde gültig.
        </p>
        <button
          onClick={onBack}
          className="text-sm text-blue-500 hover:text-blue-700 mt-2"
        >
          ← Zurück zum Login
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-5">
      <div className="text-center pb-2">
        <h2 className="text-lg font-bold text-gray-900">Passwort vergessen?</h2>
        <p className="text-sm text-gray-500 mt-1">
          Wir senden dir einen Link zum Zurücksetzen.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">E-Mail</label>
        <input
          type="email"
          value={email}
          disabled
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2.5 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50"
      >
        {loading ? 'Sende...' : 'Reset-Link senden'}
      </button>

      <button
        type="button"
        onClick={onBack}
        className="w-full text-sm text-gray-400 hover:text-gray-600 py-1"
      >
        ← Zurück zum Login
      </button>
    </form>
  );
}
