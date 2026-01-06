import { ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-brand-pink">Inclusions Admin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/admin/dashboard"
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
              >
                Dashboard
              </a>
              <a
                href="/admin/contact-requests"
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
              >
                Booking-Anfragen
              </a>
              <a
                href="/admin/newsletter"
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
              >
                Newsletter
              </a>
              <a
                href="/admin/vip"
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
              >
                VIP-Anmeldungen
              </a>
              <a
                href="/admin/content"
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
              >
                Content
              </a>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

