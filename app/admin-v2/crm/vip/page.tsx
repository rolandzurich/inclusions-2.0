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
  caregiver_free_entry?: 'yes' | 'no' | 'pending' | null;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'needs_clarification';
  admin_notes?: string;
  viewed_at?: string;
  created_at: string;
  raw_data?: Record<string, any>;
}

interface CaregiverSummary {
  caregiver_name: string;
  caregiver_phone: string;
  caregiver_free_entry: 'yes' | 'no' | 'pending' | null;
  vip_count: number;
  registration_ids: string[];
}

interface Stats {
  pending_count: number;
  confirmed_count: number;
  cancelled_count: number;
  clarification_count: number;
  total_count: number;
}

const statusConfig = {
  pending:               { label: 'Offen',          color: 'text-yellow-800', bgColor: 'bg-yellow-100' },
  confirmed:             { label: 'Bestätigt',       color: 'text-green-800',  bgColor: 'bg-green-100'  },
  cancelled:             { label: 'Abgesagt',        color: 'text-red-800',    bgColor: 'bg-red-100'    },
  needs_clarification:   { label: 'Klärung nötig',  color: 'text-orange-800', bgColor: 'bg-orange-100' },
};

const arrivalLabels: Record<string, string> = {
  '13-17':       '13:00 – 17:00',
  '17-21':       '17:00 – 21:00',
  'ganze-zeit':  'Ganzer Tag',
};

function detectClarityIssues(vip: VipRegistration): string[] {
  const issues: string[] = [];
  const raw = vip.raw_data || {};

  // Name in Formular weicht vom Kontakt-Datensatz ab (geteilte Email, Gruppeanmeldung)
  const rawFirst = (raw.first_name || '').trim();
  const rawLast  = (raw.last_name  || '').trim();
  if (rawFirst && rawLast) {
    const same =
      rawFirst.toLowerCase() === (vip.first_name || '').toLowerCase() &&
      rawLast.toLowerCase()  === (vip.last_name  || '').toLowerCase();
    if (!same) {
      issues.push(`Formular-Name: "${rawFirst} ${rawLast}" ≠ Kontakt: "${vip.first_name} ${vip.last_name}"`);
    }
  }

  if (vip.tixi_taxi && !vip.tixi_address) {
    issues.push('TIXI-Taxi bestellt – Abholadresse fehlt');
  }
  if (!vip.email) {
    issues.push('E-Mail fehlt – Info-Mails vor der Party nicht möglich');
  }
  if (vip.needs_caregiver && !vip.caregiver_name) {
    issues.push('Betreuer gewünscht – aber kein Name angegeben');
  }
  if (vip.registration_type === 'caregiver' && !vip.cg_first_name) {
    issues.push('Betreuer-Anmeldung – Betreuer-Daten fehlen');
  }
  return issues;
}

export default function VipPage() {
  const [registrations, setRegistrations] = useState<VipRegistration[]>([]);
  const [caregivers, setCaregivers]       = useState<CaregiverSummary[]>([]);
  const [stats, setStats] = useState<Stats>({
    pending_count: 0, confirmed_count: 0, cancelled_count: 0, clarification_count: 0, total_count: 0,
  });
  const [loading, setLoading]           = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch]             = useState('');
  const [activeTab, setActiveTab]       = useState<'list' | 'caregivers'>('list');
  const [selectedVip, setSelectedVip]   = useState<VipRegistration | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => { fetchRegistrations(); }, [statusFilter, search]);

  async function fetchRegistrations() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (search)       params.append('search', search);
      const res  = await fetch(`/api/admin-v2/vip-registrations?${params}&_ts=${Date.now()}`);
      const data = await res.json();
      if (data.success) {
        setRegistrations(data.registrations);
        setStats(data.stats);
        setCaregivers(data.caregivers || []);
      }
    } catch (error) {
      console.error('Fehler:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      const res  = await fetch(`/api/admin-v2/vip-registrations/${id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        showSuccess(`Status auf "${statusConfig[status as keyof typeof statusConfig]?.label}" geändert`);
        fetchRegistrations();
        if (selectedVip?.id === id) setSelectedVip({ ...selectedVip, status: status as any });
      }
    } catch {
      alert('Fehler beim Aktualisieren');
    }
  }

  async function updateCaregiverFreeEntry(id: string, value: string, bulkPhone?: string) {
    try {
      const body: Record<string, any> = { caregiver_free_entry: value };
      if (bulkPhone) body.bulk_caregiver_phone = bulkPhone;
      const res  = await fetch(`/api/admin-v2/vip-registrations/${id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        showSuccess(bulkPhone
          ? `${data.updated_count} Anmeldungen aktualisiert`
          : 'Eintritt-Status gespeichert'
        );
        fetchRegistrations();
      }
    } catch {
      alert('Fehler');
    }
  }

  async function saveNotes(id: string, notes: string) {
    try {
      await fetch(`/api/admin-v2/vip-registrations/${id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ admin_notes: notes }),
      });
      showSuccess('Notizen gespeichert');
    } catch {
      alert('Fehler');
    }
  }

  function showSuccess(message: string) {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString('de-CH');

  const clarificationNeeded = registrations.filter(
    (v) => v.status === 'needs_clarification' || detectClarityIssues(v).length > 0
  );

  const pendingCaregivers = caregivers.filter(
    (c) => c.caregiver_free_entry === 'pending' || c.caregiver_free_entry === null
  );

  return (
    <div className="space-y-6">
      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          ✓ {successMessage}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">VIP-Gäste</h1>
        <p className="mt-2 text-gray-600">Menschen mit Beeinträchtigung – Gratiseinlass &amp; Sicherheit</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.total_count}</div>
          <div className="text-sm text-gray-600">VIP-Gäste total</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-800">{stats.pending_count}</div>
          <div className="text-sm text-yellow-700">Offen</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-800">{stats.confirmed_count}</div>
          <div className="text-sm text-green-700">Bestätigt</div>
        </div>
        <button
          onClick={() => { setActiveTab('list'); setStatusFilter(statusFilter === 'needs_clarification' ? '' : 'needs_clarification'); }}
          className={`rounded-lg p-4 text-center transition-all border-2 ${
            statusFilter === 'needs_clarification'
              ? 'bg-orange-200 border-orange-500'
              : 'bg-orange-50 border-orange-200 hover:border-orange-400'
          }`}
        >
          <div className="text-2xl font-bold text-orange-800">
            {Math.max(Number(stats.clarification_count), clarificationNeeded.length)}
          </div>
          <div className="text-sm text-orange-700 font-medium">⚠️ Klärung nötig</div>
        </button>
        <button
          onClick={() => { setActiveTab('caregivers'); setSelectedVip(null); }}
          className={`rounded-lg p-4 text-center transition-all border-2 ${
            activeTab === 'caregivers'
              ? 'bg-purple-200 border-purple-500'
              : 'bg-purple-50 border-purple-200 hover:border-purple-400'
          }`}
        >
          <div className="text-2xl font-bold text-purple-800">{caregivers.length}</div>
          <div className="text-sm text-purple-700 font-medium">
            👥 Betreuer{pendingCaregivers.length > 0 && <span className="ml-1 bg-orange-500 text-white text-xs rounded-full px-1.5">{pendingCaregivers.length}</span>}
          </div>
        </button>
      </div>

      {/* Filters (nur in List-Tab) */}
      {activeTab === 'list' && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex gap-3 flex-wrap">
            <input
              type="text"
              placeholder="Suche nach Name, E-Mail..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-48 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            />
            {(['', 'pending', 'confirmed', 'cancelled', 'needs_clarification'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === s
                    ? s === '' ? 'bg-gray-800 text-white' : `${statusConfig[s]?.bgColor || 'bg-gray-100'} ${statusConfig[s]?.color || ''} ring-2 ring-offset-1 ring-gray-400`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {s === '' ? 'Alle' : statusConfig[s]?.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Betreuer-Tab */}
      {activeTab === 'caregivers' && (
        <CaregiverOverview
          caregivers={caregivers}
          onUpdateFreeEntry={updateCaregiverFreeEntry}
        />
      )}

      {/* Listen-Tab */}
      {activeTab === 'list' && <div className="flex gap-6">
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Einträge</h3>
              <p className="text-gray-600">Für diesen Filter gibt es keine Anmeldungen.</p>
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
                {registrations.map((vip) => {
                  const issues = detectClarityIssues(vip);
                  const hasClarityIssue = issues.length > 0;
                  return (
                    <tr
                      key={vip.id}
                      onClick={() => setSelectedVip(vip)}
                      className={`hover:bg-blue-50 cursor-pointer ${
                        selectedVip?.id === vip.id ? 'bg-blue-50' : ''
                      } ${!vip.viewed_at ? 'font-semibold' : ''} ${
                        hasClarityIssue ? 'bg-orange-50' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {hasClarityIssue && (
                            <span className="text-orange-500 text-xs" title={issues.join('\n')}>⚠️</span>
                          )}
                          <div>
                            <div className="text-sm text-gray-900">
                              {vip.first_name} {vip.last_name}
                            </div>
                            <div className="text-xs text-gray-500">{vip.email || '— keine E-Mail'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {arrivalLabels[vip.arrival_time || ''] || '-'}
                      </td>
                      <td className="px-4 py-3 text-center text-sm">
                        {vip.has_iv_card ? '✅' : '—'}
                      </td>
                      <td className="px-4 py-3 text-center text-sm">
                        {vip.tixi_taxi ? (vip.tixi_address ? '🚕' : '🚕⚠️') : '—'}
                      </td>
                      <td className="px-4 py-3 text-center text-sm">
                        {vip.needs_caregiver ? (vip.caregiver_name ? '👤' : '👤⚠️') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          statusConfig[vip.status]?.bgColor || 'bg-gray-100'
                        } ${statusConfig[vip.status]?.color || 'text-gray-700'}`}>
                          {statusConfig[vip.status]?.label || vip.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatDate(vip.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Detail Panel */}
        {selectedVip && (
          <VipDetailPanel
            vip={selectedVip}
            clarityIssues={detectClarityIssues(selectedVip)}
            onStatusChange={(status) => updateStatus(selectedVip.id, status)}
            onCaregiverFreeEntry={(val, phone) => updateCaregiverFreeEntry(selectedVip.id, val, phone)}
            onSaveNotes={(notes) => saveNotes(selectedVip.id, notes)}
            onClose={() => setSelectedVip(null)}
          />
        )}
      </div>}
    </div>
  );
}

// ─── Betreuer-Übersicht ───────────────────────────────────────────────────────

const freeEntryConfig = {
  yes:     { label: 'Gratis',             bg: 'bg-green-100',  text: 'text-green-800',  icon: '✅' },
  no:      { label: 'Zahlt Eintritt',     bg: 'bg-red-100',    text: 'text-red-800',    icon: '💳' },
  pending: { label: 'Entscheidung offen', bg: 'bg-orange-100', text: 'text-orange-800', icon: '⏳' },
};

function CaregiverOverview({
  caregivers,
  onUpdateFreeEntry,
}: {
  caregivers: CaregiverSummary[];
  onUpdateFreeEntry: (id: string, value: string, phone?: string) => void;
}) {
  if (caregivers.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center text-gray-500">
        Keine Betreuer-Daten vorhanden
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h2 className="font-bold text-purple-900">Betreuer-Übersicht · Inclusions 2 (25. April)</h2>
        <p className="text-sm text-purple-800 mt-1">
          Entscheide hier pro Betreuer ob sie gratis eingelassen werden oder Eintritt zahlen müssen.
          <br /><strong>Regel:</strong> 1:1 Begleitung (1 VIP) → Gratis · Gruppen-Betreuer (&gt;1 VIP) → Entscheidung nötig
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Betreuer:in</th>
              <th className="px-5 py-3 text-center text-xs font-medium text-gray-500 uppercase">VIP-Gäste</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Typ</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Eintritt</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entscheidung</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {caregivers.map((cg, i) => {
              const entry = freeEntryConfig[cg.caregiver_free_entry || 'pending'];
              const isGroup = Number(cg.vip_count) > 1;
              const firstRegId = cg.registration_ids?.[0] || '';
              return (
                <tr key={i} className={`${cg.caregiver_free_entry === 'pending' || !cg.caregiver_free_entry ? 'bg-orange-50' : ''}`}>
                  <td className="px-5 py-4">
                    <div className="font-medium text-gray-900">{cg.caregiver_name}</div>
                    <div className="text-xs text-gray-500">{cg.caregiver_phone}</div>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className={`text-lg font-bold ${isGroup ? 'text-purple-700' : 'text-gray-700'}`}>
                      {cg.vip_count}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      isGroup ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {isGroup ? `👥 Gruppe (${cg.vip_count} Gäste)` : '🙋 1:1 Begleitung'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${entry.bg} ${entry.text}`}>
                      {entry.icon} {entry.label}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      {(['yes', 'no', 'pending'] as const).map((val) => (
                        <button
                          key={val}
                          onClick={() => onUpdateFreeEntry(firstRegId, val, cg.caregiver_phone)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            (cg.caregiver_free_entry || 'pending') === val
                              ? `${freeEntryConfig[val].bg} ${freeEntryConfig[val].text} ring-2 ring-offset-1 ring-current`
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {freeEntryConfig[val].icon} {val === 'yes' ? 'Gratis' : val === 'no' ? 'Zahlt' : 'Offen'}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 text-sm text-gray-600">
        <strong>Hinweis zur Einlass-Liste:</strong> Wenn du auf &quot;Gratis&quot; oder &quot;Zahlt&quot; klickst, wird die Entscheidung für alle Anmeldungen dieses Betreuers gleichzeitig gesetzt.
      </div>
    </div>
  );
}

// ─── VIP Detail Panel ─────────────────────────────────────────────────────────

function VipDetailPanel({
  vip,
  clarityIssues,
  onStatusChange,
  onCaregiverFreeEntry,
  onSaveNotes,
  onClose,
}: {
  vip: VipRegistration;
  clarityIssues: string[];
  onStatusChange: (status: string) => void;
  onCaregiverFreeEntry: (value: string, phone?: string) => void;
  onSaveNotes: (notes: string) => void;
  onClose: () => void;
}) {
  const [notes, setNotes] = useState(vip.admin_notes || '');

  useEffect(() => { setNotes(vip.admin_notes || ''); }, [vip.id]);

  const emailSubject = encodeURIComponent(`Deine VIP-Anmeldung Inclusions – kurze Rückfrage`);
  const emailBody    = encodeURIComponent(
    `Hallo ${vip.first_name}\n\nVielen Dank für deine Anmeldung zur Inclusions Party am 25. April 2026.\n\n` +
    `Wir haben noch eine kurze Frage zu deiner Anmeldung:\n\n` +
    clarityIssues.map((i) => `• ${i}`).join('\n') +
    `\n\nBitte antworte kurz auf diese Mail, damit wir alles perfekt für dich vorbereiten können.\n\n` +
    `Liebe Grüsse\nInclusions Team\ninfo@inclusions.zone`
  );

  return (
    <div className="w-96 bg-white rounded-lg border border-gray-200 p-6 space-y-5 sticky top-4 max-h-[85vh] overflow-y-auto">
      <div className="flex items-start justify-between">
        <h2 className="text-xl font-bold text-gray-900">
          {vip.first_name} {vip.last_name}
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
      </div>

      {/* Klärungsliste (wenn Probleme vorhanden) */}
      {clarityIssues.length > 0 && (
        <div className="bg-orange-50 border border-orange-300 rounded-lg p-4 space-y-3">
          <h3 className="font-bold text-orange-900 text-sm uppercase flex items-center gap-2">
            ⚠️ Klärung nötig
          </h3>
          <ul className="space-y-1">
            {clarityIssues.map((issue, i) => (
              <li key={i} className="text-sm text-orange-800 flex gap-2">
                <span className="text-orange-400 mt-0.5">•</span>
                <span>{issue}</span>
              </li>
            ))}
          </ul>
          <div className="pt-1 flex gap-2">
            <a
              href={`mailto:${vip.email}?subject=${emailSubject}&body=${emailBody}`}
              className="flex-1 px-3 py-2 bg-orange-600 text-white rounded-lg text-sm text-center hover:bg-orange-700 transition-colors"
            >
              ✉️ Anfrage senden
            </a>
            <button
              onClick={() => onStatusChange('needs_clarification')}
              className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                vip.status === 'needs_clarification'
                  ? 'bg-orange-500 text-white'
                  : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
              }`}
            >
              Als Klärung markieren
            </button>
          </div>
        </div>
      )}

      {/* Sicherheits-Info */}
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

      {/* Notfall-Kontakt */}
      {(vip.emergency_contact_name || vip.caregiver_name || vip.cg_first_name) && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h3 className="font-bold text-orange-900 text-sm uppercase">Notfall / Betreuer</h3>
          <div className="text-sm text-orange-800 mt-1 space-y-1">
            {vip.needs_caregiver && vip.caregiver_name && (
              <>
                <div>👤 {vip.caregiver_name} (1:1 Betreuer)</div>
                {vip.caregiver_phone && <div>📞 {vip.caregiver_phone}</div>}
              </>
            )}
            {vip.registration_type === 'caregiver' && vip.cg_first_name && (
              <>
                <div>👤 {vip.cg_first_name} {vip.cg_last_name} (Anmeldung durch Betreuer:in)</div>
                {vip.cg_phone && <div>📞 {vip.cg_phone}</div>}
                {vip.cg_email && <div>✉️ {vip.cg_email}</div>}
              </>
            )}
            {vip.emergency_contact_name && (
              <>
                <div>🆘 {vip.emergency_contact_name}</div>
                {vip.emergency_contact_phone && <div>📞 {vip.emergency_contact_phone}</div>}
              </>
            )}
          </div>
        </div>
      )}

      {/* Kontakt-Daten */}
      <div className="space-y-1 text-sm">
        <h3 className="font-bold text-gray-900">Kontakt</h3>
        {vip.email ? (
          <a href={`mailto:${vip.email}`} className="text-blue-600 hover:underline block">✉️ {vip.email}</a>
        ) : (
          <div className="text-red-500">✉️ Keine E-Mail erfasst</div>
        )}
        {vip.phone && <div className="text-gray-600">📞 {vip.phone}</div>}
        {vip.address && <div className="text-gray-600">📍 {vip.address}</div>}
        {vip.postal_code && <div className="text-gray-600">📮 {vip.postal_code} {vip.city}</div>}
      </div>

      {/* Event-Details */}
      <div className="space-y-1 text-sm">
        <h3 className="font-bold text-gray-900">Event-Details</h3>
        {vip.event_date && <div className="text-gray-600">📅 {new Date(vip.event_date).toLocaleDateString('de-CH')}</div>}
        {vip.event_location && <div className="text-gray-600">📍 {vip.event_location}</div>}
        <div className="text-gray-600">🕐 {arrivalLabels[vip.arrival_time || ''] || 'Ankunft unbekannt'}</div>
        <div className={`${vip.tixi_taxi && !vip.tixi_address ? 'text-orange-600 font-medium' : 'text-gray-600'}`}>
          🚕 TIXI: {vip.tixi_taxi ? `Ja${vip.tixi_address ? ` – ${vip.tixi_address}` : ' – ⚠️ Adresse fehlt'}` : 'Nein'}
        </div>
      </div>

      {/* Anmeldungs-Typ */}
      <div className="text-sm">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          vip.registration_type === 'caregiver' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
        }`}>
          {vip.registration_type === 'caregiver' ? '👥 Betreuer-Anmeldung' : '🙋 Selbst-Anmeldung'}
        </span>
      </div>

      {/* Betreuer-Eintritt */}
      {(vip.needs_caregiver || vip.caregiver_name) && (
        <div className="space-y-2 border border-purple-200 rounded-lg p-3 bg-purple-50">
          <h3 className="font-bold text-purple-900 text-sm">Betreuer-Eintritt</h3>
          {vip.caregiver_name && (
            <div className="text-sm text-purple-800">
              👤 <strong>{vip.caregiver_name}</strong>
              {vip.caregiver_phone && <span className="ml-1 text-purple-600">· {vip.caregiver_phone}</span>}
            </div>
          )}
          <div className="flex gap-2">
            {(['yes', 'no', 'pending'] as const).map((val) => {
              const cfg = freeEntryConfig[val];
              return (
                <button
                  key={val}
                  onClick={() => onCaregiverFreeEntry(val, vip.caregiver_phone)}
                  className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    (vip.caregiver_free_entry || 'pending') === val
                      ? `${cfg.bg} ${cfg.text} ring-2 ring-offset-1 ring-current`
                      : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {cfg.icon} {val === 'yes' ? 'Gratis' : val === 'no' ? 'Zahlt' : 'Offen'}
                </button>
              );
            })}
          </div>
          {vip.caregiver_phone && (
            <p className="text-xs text-purple-600">
              Gilt für alle Anmeldungen mit derselben Betreuer-Telefonnummer.
            </p>
          )}
        </div>
      )}

      {/* Status-Buttons */}
      <div className="space-y-2">
        <h3 className="font-bold text-gray-900 text-sm">Status</h3>
        <div className="grid grid-cols-2 gap-2">
          {(['confirmed', 'pending', 'needs_clarification', 'cancelled'] as const).map((s) => (
            <button
              key={s}
              onClick={() => onStatusChange(s)}
              className={`px-3 py-2 text-xs rounded-lg transition-colors font-medium ${
                vip.status === s
                  ? `${statusConfig[s].bgColor} ${statusConfig[s].color} ring-2 ring-offset-1 ring-current`
                  : `${statusConfig[s].bgColor} ${statusConfig[s].color} opacity-60 hover:opacity-100`
              }`}
            >
              {s === 'confirmed' ? '✓ ' : s === 'cancelled' ? '✗ ' : s === 'needs_clarification' ? '⚠️ ' : '○ '}
              {statusConfig[s].label}
            </button>
          ))}
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
          placeholder="Interne Notizen, Klärungen, Rückfragen..."
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
