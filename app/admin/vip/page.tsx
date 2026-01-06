'use client';

import { useEffect, useState } from 'react';

interface VIPRegistration {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone?: string;
  event_date?: string;
  event_location?: string;
  message?: string;
}

export default function VIPPage() {
  const [registrations, setRegistrations] = useState<VIPRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegistration, setSelectedRegistration] = useState<VIPRegistration | null>(null);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
      
      const response = await fetch('/api/admin/vip', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRegistrations(data);
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Möchtest du diese VIP-Anmeldung wirklich löschen?')) {
      return;
    }

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
      
      const response = await fetch(`/api/admin/vip/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setRegistrations(registrations.filter(r => r.id !== id));
        if (selectedRegistration?.id === id) {
          setSelectedRegistration(null);
        }
      }
    } catch (error) {
      console.error('Error deleting registration:', error);
      alert('Fehler beim Löschen');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Lädt...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">VIP-Anmeldungen</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Alle Anmeldungen ({registrations.length})</h2>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {registrations.map((registration) => (
              <div
                key={registration.id}
                onClick={() => setSelectedRegistration(registration)}
                className={`p-4 rounded cursor-pointer border ${
                  selectedRegistration?.id === registration.id
                    ? 'border-brand-pink bg-gray-700'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{registration.name}</p>
                    <p className="text-sm text-gray-400">{registration.email}</p>
                    {registration.event_date && (
                      <p className="text-xs text-gray-500 mt-1">{registration.event_date}</p>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(registration.created_at).toLocaleDateString('de-CH')}
                  </span>
                </div>
              </div>
            ))}
            {registrations.length === 0 && (
              <p className="text-gray-400 text-center py-8">Keine VIP-Anmeldungen vorhanden</p>
            )}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          {selectedRegistration ? (
            <div>
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold">Details</h2>
                <button
                  onClick={() => handleDelete(selectedRegistration.id)}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                >
                  Löschen
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400">Name</p>
                  <p className="font-semibold">{selectedRegistration.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">E-Mail</p>
                  <p>{selectedRegistration.email}</p>
                </div>
                {selectedRegistration.phone && (
                  <div>
                    <p className="text-sm text-gray-400">Telefon</p>
                    <p>{selectedRegistration.phone}</p>
                  </div>
                )}
                {selectedRegistration.event_date && (
                  <div>
                    <p className="text-sm text-gray-400">Event-Datum</p>
                    <p>{selectedRegistration.event_date}</p>
                  </div>
                )}
                {selectedRegistration.event_location && (
                  <div>
                    <p className="text-sm text-gray-400">Event-Ort</p>
                    <p>{selectedRegistration.event_location}</p>
                  </div>
                )}
                {selectedRegistration.message && (
                  <div>
                    <p className="text-sm text-gray-400">Nachricht</p>
                    <p className="whitespace-pre-wrap">{selectedRegistration.message}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-400">Erstellt am</p>
                  <p>{new Date(selectedRegistration.created_at).toLocaleString('de-CH')}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              Wähle eine Anmeldung aus, um Details zu sehen
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

