'use client';

import { useState, useEffect } from 'react';

type DealStatus = 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';

interface Deal {
  id: string;
  title: string;
  description?: string;
  contact_name?: string;
  company_name?: string;
  amount_chf: number;
  status: DealStatus;
  expected_close_date?: string;
  notes?: string;
  created_at: string;
}

const statusConfig: Record<DealStatus, { label: string; color: string; bgColor: string }> = {
  lead: { label: 'Lead', color: 'text-gray-800', bgColor: 'bg-gray-100' },
  qualified: { label: 'Qualifiziert', color: 'text-blue-800', bgColor: 'bg-blue-100' },
  proposal: { label: 'Angebot', color: 'text-yellow-800', bgColor: 'bg-yellow-100' },
  negotiation: { label: 'Verhandlung', color: 'text-orange-800', bgColor: 'bg-orange-100' },
  won: { label: 'Gewonnen', color: 'text-green-800', bgColor: 'bg-green-100' },
  lost: { label: 'Verloren', color: 'text-red-800', bgColor: 'bg-red-100' },
};

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'pipeline' | 'list'>('pipeline');
  const [showModal, setShowModal] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchDeals();
  }, []);

  async function fetchDeals() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin-v2/deals');
      const data = await res.json();

      if (data.success) {
        setDeals(data.deals);
      }
    } catch (error) {
      console.error('Fehler beim Laden:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Möchten Sie "${title}" wirklich löschen?`)) return;

    try {
      const res = await fetch(`/api/admin-v2/deals/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (data.success) {
        showSuccess('Deal erfolgreich gelöscht');
        fetchDeals();
      }
    } catch (error) {
      alert('Fehler beim Löschen');
    }
  }

  function showSuccess(message: string) {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  }

  function openModal(deal?: Deal) {
    setEditingDeal(deal || null);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingDeal(null);
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const dealsByStatus = (status: DealStatus) =>
    deals.filter((d) => d.status === status);

  const getTotalByStatus = (status: DealStatus) =>
    dealsByStatus(status).reduce((sum, d) => sum + d.amount_chf, 0);

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          ✓ {successMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Deals</h1>
          <p className="mt-2 text-gray-600">
            {deals.length} {deals.length === 1 ? 'Deal' : 'Deals'} • Gesamt:{' '}
            {formatCurrency(deals.reduce((sum, d) => sum + d.amount_chf, 0))}
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView('pipeline')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                view === 'pipeline'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Pipeline
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                view === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Liste
            </button>
          </div>
          <button
            onClick={() => openModal()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Neuer Deal
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Lade Deals...</p>
        </div>
      ) : (
        <>
          {/* Pipeline View */}
          {view === 'pipeline' && (
            <div className="grid grid-cols-6 gap-4">
              {(Object.keys(statusConfig) as DealStatus[]).map((status) => (
                <div key={status} className="bg-gray-50 rounded-lg p-4">
                  <div className="mb-3">
                    <h3 className="font-semibold text-gray-900">
                      {statusConfig[status].label}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {dealsByStatus(status).length} • {formatCurrency(getTotalByStatus(status))}
                    </p>
                  </div>
                  <div className="space-y-3">
                    {dealsByStatus(status).map((deal) => (
                      <div
                        key={deal.id}
                        className="bg-white p-3 rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => openModal(deal)}
                      >
                        <h4 className="font-medium text-gray-900 text-sm mb-1">
                          {deal.title}
                        </h4>
                        <p className="text-lg font-bold text-blue-600">
                          {formatCurrency(deal.amount_chf)}
                        </p>
                        {deal.contact_name && (
                          <p className="text-xs text-gray-500 mt-1">
                            {deal.contact_name}
                          </p>
                        )}
                        {deal.expected_close_date && (
                          <p className="text-xs text-gray-500 mt-1">
                            📅 {new Date(deal.expected_close_date).toLocaleDateString('de-CH')}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* List View */}
          {view === 'list' && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {deals.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">💰</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Noch keine Deals
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Erstelle deinen ersten Deal
                  </p>
                  <button
                    onClick={() => openModal()}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    + Ersten Deal erstellen
                  </button>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Titel
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Kontakt / Firma
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Betrag (CHF)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Fälligkeit
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Aktionen
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {deals.map((deal) => (
                      <tr key={deal.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {deal.title}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {deal.contact_name || deal.company_name || '-'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(deal.amount_chf)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              statusConfig[deal.status].bgColor
                            } ${statusConfig[deal.status].color}`}
                          >
                            {statusConfig[deal.status].label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {deal.expected_close_date
                            ? new Date(deal.expected_close_date).toLocaleDateString('de-CH')
                            : '-'}
                        </td>
                        <td className="px-6 py-4 text-right text-sm">
                          <button
                            onClick={() => openModal(deal)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            Bearbeiten
                          </button>
                          <button
                            onClick={() => handleDelete(deal.id, deal.title)}
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
          )}
        </>
      )}

      {/* Modal */}
      {showModal && (
        <DealModal
          deal={editingDeal}
          onClose={closeModal}
          onSuccess={(message) => {
            showSuccess(message);
            fetchDeals();
            closeModal();
          }}
        />
      )}
    </div>
  );
}

function DealModal({
  deal,
  onClose,
  onSuccess,
}: {
  deal: Deal | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
}) {
  const [formData, setFormData] = useState({
    title: deal?.title || '',
    description: deal?.description || '',
    amount_chf: deal?.amount_chf || 0,
    status: deal?.status || 'lead',
    expected_close_date: deal?.expected_close_date || '',
    notes: deal?.notes || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const url = deal ? `/api/admin-v2/deals/${deal.id}` : '/api/admin-v2/deals';
      const method = deal ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        onSuccess(data.message);
      } else {
        setError(data.error || 'Fehler beim Speichern');
      }
    } catch (err) {
      setError('Netzwerkfehler');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {deal ? 'Deal bearbeiten' : 'Neuer Deal'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titel *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              placeholder="Event-Sponsoring 2026"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Beschreibung
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Betrag (CHF) 🇨🇭 *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.amount_chf}
                onChange={(e) =>
                  setFormData({ ...formData, amount_chf: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                placeholder="5000"
              />
              <p className="text-xs text-gray-500 mt-1">
                Schweizer Franken (CHF)
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as DealStatus })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              >
                {(Object.keys(statusConfig) as DealStatus[]).map((status) => (
                  <option key={status} value={status}>
                    {statusConfig[status].label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Erwartetes Abschlussdatum
            </label>
            <input
              type="date"
              value={formData.expected_close_date}
              onChange={(e) =>
                setFormData({ ...formData, expected_close_date: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notizen
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              rows={3}
              placeholder="Zusätzliche Informationen..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={saving}
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {saving ? 'Speichere...' : deal ? 'Aktualisieren' : 'Erstellen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
