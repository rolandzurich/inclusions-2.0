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
  company?: string;
  number_of_guests?: number;
  special_requirements?: string;
  viewed_at?: string;
  is_duplicate?: boolean;
  status?: string;
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

  const handleSelectRegistration = async (registration: VIPRegistration) => {
    setSelectedRegistration(registration);
    
    // Mark as viewed if not already viewed
    if (!registration.viewed_at) {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
        await fetch(`/api/admin/vip/${registration.id}`, {
          method: 'GET', // GET automatically marks as viewed
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        // Update local state
        setRegistrations(registrations.map(r => 
          r.id === registration.id ? { ...r, viewed_at: new Date().toISOString() } : r
        ));
      } catch (error) {
        console.error('Error marking as viewed:', error);
      }
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

  const handleExportCSV = () => {
    // CSV Header für Google Sheets
    const headers = [
      'Datum',
      'Name',
      'E-Mail',
      'Telefon',
      'Event-Datum',
      'Event-Ort',
      'Nachricht',
      'Firma',
      'Anzahl Gäste',
      'Besondere Anforderungen',
      'Status'
    ];

    // CSV Rows
    const rows = registrations.map(reg => [
      new Date(reg.created_at).toLocaleString('de-CH'),
      reg.name || '',
      reg.email || '',
      reg.phone || '',
      reg.event_date || '',
      reg.event_location || '',
      (reg.message || '').replace(/\n/g, ' ').replace(/"/g, '""'),
      (reg as any).company || '',
      (reg as any).number_of_guests || '',
      ((reg as any).special_requirements || '').replace(/\n/g, ' ').replace(/"/g, '""'),
      reg.status || 'new'
    ]);

    // CSV Content mit BOM für Excel/Google Sheets
    const csvContent = [
      headers.map(h => `"${h}"`).join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Download
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `vip-anmeldungen-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <div className="text-center py-12">Lädt...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">VIP-Anmeldungen</h1>

      <div className="mb-4">
        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-brand-pink hover:bg-brand-pink/80 rounded text-white font-semibold"
        >
          📥 Als CSV exportieren (für Google Sheets)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Alle Anmeldungen ({registrations.length})</h2>
            <div className="text-sm text-gray-400">
              Neu: {registrations.filter(r => !r.viewed_at).length}
            </div>
          </div>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {registrations.map((registration) => (
              <div
                key={registration.id}
                onClick={() => handleSelectRegistration(registration)}
                className={`p-4 rounded cursor-pointer border ${
                  selectedRegistration?.id === registration.id
                    ? 'border-brand-pink bg-gray-700'
                    : !registration.viewed_at
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{registration.name}</p>
                      {registration.is_duplicate && (
                        <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">
                          Doppelt
                        </span>
                      )}
                      {!registration.viewed_at && (
                        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
                          Neu
                        </span>
                      )}
                    </div>
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
                {selectedRegistration.company && (
                  <div>
                    <p className="text-sm text-gray-400">Firma</p>
                    <p>{selectedRegistration.company}</p>
                  </div>
                )}
                {selectedRegistration.number_of_guests && (
                  <div>
                    <p className="text-sm text-gray-400">Anzahl Gäste</p>
                    <p>{selectedRegistration.number_of_guests}</p>
                  </div>
                )}
                {selectedRegistration.special_requirements && (
                  <div>
                    <p className="text-sm text-gray-400">Besondere Anforderungen</p>
                    <p className="whitespace-pre-wrap">{selectedRegistration.special_requirements}</p>
                  </div>
                )}
                {selectedRegistration.is_duplicate && (
                  <div>
                    <p className="text-sm text-gray-400">Hinweis</p>
                    <p className="text-yellow-400 font-semibold">⚠️ Doppelte E-Mail-Adresse</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-400">Erstellt am</p>
                  <p>{new Date(selectedRegistration.created_at).toLocaleString('de-CH')}</p>
                </div>
                {selectedRegistration.viewed_at && (
                  <div>
                    <p className="text-sm text-gray-400">Angeschaut am</p>
                    <p>{new Date(selectedRegistration.viewed_at).toLocaleString('de-CH')}</p>
                  </div>
                )}
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

