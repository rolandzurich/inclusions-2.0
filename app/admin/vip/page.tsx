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
    // CSV Header mit ALLEN Feldern
    const headers = [
      'Datum',
      'Name',
      'E-Mail',
      'Telefon',
      'Adresse',
      'Alter',
      'IV-Ausweis',
      'Beeinträchtigung',
      'Event-Datum',
      'Event-Ort',
      'Ankunftszeit',
      'TIXI-Taxi',
      'Betreuer benötigt',
      'Anmeldung durch',
      'Betreuer Name',
      'Betreuer E-Mail',
      'Betreuer Telefon',
      'Kontaktperson',
      'Kontaktperson Telefon',
      'Besondere Bedürfnisse',
      'Vollständige Nachricht',
      'Status'
    ];

    // CSV Rows mit ALLEN Daten
    const rows = registrations.map(reg => [
      new Date(reg.created_at).toLocaleString('de-CH'),
      reg.name || '',
      reg.email || '',
      reg.phone || '',
      (reg as any).adresse || '',
      (reg as any).alter || '',
      (reg as any).iv_ausweis || '',
      (reg as any).beeintraechtigung || '',
      reg.event_date || '',
      reg.event_location || '',
      (reg as any).ankunftszeit || '',
      (reg as any).tixi_taxi || '',
      (reg as any).betreuer_benoetigt || '',
      (reg as any).anmeldung_durch === 'betreuer' ? 'Betreuer:in' : 'Selbst',
      (reg as any).betreuer_name || '',
      (reg as any).betreuer_email || '',
      (reg as any).betreuer_telefon || '',
      (reg as any).kontaktperson_name || '',
      (reg as any).kontaktperson_telefon || '',
      ((reg as any).besondere_beduerfnisse || '').replace(/\n/g, ' ').replace(/"/g, '""'),
      (reg.message || '').replace(/\n/g, ' ').replace(/"/g, '""'),
      reg.status || 'pending'
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
    link.setAttribute('download', `vip-anmeldungen-vollstaendig-${new Date().toISOString().split('T')[0]}.csv`);
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
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold">{registration.name}</p>
                      {(registration as any).anmeldung_durch === 'betreuer' && (
                        <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded">
                          via Betreuer:in
                        </span>
                      )}
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
                    <div className="flex gap-3 mt-1 text-xs text-gray-500">
                      {(registration as any).alter && (
                        <span>Alter: {(registration as any).alter}</span>
                      )}
                      {(registration as any).iv_ausweis && (
                        <span>IV: {(registration as any).iv_ausweis}</span>
                      )}
                      {(registration as any).ankunftszeit && (
                        <span>{(registration as any).ankunftszeit}</span>
                      )}
                    </div>
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
                {/* Anmeldungsart - GANZ OBEN */}
                {(selectedRegistration as any).anmeldung_durch && (
                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-2 text-purple-400">
                      📝 Angemeldet durch: {(selectedRegistration as any).anmeldung_durch === 'betreuer' ? 'Betreuer:in' : 'Selbst'}
                    </h3>
                  </div>
                )}

                {/* Persönliche Daten des VIP */}
                <div className="pb-4 border-b border-gray-700">
                  <h3 className="text-lg font-semibold mb-3 text-brand-pink">👤 VIP-Gast Daten</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Vorname</p>
                      <p className="font-semibold">{(selectedRegistration as any).first_name || selectedRegistration.name?.split(' ')[0]}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Nachname</p>
                      <p className="font-semibold">{(selectedRegistration as any).last_name || selectedRegistration.name?.split(' ').slice(1).join(' ')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">E-Mail</p>
                      <p className="text-sm break-all">{selectedRegistration.email}</p>
                    </div>
                    {selectedRegistration.phone && (
                      <div>
                        <p className="text-sm text-gray-400">Telefon</p>
                        <p>{selectedRegistration.phone}</p>
                      </div>
                    )}
                    {(selectedRegistration as any).alter && (
                      <div>
                        <p className="text-sm text-gray-400">Alter</p>
                        <p className="font-medium text-lg">{(selectedRegistration as any).alter} Jahre</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* VIP-Status */}
                <div className="pb-4 border-b border-gray-700">
                  <h3 className="text-lg font-semibold mb-3 text-brand-pink">⭐ VIP-Status</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {(selectedRegistration as any).iv_ausweis && (
                      <div className="bg-gray-700/50 p-3 rounded">
                        <p className="text-sm text-gray-400 mb-1">IV-Ausweis</p>
                        <p className="font-bold text-lg">
                          {(selectedRegistration as any).iv_ausweis === 'Ja' ? '✅ Ja' : '❌ Nein'}
                        </p>
                      </div>
                    )}
                    {(selectedRegistration as any).beeintraechtigung && (
                      <div className="bg-gray-700/50 p-3 rounded">
                        <p className="text-sm text-gray-400 mb-1">Beeinträchtigung</p>
                        <p className="font-bold text-lg">
                          {(selectedRegistration as any).beeintraechtigung === 'Ja' ? '✅ Ja' : '❌ Nein'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Event-Details */}
                <div className="pb-4 border-b border-gray-700">
                  <h3 className="text-lg font-semibold mb-3 text-brand-pink">📅 Event-Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedRegistration.event_date && (
                      <div className="bg-gray-700/50 p-3 rounded">
                        <p className="text-sm text-gray-400 mb-1">Datum</p>
                        <p className="font-semibold">{selectedRegistration.event_date}</p>
                      </div>
                    )}
                    {selectedRegistration.event_location && (
                      <div className="bg-gray-700/50 p-3 rounded">
                        <p className="text-sm text-gray-400 mb-1">Ort</p>
                        <p className="font-semibold">{selectedRegistration.event_location}</p>
                      </div>
                    )}
                    {(selectedRegistration as any).ankunftszeit && (
                      <div className="bg-gray-700/50 p-3 rounded col-span-2">
                        <p className="text-sm text-gray-400 mb-1">Ankunftszeit</p>
                        <p className="font-bold text-lg">🕐 {(selectedRegistration as any).ankunftszeit}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* TIXI-Taxi */}
                {(selectedRegistration as any).tixi_taxi && (
                  <div className="pb-4 border-b border-gray-700">
                    <h3 className="text-lg font-semibold mb-3 text-brand-pink">🚕 TIXI-Taxi</h3>
                    <div className="bg-gray-700/50 p-4 rounded">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-400">TIXI-Taxi gewünscht</p>
                        <p className="font-bold text-lg">
                          {(selectedRegistration as any).tixi_taxi === 'Ja' ? '✅ Ja' : '❌ Nein'}
                        </p>
                      </div>
                      {(selectedRegistration as any).tixi_adresse && (
                        <div className="mt-3 pt-3 border-t border-gray-600">
                          <p className="text-sm text-gray-400 mb-1">Abholadresse</p>
                          <p className="font-semibold">{(selectedRegistration as any).tixi_adresse}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* VIP Betreuer (1-zu-1 Betreuung) */}
                {(selectedRegistration as any).vip_braucht_betreuer && (
                  <div className="pb-4 border-b border-gray-700">
                    <h3 className="text-lg font-semibold mb-3 text-brand-pink">🤝 1-zu-1 Betreuer (für VIP)</h3>
                    <div className="bg-gray-700/50 p-4 rounded">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-400">Betreuer benötigt</p>
                        <p className="font-bold text-lg">
                          {(selectedRegistration as any).vip_braucht_betreuer === 'Ja' ? '✅ Ja' : '❌ Nein'}
                        </p>
                      </div>
                      {(selectedRegistration as any).vip_betreuer_name && (
                        <div className="mt-3 pt-3 border-t border-gray-600 space-y-2">
                          <div>
                            <p className="text-sm text-gray-400">Name Betreuer:in</p>
                            <p className="font-semibold">{(selectedRegistration as any).vip_betreuer_name}</p>
                          </div>
                          {(selectedRegistration as any).vip_betreuer_telefon && (
                            <div>
                              <p className="text-sm text-gray-400">Telefon Betreuer:in</p>
                              <p className="font-semibold">{(selectedRegistration as any).vip_betreuer_telefon}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Anmeldungs-Betreuer (wenn durch Betreuer angemeldet) */}
                {(selectedRegistration as any).anmeldung_durch === 'betreuer' && (selectedRegistration as any).anmeldung_betreuer_name && (
                  <div className="pb-4 border-b border-gray-700">
                    <h3 className="text-lg font-semibold mb-3 text-brand-pink">👔 Anmeldungs-Betreuer:in (hat angemeldet)</h3>
                    <div className="bg-purple-500/10 border border-purple-500/30 p-4 rounded space-y-3">
                      <div>
                        <p className="text-sm text-gray-400">Name</p>
                        <p className="font-semibold text-lg">{(selectedRegistration as any).anmeldung_betreuer_name}</p>
                      </div>
                      {(selectedRegistration as any).anmeldung_betreuer_email && (
                        <div>
                          <p className="text-sm text-gray-400">E-Mail</p>
                          <p className="font-semibold break-all">{(selectedRegistration as any).anmeldung_betreuer_email}</p>
                        </div>
                      )}
                      {(selectedRegistration as any).anmeldung_betreuer_telefon && (
                        <div>
                          <p className="text-sm text-gray-400">Telefon</p>
                          <p className="font-semibold">{(selectedRegistration as any).anmeldung_betreuer_telefon}</p>
                        </div>
                      )}
                      <p className="text-xs text-purple-300 italic mt-2">
                        ℹ️ Dieser Betreuer hat die Anmeldung durchgeführt und ist Notfallkontakt
                      </p>
                    </div>
                  </div>
                )}

                {/* Kontaktperson für Notfälle (wenn selbst angemeldet) */}
                {(selectedRegistration as any).anmeldung_durch === 'selbst' && (selectedRegistration as any).kontaktperson_name && (
                  <div className="pb-4 border-b border-gray-700">
                    <h3 className="text-lg font-semibold mb-3 text-brand-pink">📞 Kontaktperson für Notfälle</h3>
                    <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded space-y-3">
                      <div>
                        <p className="text-sm text-gray-400">Name</p>
                        <p className="font-semibold text-lg">{(selectedRegistration as any).kontaktperson_name}</p>
                      </div>
                      {(selectedRegistration as any).kontaktperson_telefon && (
                        <div>
                          <p className="text-sm text-gray-400">Telefon</p>
                          <p className="font-semibold">{(selectedRegistration as any).kontaktperson_telefon}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Besondere Bedürfnisse */}
                {(selectedRegistration as any).besondere_beduerfnisse && (
                  <div className="pb-4 border-b border-gray-700">
                    <h3 className="text-lg font-semibold mb-3 text-brand-pink">💬 Besondere Bedürfnisse</h3>
                    <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded">
                      <p className="whitespace-pre-wrap text-white">
                        {(selectedRegistration as any).besondere_beduerfnisse}
                      </p>
                    </div>
                  </div>
                )}

                {/* System-Info */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-brand-pink">System-Info</h3>
                  <div className="space-y-3">
                    {selectedRegistration.is_duplicate && (
                      <div>
                        <p className="text-sm text-gray-400">Hinweis</p>
                        <p className="text-yellow-400 font-semibold">⚠️ Doppelte E-Mail-Adresse</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-400">Status</p>
                      <p>{selectedRegistration.status || 'pending'}</p>
                    </div>
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

