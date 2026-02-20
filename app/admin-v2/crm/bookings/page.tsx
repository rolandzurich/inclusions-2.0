'use client';

import { useState, useEffect } from 'react';

interface BookingRequest {
  id: string;
  contact_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  booking_type?: string;
  booking_item?: string;
  event_date?: string;
  event_location?: string;
  event_type?: string;
  message?: string;
  status: 'new' | 'in_progress' | 'completed' | 'cancelled';
  admin_notes?: string;
  viewed_at?: string;
  created_at: string;
}

const statusConfig = {
  new: { label: 'Neu', color: 'text-blue-800', bgColor: 'bg-blue-100' },
  in_progress: { label: 'In Bearbeitung', color: 'text-yellow-800', bgColor: 'bg-yellow-100' },
  completed: { label: 'Erledigt', color: 'text-green-800', bgColor: 'bg-green-100' },
  cancelled: { label: 'Abgesagt', color: 'text-red-800', bgColor: 'bg-red-100' },
};

export default function BookingsPage() {
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedReq, setSelectedReq] = useState<BookingRequest | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, search]);

  async function fetchRequests() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (search) params.append('search', search);
      const res = await fetch(`/api/admin-v2/booking-requests?${params}`);
      const data = await res.json();
      if (data.success) {
        setRequests(data.requests);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Fehler:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updateRequest(id: string, status: string, adminNotes?: string) {
    try {
      await fetch(`/api/admin-v2/booking-requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, admin_notes: adminNotes }),
      });
      showSuccess('Anfrage aktualisiert');
      fetchRequests();
    } catch (error) {
      alert('Fehler');
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Anfrage von ${name} wirklich löschen?`)) return;
    try {
      await fetch(`/api/admin-v2/booking-requests/${id}`, { method: 'DELETE' });
      showSuccess('Gelöscht');
      fetchRequests();
      if (selectedReq?.id === id) setSelectedReq(null);
    } catch (error) {
      alert('Fehler');
    }
  }

  function showSuccess(message: string) {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  }

  return (
    <div className="space-y-6">
      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          ✓ {successMessage}
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Booking-Anfragen</h1>
        <p className="mt-2 text-gray-600">DJ, Dance Crew & andere Anfragen</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-800">{stats.new_count || 0}</div>
          <div className="text-sm text-blue-700">Neue</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-800">{stats.in_progress_count || 0}</div>
          <div className="text-sm text-yellow-700">In Bearbeitung</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-800">{stats.completed_count || 0}</div>
          <div className="text-sm text-green-700">Erledigt</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.total_count || 0}</div>
          <div className="text-sm text-gray-600">Gesamt</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 grid grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Suche nach Name, E-Mail, DJ..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Alle Status</option>
          <option value="new">Neu</option>
          <option value="in_progress">In Bearbeitung</option>
          <option value="completed">Erledigt</option>
          <option value="cancelled">Abgesagt</option>
        </select>
      </div>

      <div className="flex gap-6">
        {/* Table */}
        <div className="flex-1 bg-white rounded-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎵</div>
              <h3 className="text-lg font-medium text-gray-900">Keine Booking-Anfragen</h3>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Anfrage von</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Typ / Artist</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Datum</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aktionen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {requests.map((req) => (
                  <tr
                    key={req.id}
                    onClick={() => setSelectedReq(req)}
                    className={`hover:bg-blue-50 cursor-pointer ${
                      selectedReq?.id === req.id ? 'bg-blue-50' : ''
                    } ${!req.viewed_at ? 'font-semibold' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">{req.first_name} {req.last_name}</div>
                      <div className="text-xs text-gray-500">{req.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">{req.booking_type || '-'}</div>
                      <div className="text-xs text-gray-500">{req.booking_item || ''}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {req.event_date ? new Date(req.event_date).toLocaleDateString('de-CH') : '-'}
                      {req.event_location && `, ${req.event_location}`}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusConfig[req.status].bgColor} ${statusConfig[req.status].color}`}>
                        {statusConfig[req.status].label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(req.created_at).toLocaleDateString('de-CH')}
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(req.id, `${req.first_name} ${req.last_name}`); }}
                        className="text-red-600 hover:text-red-900"
                      >
                        Löschen
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Detail Panel */}
        {selectedReq && (
          <div className="w-96 bg-white rounded-lg border border-gray-200 p-6 space-y-5 sticky top-4">
            <div className="flex items-start justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedReq.first_name} {selectedReq.last_name}
              </h2>
              <button onClick={() => setSelectedReq(null)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>

            <div className="space-y-2 text-sm">
              <div className="text-gray-600">✉️ {selectedReq.email}</div>
              {selectedReq.phone && <div className="text-gray-600">📞 {selectedReq.phone}</div>}
            </div>

            <div className="space-y-2 text-sm">
              <h3 className="font-bold text-gray-900">Booking</h3>
              <div className="text-gray-600">🎵 Typ: {selectedReq.booking_type || '-'}</div>
              <div className="text-gray-600">🎤 Artist: {selectedReq.booking_item || '-'}</div>
              {selectedReq.event_date && (
                <div className="text-gray-600">📅 Event: {new Date(selectedReq.event_date).toLocaleDateString('de-CH')}</div>
              )}
              {selectedReq.event_location && <div className="text-gray-600">📍 Ort: {selectedReq.event_location}</div>}
              {selectedReq.event_type && <div className="text-gray-600">🎭 Art: {selectedReq.event_type}</div>}
            </div>

            {selectedReq.message && (
              <div className="space-y-2">
                <h3 className="font-bold text-gray-900 text-sm">Nachricht</h3>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedReq.message}</p>
              </div>
            )}

            <div className="space-y-2">
              <h3 className="font-bold text-gray-900 text-sm">Status ändern</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(statusConfig).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => updateRequest(selectedReq.id, key)}
                    className={`px-3 py-2 text-xs rounded-lg transition-colors ${
                      selectedReq.status === key
                        ? `${config.bgColor} ${config.color} font-bold ring-2 ring-offset-1 ring-gray-300`
                        : `${config.bgColor} ${config.color} hover:opacity-80`
                    }`}
                  >
                    {config.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
