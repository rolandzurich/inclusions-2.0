'use client';

import { useState, useEffect } from 'react';

interface VipRegistration {
  id: string;
  contact_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  has_disability: boolean;
  has_iv_card: boolean;
  special_needs?: string;
  address?: string;
  postal_code?: string;
  city?: string;
  registration_type: 'self' | 'caregiver';
  caregiver_id?: string;
  cg_first_name?: string;
  cg_last_name?: string;
  cg_email?: string;
  cg_phone?: string;
  event_date?: string;
  event_location?: string;
  arrival_time?: string;
  tixi_taxi: boolean;
  tixi_address?: string;
  needs_caregiver: boolean;
  caregiver_name?: string;
  caregiver_phone?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  admin_notes?: string;
  viewed_at?: string;
  created_at: string;
}

interface Stats {
  pending_count: number;
  confirmed_count: number;
  cancelled_count: number;
  total_count: number;
}

const statusConfig = {
  pending: { label: 'Offen', color: 'text-yellow-800', bgColor: 'bg-yellow-100' },
  confirmed: { label: 'Bestätigt', color: 'text-green-800', bgColor: 'bg-green-100' },
  cancelled: { label: 'Abgesagt', color: 'text-red-800', bgColor: 'bg-red-100' },
};

const arrivalLabels: Record<string, string> = {
  '13-17': '13:00 – 17:00',
  '17-21': '17:00 – 21:00',
  'ganze-zeit': 'Ganzer Tag',
};

export default function VipPage() {
  const [registrations, setRegistrations] = useState<VipRegistration[]>([]);
  const [stats, setStats] = useState<Stats>({ pending_count: 0, confirmed_count: 0, cancelled_count: 0, total_count: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedVip, setSelectedVip] = useState<VipRegistration | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchRegistrations();
  }, [statusFilter, search]);

  async function fetchRegistrations() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (search) params.append('search', search);
      const res = await fetch(`/api/admin-v2/vip-registrations?${params}`);
      const data = await res.json();
      if (data.success) {
        setRegistrations(data.registrations);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Fehler:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      const res = await fetch(`/api/admin-v2/vip-registrations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        showSuccess(`Status auf "${statusConfig[status as keyof typeof statusConfig]?.label}" geändert`);
        fetchRegistrations();
        if (selectedVip?.id === id) setSelectedVip({ ...selectedVip, status: status as any });
      }
    } catch (error) {
      alert('Fehler beim Aktualisieren');
    }
  }

  async function saveNotes(id: string, notes: string) {
    try {
      await fetch(`/api/admin-v2/vip-registrations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_notes: notes }),
      });
      showSuccess('Notizen gespeichert');
    } catch (error) {
      alert('Fehler');
    }
  }

  function showSuccess(message: string) {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString('de-CH');

  return (
    <div className="space-y-6">
      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          ✓ {successMessage}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">VIP-Gäste</h1>
        <p className="mt-2 text-gray-600">Menschen mit Beeinträchtigung – Gratiseinlass & Sicherheit</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.total_count}</div>
          <div className="text-sm text-gray-600">Gesamt</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-800">{stats.pending_count}</div>
          <div className="text-sm text-yellow-700">Offen</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-800">{stats.confirmed_count}</div>
          <div className="text-sm text-green-700">Bestätigt</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-800">{stats.cancelled_count}</div>
          <div className="text-sm text-red-700">Abgesagt</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Suche nach Name, E-Mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
          >
            <option value="">Alle Status</option>
            <option value="pending">Offen</option>
            <option value="confirmed">Bestätigt</option>
            <option value="cancelled">Abgesagt</option>
          </select>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Table */}
        <div className="flex-1 bg-white rounded-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Lade VIP-Gäste...</p>
            </div>
          ) : registrations.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">♿</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Keine VIP-Registrierungen</h3>
              <p className="text-gray-600">Sobald sich VIP-Gäste anmelden, erscheinen sie hier.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ankunft</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">IV</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">TIXI</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Betreuer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Datum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {registrations.map((vip) => (
                  <tr
                    key={vip.id}
                    onClick={() => setSelectedVip(vip)}
                    className={`hover:bg-blue-50 cursor-pointer ${
                      selectedVip?.id === vip.id ? 'bg-blue-50' : ''
                    } ${!vip.viewed_at ? 'font-semibold' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">
                        {vip.first_name} {vip.last_name}
                      </div>
                      <div className="text-xs text-gray-500">{vip.email}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {arrivalLabels[vip.arrival_time || ''] || '-'}
                    </td>
                    <td className="px-4 py-3 text-center text-sm">
                      {vip.has_iv_card ? '✅' : '—'}
                    </td>
                    <td className="px-4 py-3 text-center text-sm">
                      {vip.tixi_taxi ? '🚕' : '—'}
                    </td>
                    <td className="px-4 py-3 text-center text-sm">
                      {vip.needs_caregiver ? '👤' : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusConfig[vip.status].bgColor} ${statusConfig[vip.status].color}`}>
                        {statusConfig[vip.status].label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatDate(vip.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Detail Panel */}
        {selectedVip && (
          <VipDetailPanel
            vip={selectedVip}
            onStatusChange={(status) => updateStatus(selectedVip.id, status)}
            onSaveNotes={(notes) => saveNotes(selectedVip.id, notes)}
            onClose={() => setSelectedVip(null)}
          />
        )}
      </div>
    </div>
  );
}

function VipDetailPanel({
  vip,
  onStatusChange,
  onSaveNotes,
  onClose,
}: {
  vip: VipRegistration;
  onStatusChange: (status: string) => void;
  onSaveNotes: (notes: string) => void;
  onClose: () => void;
}) {
  const [notes, setNotes] = useState(vip.admin_notes || '');

  useEffect(() => {
    setNotes(vip.admin_notes || '');
  }, [vip.id]);

  return (
    <div className="w-96 bg-white rounded-lg border border-gray-200 p-6 space-y-5 sticky top-4 max-h-[85vh] overflow-y-auto">
      <div className="flex items-start justify-between">
        <h2 className="text-xl font-bold text-gray-900">
          {vip.first_name} {vip.last_name}
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
      </div>

      {/* Sicherheits-Info (prominent) */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
        <h3 className="font-bold text-red-900 text-sm uppercase">Sicherheits-Infos</h3>
        <div className="text-sm text-red-800 space-y-1">
          <div>♿ Beeinträchtigung: <strong>{vip.has_disability ? 'Ja' : 'Nein'}</strong></div>
          <div>🪪 IV-Ausweis: <strong>{vip.has_iv_card ? 'Ja' : 'Nein'}</strong></div>
          {vip.special_needs && (
            <div>⚠️ Besondere Bedürfnisse: <strong>{vip.special_needs}</strong></div>
          )}
        </div>
      </div>

      {/* Notfall-Kontakt (prominent) */}
      {(vip.emergency_contact_name || vip.cg_first_name) && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h3 className="font-bold text-orange-900 text-sm uppercase">Notfall-Kontakt</h3>
          <div className="text-sm text-orange-800 mt-1">
            {vip.emergency_contact_name && (
              <>
                <div>👤 {vip.emergency_contact_name}</div>
                <div>📞 {vip.emergency_contact_phone}</div>
              </>
            )}
            {vip.registration_type === 'caregiver' && vip.cg_first_name && (
              <>
                <div>👤 {vip.cg_first_name} {vip.cg_last_name} (Betreuer:in)</div>
                <div>📞 {vip.cg_phone}</div>
                <div>✉️ {vip.cg_email}</div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Kontakt-Daten */}
      <div className="space-y-2 text-sm">
        <h3 className="font-bold text-gray-900">Kontakt</h3>
        <div className="text-gray-600">✉️ {vip.email}</div>
        <div className="text-gray-600">📞 {vip.phone}</div>
        {vip.address && <div className="text-gray-600">📍 {vip.address}</div>}
        {vip.postal_code && <div className="text-gray-600">📮 {vip.postal_code} {vip.city}</div>}
      </div>

      {/* Event-Details */}
      <div className="space-y-2 text-sm">
        <h3 className="font-bold text-gray-900">Event-Details</h3>
        {vip.event_date && <div className="text-gray-600">📅 {new Date(vip.event_date).toLocaleDateString('de-CH')}</div>}
        {vip.event_location && <div className="text-gray-600">📍 {vip.event_location}</div>}
        <div className="text-gray-600">🕐 Ankunft: {arrivalLabels[vip.arrival_time || ''] || '-'}</div>
        <div className="text-gray-600">
          🚕 TIXI-Taxi: {vip.tixi_taxi ? `Ja – ${vip.tixi_address || 'Adresse fehlt'}` : 'Nein'}
        </div>
        {vip.needs_caregiver && (
          <div className="text-gray-600">
            👤 1:1 Betreuer: {vip.caregiver_name} ({vip.caregiver_phone})
          </div>
        )}
      </div>

      {/* Anmeldungs-Typ */}
      <div className="text-sm">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          vip.registration_type === 'caregiver'
            ? 'bg-purple-100 text-purple-800'
            : 'bg-blue-100 text-blue-800'
        }`}>
          {vip.registration_type === 'caregiver' ? '👥 Betreuer-Anmeldung' : '🙋 Selbst-Anmeldung'}
        </span>
      </div>

      {/* Status-Buttons */}
      <div className="space-y-2">
        <h3 className="font-bold text-gray-900 text-sm">Status ändern</h3>
        <div className="flex gap-2">
          <button
            onClick={() => onStatusChange('confirmed')}
            className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors ${
              vip.status === 'confirmed'
                ? 'bg-green-600 text-white'
                : 'bg-green-100 text-green-800 hover:bg-green-200'
            }`}
          >
            ✓ Bestätigen
          </button>
          <button
            onClick={() => onStatusChange('cancelled')}
            className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors ${
              vip.status === 'cancelled'
                ? 'bg-red-600 text-white'
                : 'bg-red-100 text-red-800 hover:bg-red-200'
            }`}
          >
            ✗ Absagen
          </button>
        </div>
      </div>

      {/* Admin-Notizen */}
      <div className="space-y-2">
        <h3 className="font-bold text-gray-900 text-sm">Admin-Notizen</h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="Interne Notizen..."
        />
        <button
          onClick={() => onSaveNotes(notes)}
          className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm transition-colors"
        >
          Notizen speichern
        </button>
      </div>
    </div>
  );
}
