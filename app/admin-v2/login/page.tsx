'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  async function handleForgot() {
    if (!email) {
      setError('Bitte zuerst E-Mail eingeben.');
      return;
    }
    setForgotLoading(true);
    setError('');
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setForgotSent(true);
    } catch {
      setError('Verbindungsfehler.');
    } finally {
      setForgotLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
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

      // Erfolgreich → basierend auf Rolle weiterleiten
      if (data.user?.role === 'crew') {
        window.location.href = '/crew';
      } else {
        window.location.href = '/admin-v2/dashboard';
      }
    } catch {
      setError('Verbindungsfehler. Bitte versuche es erneut.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg shadow-pink-500/25">
            I
          </div>
          <h1 className="text-2xl font-bold text-white">Inclusions Admin</h1>
          <p className="text-gray-400 mt-1 text-sm">Melde dich an, um fortzufahren</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">E-Mail</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="deine@email.ch"
              required
              autoFocus
              autoComplete="email"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900 placeholder-gray-400"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">Passwort</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900 placeholder-gray-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2.5 rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Anmelden...' : 'Anmelden'}
          </button>

          {forgotSent ? (
            <p className="text-center text-sm text-green-600">
              Reset-Link gesendet! Prüfe dein Postfach.
            </p>
          ) : (
            <button
              type="button"
              onClick={handleForgot}
              disabled={forgotLoading}
              className="w-full text-sm text-gray-400 hover:text-pink-500 py-1 transition-colors"
            >
              {forgotLoading ? 'Sende...' : 'Passwort vergessen?'}
            </button>
          )}
        </form>

        <p className="text-center text-gray-500 text-xs mt-6">
          Zugang nur für autorisierte Team-Mitglieder.
        </p>
      </div>
    </div>
  );
}
