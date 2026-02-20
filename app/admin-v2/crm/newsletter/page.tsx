'use client';

import { useState, useEffect } from 'react';

interface Subscription {
  id: string;
  contact_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  has_disability: boolean;
  interests: string[];
  status: 'pending' | 'confirmed' | 'unsubscribed';
  opt_in_confirmed_at?: string;
  created_at: string;
}

const statusConfig = {
  pending: { label: 'Ausstehend', color: 'text-yellow-800', bgColor: 'bg-yellow-100' },
  confirmed: { label: 'Bestätigt', color: 'text-green-800', bgColor: 'bg-green-100' },
  unsubscribed: { label: 'Abgemeldet', color: 'text-gray-800', bgColor: 'bg-gray-100' },
};

export default function NewsletterPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchSubscriptions();
  }, [statusFilter, search]);

  async function fetchSubscriptions() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (search) params.append('search', search);
      const res = await fetch(`/api/admin-v2/newsletter-subscriptions?${params}`);
      const data = await res.json();
      if (data.success) {
        setSubscriptions(data.subscriptions);
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
      await fetch(`/api/admin-v2/newsletter-subscriptions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      showSuccess('Status aktualisiert');
      fetchSubscriptions();
    } catch (error) {
      alert('Fehler');
    }
  }

  async function handleDelete(id: string, email: string) {
    if (!confirm(`${email} wirklich löschen?`)) return;
    try {
      await fetch(`/api/admin-v2/newsletter-subscriptions/${id}`, { method: 'DELETE' });
      showSuccess('Gelöscht');
      fetchSubscriptions();
    } catch (error) {
      alert('Fehler');
    }
  }

  function exportCSV() {
    const confirmed = subscriptions.filter(s => s.status === 'confirmed');
    const csv = [
      'Email,Vorname,Nachname,Interessen',
      ...confirmed.map(s =>
        `${s.email},${s.first_name},${s.last_name},"${(s.interests || []).join(', ')}"`
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showSuccess('CSV exportiert');
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

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Newsletter</h1>
          <p className="mt-2 text-gray-600">{stats.confirmed_count || 0} bestätigte Abonnenten</p>
        </div>
        <button
          onClick={exportCSV}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          CSV Export (Mailchimp)
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-800">{stats.confirmed_count || 0}</div>
          <div className="text-sm text-green-700">Bestätigt</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-800">{stats.pending_count || 0}</div>
          <div className="text-sm text-yellow-700">Ausstehend</div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-800">{stats.unsubscribed_count || 0}</div>
          <div className="text-sm text-gray-600">Abgemeldet</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 grid grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Suche nach Name, E-Mail..."
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
          <option value="confirmed">Bestätigt</option>
          <option value="pending">Ausstehend</option>
          <option value="unsubscribed">Abgemeldet</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📧</div>
            <h3 className="text-lg font-medium text-gray-900">Keine Abonnenten</h3>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">E-Mail</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Interessen</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Beeinträchtigung</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {subscriptions.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                    {sub.first_name} {sub.last_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{sub.email}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(sub.interests || []).map((i) => (
                        <span key={i} className="px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded-full">
                          {i}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-sm">
                    {sub.has_disability ? '♿' : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusConfig[sub.status].bgColor} ${statusConfig[sub.status].color}`}>
                      {statusConfig[sub.status].label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm">
                    {sub.status === 'pending' && (
                      <button
                        onClick={() => updateStatus(sub.id, 'confirmed')}
                        className="text-green-600 hover:text-green-900 mr-2"
                      >
                        Bestätigen
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(sub.id, sub.email)}
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
    </div>
  );
}
