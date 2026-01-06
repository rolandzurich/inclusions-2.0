'use client';

import { useEffect, useState } from 'react';

interface Stats {
  contactRequests: number;
  newsletterSubscribers: number;
  vipRegistrations: number;
  recentContactRequests: any[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
      
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Lädt...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-400 mb-2">Booking-Anfragen</h3>
          <p className="text-3xl font-bold text-brand-pink">
            {stats?.contactRequests || 0}
          </p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-400 mb-2">Newsletter Abonnenten</h3>
          <p className="text-3xl font-bold text-brand-pink">
            {stats?.newsletterSubscribers || 0}
          </p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-400 mb-2">VIP-Anmeldungen</h3>
          <p className="text-3xl font-bold text-brand-pink">
            {stats?.vipRegistrations || 0}
          </p>
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Neueste Booking-Anfragen</h2>
        {stats?.recentContactRequests && stats.recentContactRequests.length > 0 ? (
          <div className="space-y-4">
            {stats.recentContactRequests.map((request: any) => (
              <div key={request.id} className="border-b border-gray-700 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{request.name}</p>
                    <p className="text-sm text-gray-400">{request.email}</p>
                    {request.booking_item && (
                      <p className="text-sm text-gray-300 mt-1">
                        Booking: {request.booking_item}
                      </p>
                    )}
                  </div>
                  <span className="text-sm text-gray-400">
                    {new Date(request.created_at).toLocaleDateString('de-CH')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">Keine Anfragen vorhanden</p>
        )}
      </div>
    </div>
  );
}

