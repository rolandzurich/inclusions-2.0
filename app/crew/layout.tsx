'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function CrewLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<{ email: string; role: string; name?: string } | null>(null);
  const isLoginPage = pathname === '/crew/login';

  useEffect(() => {
    if (isLoginPage) return;
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) setUser(data.user);
      })
      .catch(() => {});
  }, [isLoginPage]);

  // Login-Seite: Kein Layout
  if (isLoginPage) {
    return <>{children}</>;
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/crew/login';
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
              I
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Inclusions Crew</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Admin-Link für Admins */}
            {user?.role === 'admin' && (
              <Link
                href="/admin-v2/dashboard"
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                Admin →
              </Link>
            )}

            <div className="text-sm text-gray-500">
              {user?.name || user?.email?.split('@')[0] || '...'}
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
