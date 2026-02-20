'use client';

import { useState, useEffect } from 'react';

export default function ResetPasswordPage() {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Token aus URL lesen
    const params = new URLSearchParams(window.location.search);
    const t = params.get('token');
    if (t) {
      setToken(t);
    } else {
      setError('Kein gültiger Reset-Link. Bitte fordere einen neuen an.');
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
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
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Fehler beim Zurücksetzen.');
        setLoading(false);
        return;
      }

      setSuccess(true);

      // Weiterleiten nach 2 Sekunden
      setTimeout(() => {
        if (data.user?.role === 'admin') {
          window.location.href = '/admin-v2/dashboard';
        } else {
          window.location.href = '/crew';
        }
      }, 2000);
    } catch {
      setError('Verbindungsfehler.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg shadow-blue-500/25">
            I
          </div>
          <h1 className="text-2xl font-bold text-white">Neues Passwort</h1>
          <p className="text-gray-400 mt-1 text-sm">Wähle ein neues Passwort für dein Konto</p>
        </div>

        {success ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✓</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Passwort geändert!</h2>
            <p className="text-gray-500 text-sm">Du wirst gleich weitergeleitet...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {!token ? (
              <div className="text-center py-4">
                <a
                  href="/crew/login"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  ← Zurück zum Login
                </a>
              </div>
            ) : (
              <>
                <div>
                  <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Neues Passwort
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
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2.5 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Wird gespeichert...' : 'Passwort ändern'}
                </button>

                <div className="text-center">
                  <a
                    href="/crew/login"
                    className="text-sm text-gray-400 hover:text-gray-600"
                  >
                    ← Zurück zum Login
                  </a>
                </div>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
