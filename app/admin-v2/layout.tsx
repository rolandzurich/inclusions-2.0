'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Navigation Items – klar strukturiert für Team-Mitglieder
const NAV_ITEMS = [
  {
    section: null,
    items: [
      { href: '/admin-v2/dashboard', label: 'Dashboard', icon: '📊' },
      { href: '/admin-v2/email', label: 'KI-E-Mail-Hub', icon: '🧠' },
    ],
  },
  {
    section: 'Formulare & Gäste',
    items: [
      { href: '/admin-v2/crm/vip', label: 'VIP-Gäste', icon: '⭐' },
      { href: '/admin-v2/crm/newsletter', label: 'Newsletter', icon: '📧' },
      { href: '/admin-v2/crm/bookings', label: 'Booking-Anfragen', icon: '🎵' },
    ],
  },
  {
    section: 'CRM',
    items: [
      { href: '/admin-v2/crm/contacts', label: 'Alle Kontakte', icon: '👤' },
      { href: '/admin-v2/crm/companies', label: 'Unternehmen', icon: '🏢' },
      { href: '/admin-v2/crm/deals', label: 'Deals', icon: '💰' },
    ],
  },
  {
    section: 'Planung',
    items: [
      { href: '/admin-v2/projects', label: 'Projekte', icon: '📁' },
      { href: '/admin-v2/calendar', label: 'Events & RSVP', icon: '📅' },
    ],
  },
  {
    section: 'Inhalte',
    items: [
      { href: '/admin-v2/cms', label: 'Seiten & Inhalte', icon: '📄' },
      { href: '/admin-v2/analytics', label: 'Webseiten-Traffic', icon: '📈' },
    ],
  },
  {
    section: 'Finanzen',
    items: [
      { href: '/admin-v2/accounting', label: 'Buchhaltung', icon: '💵' },
    ],
  },
  {
    section: 'System',
    items: [
      { href: '/admin-v2/users', label: 'User-Verwaltung', icon: '👤' },
      { href: '/admin-v2/system', label: 'Migrationen & DB', icon: '🔧' },
    ],
  },
];

export default function AdminV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ email: string; role: string } | null>(null);
  const isLoginPage = pathname === '/admin-v2/login';

  // ALLE Hooks müssen VOR jedem bedingten return stehen (React Rules of Hooks)
  useEffect(() => {
    if (isLoginPage) return; // Kein Auth-Check auf der Login-Seite
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          setUser(data.user);
        }
      })
      .catch(() => {});
  }, [isLoginPage]);

  // Login-Seite hat eigenes Layout → kein Sidebar/Header
  if (isLoginPage) {
    return <>{children}</>;
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin-v2/login');
    router.refresh();
  }

  function isActive(href: string) {
    if (href === '/admin-v2/dashboard') {
      return pathname === '/admin-v2/dashboard' || pathname === '/admin-v2';
    }
    return pathname.startsWith(href);
  }

  // Initiale des Benutzers für Avatar
  const userInitial = user?.email?.charAt(0).toUpperCase() || '?';
  const roleLabel = user?.role === 'admin' ? 'Admin' : user?.role === 'crew' ? 'Crew' : 'Partner';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            <Link href="/admin-v2/dashboard" className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                I
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 group-hover:text-pink-600 transition-colors">
                  Inclusions Admin
                </h1>
              </div>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                target="_blank"
                className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                🌐 Website
              </Link>
              {user && (
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-medium text-gray-700">{user.email}</p>
                    <p className="text-[10px] text-gray-400">{roleLabel}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-sm font-medium">
                    {userInitial}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-xs text-gray-400 hover:text-red-600 transition-colors"
                    title="Abmelden"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-60 bg-white border-r border-gray-200 min-h-[calc(100vh-57px)] sticky top-[57px] overflow-y-auto">
          <nav className="py-3">
            {NAV_ITEMS.map((group, gi) => (
              <div key={gi}>
                {/* Section Header */}
                {group.section && (
                  <div className="px-5 pt-5 pb-1">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                      {group.section}
                    </p>
                  </div>
                )}

                {/* Items */}
                {group.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2.5 mx-2 px-3 py-2 text-sm rounded-lg transition-all ${
                        active
                          ? 'bg-pink-50 text-pink-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <span className="text-base w-5 text-center flex-shrink-0">{item.icon}</span>
                      <span>{item.label}</span>
                      {active && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-pink-500" />
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
