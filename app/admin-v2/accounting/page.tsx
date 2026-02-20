'use client';

import { useState, useEffect } from 'react';

type EntryType = 'income' | 'expense';

interface JournalEntry {
  id: string;
  entry_type: EntryType;
  entry_date: string;
  amount_chf: number;
  vat_rate: number;
  vat_amount_chf: number;
  category?: string;
  subcategory?: string;
  description?: string;
  reference?: string;
  notes?: string;
  is_reconciled?: boolean;
  metadata?: any;
  supplier?: string;
  paid_by?: string;
  is_reimbursed?: boolean;
  original_currency?: string;
  original_amount?: number;
  receipt_url?: string;
  receipt_filename?: string;
  created_at: string;
}

interface Summary {
  total_income: number;
  total_expense: number;
  reimbursed_expense: number;
  open_expense: number;
  balance: number;
}

// Schweizer MWST-Sätze 2026
const VAT_RATES = [
  { value: 0, label: '0% (MWST-befreit)' },
  { value: 2.6, label: '2.6% (reduziert)' },
  { value: 8.1, label: '8.1% (normal)' },
];

// Kategorien für Vereinsbuchhaltung
const INCOME_CATEGORIES = [
  'Eintrittsgelder',
  'Bar-Einnahmen',
  'Sponsoring',
  'Mitgliederbeiträge',
  'Spenden',
  'Sonstige Einnahmen',
];

const EXPENSE_CATEGORIES = [
  'Location-Miete',
  'Equipment',
  'Marketing',
  'Personal',
  'Getränke & Verpflegung',
  'Versicherungen',
  'Verwaltung',
  'Sonstige Ausgaben',
];

const CURRENCIES = ['CHF', 'USD', 'EUR'];

export default function AccountingPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [summary, setSummary] = useState<Summary>({
    total_income: 0,
    total_expense: 0,
    reimbursed_expense: 0,
    open_expense: 0,
    balance: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [importing, setImporting] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'expenses' | 'income'>('expenses');

  // Filter
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [typeFilter, setTypeFilter] = useState<'' | EntryType>('');
  const [reimbursedFilter, setReimbursedFilter] = useState<'' | 'true' | 'false'>('');

  useEffect(() => {
    fetchEntries();
  }, [dateFrom, dateTo, typeFilter, reimbursedFilter, activeTab]);

  async function fetchEntries() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateFrom) params.append('from', dateFrom);
      if (dateTo) params.append('to', dateTo);

      // Tab-Filter
      if (activeTab === 'expenses') {
        params.append('type', 'expense');
      } else if (activeTab === 'income') {
        params.append('type', 'income');
      } else if (typeFilter) {
        params.append('type', typeFilter);
      }

      if (reimbursedFilter) params.append('reimbursed', reimbursedFilter);

      const res = await fetch(`/api/admin-v2/journal?${params}`);
      const data = await res.json();

      if (data.success) {
        setEntries(data.entries);
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('Fehler beim Laden:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleImport() {
    if (!confirm('Möchtest du die Ausgaben aus dem Google Sheet importieren? Dies erstellt 30 Einträge.')) return;

    setImporting(true);
    try {
      const res = await fetch('/api/admin-v2/journal/import', { method: 'POST' });
      const data = await res.json();

      if (data.success) {
        showSuccess(`${data.summary.imported} Ausgaben importiert (Total: CHF ${data.summary.total_amount_chf})`);
        fetchEntries();
      } else {
        alert(data.error || 'Import fehlgeschlagen');
      }
    } catch (error) {
      alert('Netzwerkfehler beim Import');
    } finally {
      setImporting(false);
    }
  }

  async function handleDelete(id: string, description: string) {
    if (!confirm(`Möchtest du "${description}" wirklich löschen?`)) return;

    try {
      const res = await fetch(`/api/admin-v2/journal/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (data.success) {
        showSuccess('Eintrag erfolgreich gelöscht');
        fetchEntries();
      }
    } catch (error) {
      alert('Fehler beim Löschen');
    }
  }

  function showSuccess(message: string) {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 4000);
  }

  function openModal(entry?: JournalEntry) {
    setEditingEntry(entry || null);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingEntry(null);
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('de-CH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // Aktuelles Jahr als Default
  const currentYear = new Date().getFullYear();
  const defaultFrom = `${currentYear - 1}-01-01`;
  const defaultTo = `${currentYear}-12-31`;

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          {successMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Buchhaltung</h1>
          <p className="mt-2 text-gray-600">Vereins-Journal mit Schweizer MWST | Alle Beträge in CHF</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleImport}
            disabled={importing}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors text-sm"
            title="Ausgaben aus Google Sheet importieren"
          >
            {importing ? 'Importiere...' : 'Google Sheet Import'}
          </button>
          <button
            onClick={() => openModal()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Neuer Eintrag
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-xs font-medium text-green-800 mb-1">Einnahmen</div>
          <div className="text-xl font-bold text-green-900">
            {formatCurrency(summary.total_income)}
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-xs font-medium text-red-800 mb-1">Ausgaben Total</div>
          <div className="text-xl font-bold text-red-900">
            {formatCurrency(summary.total_expense)}
          </div>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <div className="text-xs font-medium text-emerald-800 mb-1">Als Spesen beglichen</div>
          <div className="text-xl font-bold text-emerald-900">
            {formatCurrency(summary.reimbursed_expense)}
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="text-xs font-medium text-amber-800 mb-1">Noch offen</div>
          <div className="text-xl font-bold text-amber-900">
            {formatCurrency(summary.open_expense)}
          </div>
        </div>
        <div
          className={`border rounded-lg p-4 ${
            summary.balance >= 0
              ? 'bg-blue-50 border-blue-200'
              : 'bg-orange-50 border-orange-200'
          }`}
        >
          <div
            className={`text-xs font-medium mb-1 ${
              summary.balance >= 0 ? 'text-blue-800' : 'text-orange-800'
            }`}
          >
            Saldo
          </div>
          <div
            className={`text-xl font-bold ${
              summary.balance >= 0 ? 'text-blue-900' : 'text-orange-900'
            }`}
          >
            {formatCurrency(summary.balance)}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => setActiveTab('expenses')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'expenses'
              ? 'bg-white text-red-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Ausgaben
        </button>
        <button
          onClick={() => setActiveTab('income')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'income'
              ? 'bg-white text-green-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Einnahmen
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'all'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Alle
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Von</label>
            <input
              type="date"
              value={dateFrom || defaultFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bis</label>
            <input
              type="date"
              value={dateTo || defaultTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Spesen-Status</label>
            <select
              value={reimbursedFilter}
              onChange={(e) => setReimbursedFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            >
              <option value="">Alle</option>
              <option value="true">Als Spesen beglichen</option>
              <option value="false">Noch offen</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quelle</label>
            <a
              href="https://docs.google.com/spreadsheets/d/1Xh9NJkjNCIiE-P4cuOREqCGyqx7EGP83_BwO4aVBBwo"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
              Google Sheet
            </a>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setDateFrom('');
                setDateTo('');
                setTypeFilter('');
                setReimbursedFilter('');
              }}
              className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Filter zurücksetzen
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Lade Einträge...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Noch keine Einträge
            </h3>
            <p className="text-gray-600 mb-6">
              Importiere Ausgaben aus dem Google Sheet oder erstelle einen neuen Eintrag
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleImport}
                disabled={importing}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
              >
                {importing ? 'Importiere...' : 'Google Sheet importieren'}
              </button>
              <button
                onClick={() => openModal()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                + Manuell erstellen
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Datum
                  </th>
                  {activeTab === 'all' && (
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Typ
                    </th>
                  )}
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Beschreibung
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lieferant
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategorie
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Originalwährung
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Betrag CHF
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bezahlt von
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Spesen
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quittung
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(entry.entry_date)}
                    </td>
                    {activeTab === 'all' && (
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                            entry.entry_type === 'income'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {entry.entry_type === 'income' ? 'Einnahme' : 'Ausgabe'}
                        </span>
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">
                        {entry.description || '-'}
                      </div>
                      {entry.notes && !entry.notes.includes('Google-Sheet-Import') && (
                        <div className="text-xs text-gray-500 mt-0.5">{entry.notes}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {entry.supplier || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {entry.category ? (
                        <span className="inline-flex px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded">
                          {entry.category}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-500">
                      {entry.original_currency && entry.original_currency !== 'CHF' && entry.original_amount ? (
                        <span>
                          {Number(entry.original_amount).toFixed(2)} {entry.original_currency}
                        </span>
                      ) : (
                        <span className="text-gray-300">CHF</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <div
                        className={`text-sm font-bold ${
                          entry.entry_type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {formatCurrency(entry.amount_chf)}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-600">
                      {entry.paid_by || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      {entry.entry_type === 'expense' ? (
                        entry.is_reimbursed ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-800 rounded-full">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Beglichen
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 rounded-full">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Offen
                          </span>
                        )
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center text-sm">
                      {entry.receipt_filename ? (
                        <a
                          href={entry.receipt_url || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                          title={entry.receipt_filename}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                          <span className="text-xs max-w-[100px] truncate">{entry.receipt_filename}</span>
                        </a>
                      ) : entry.metadata?.attachment ? (
                        <a
                          href={entry.metadata.attachment.data}
                          download={entry.metadata.attachment.filename}
                          className="text-blue-600 hover:text-blue-900"
                          title={entry.metadata.attachment.filename}
                        >
                          <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                        </a>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => openModal(entry)}
                        className="text-blue-600 hover:text-blue-900 mr-2"
                        title="Bearbeiten"
                      >
                        <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(entry.id, entry.description || 'Eintrag')}
                        className="text-red-600 hover:text-red-900"
                        title="Löschen"
                      >
                        <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                <tr>
                  <td colSpan={activeTab === 'all' ? 6 : 5} className="px-4 py-3 text-sm font-bold text-gray-700 text-right">
                    Total:
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <div className="text-sm font-bold text-gray-900">
                      {formatCurrency(
                        entries.reduce((sum, e) => sum + parseFloat(String(e.amount_chf)), 0)
                      )}
                    </div>
                  </td>
                  <td colSpan={4}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Entries count */}
      {!loading && entries.length > 0 && (
        <div className="text-sm text-gray-500 text-right">
          {entries.length} Einträge angezeigt
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <JournalModal
          entry={editingEntry}
          onClose={closeModal}
          onSuccess={(message) => {
            showSuccess(message);
            fetchEntries();
            closeModal();
          }}
        />
      )}
    </div>
  );
}

function JournalModal({
  entry,
  onClose,
  onSuccess,
}: {
  entry: JournalEntry | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
}) {
  const [formData, setFormData] = useState({
    entry_type: entry?.entry_type || 'expense',
    entry_date: entry?.entry_date?.split('T')[0] || new Date().toISOString().split('T')[0],
    amount_chf: entry?.amount_chf || 0,
    vat_rate: entry?.vat_rate || 0,
    category: entry?.category || '',
    description: entry?.description || '',
    reference: entry?.reference || '',
    notes: entry?.notes || '',
    supplier: entry?.supplier || '',
    paid_by: entry?.paid_by || 'Roland',
    is_reimbursed: entry?.is_reimbursed || false,
    original_currency: entry?.original_currency || 'CHF',
    original_amount: entry?.original_amount || 0,
    receipt_url: entry?.receipt_url || '',
    receipt_filename: entry?.receipt_filename || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string>('');

  // Berechne MWST-Betrag automatisch
  const vatAmount = (formData.amount_chf * formData.vat_rate) / 100;
  const totalWithVat = formData.amount_chf + vatAmount;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Datei zu gross (max 5MB)');
        return;
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError('Nur JPG, PNG oder PDF erlaubt');
        return;
      }

      setAttachmentFile(file);

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setAttachmentPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setAttachmentPreview('');
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      let attachmentData = null;
      if (attachmentFile) {
        const reader = new FileReader();
        attachmentData = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(attachmentFile);
        });
      }

      const url = entry ? `/api/admin-v2/journal/${entry.id}` : '/api/admin-v2/journal';
      const method = entry ? 'PUT' : 'POST';

      const payload = {
        ...formData,
        vat_amount_chf: vatAmount,
        is_reconciled: true,
        metadata: attachmentData
          ? {
              attachment: {
                filename: attachmentFile?.name,
                type: attachmentFile?.type,
                data: attachmentData,
              },
            }
          : entry?.metadata || null,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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

  const categories =
    formData.entry_type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {entry ? 'Eintrag bearbeiten' : 'Neuer Eintrag'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Typ und Datum */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Typ *</label>
              <select
                value={formData.entry_type}
                onChange={(e) =>
                  setFormData({ ...formData, entry_type: e.target.value as EntryType, category: '' })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              >
                <option value="expense">Ausgabe</option>
                <option value="income">Einnahme</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Datum *</label>
              <input
                type="date"
                required
                value={formData.entry_date}
                onChange={(e) => setFormData({ ...formData, entry_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              />
            </div>
          </div>

          {/* Beschreibung und Lieferant */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung *</label>
              <input
                type="text"
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                placeholder="z.B. AI Videos, Newsletter, Hosting"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lieferant / Partner</label>
              <input
                type="text"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                placeholder="z.B. HeyGen, Mailchimp, Upwork"
              />
            </div>
          </div>

          {/* Kategorie und Referenz */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategorie</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              >
                <option value="">Kategorie wählen...</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Referenz-Nr.</label>
              <input
                type="text"
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                placeholder="RE-2026-001"
              />
            </div>
          </div>

          {/* Währung und Beträge */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Originalwährung</label>
              <select
                value={formData.original_currency}
                onChange={(e) => setFormData({ ...formData, original_currency: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            {formData.original_currency !== 'CHF' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Betrag ({formData.original_currency})
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.original_amount}
                  onChange={(e) => setFormData({ ...formData, original_amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Betrag CHF *</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.amount_chf}
                onChange={(e) => setFormData({ ...formData, amount_chf: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                placeholder="500.00"
              />
            </div>
          </div>

          {/* MWST */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">MWST-Satz</label>
              <select
                value={formData.vat_rate}
                onChange={(e) => setFormData({ ...formData, vat_rate: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              >
                {VAT_RATES.map((rate) => (
                  <option key={rate.value} value={rate.value}>{rate.label}</option>
                ))}
              </select>
              {formData.vat_rate > 0 && (
                <p className="text-xs text-gray-500 mt-1">MWST: CHF {vatAmount.toFixed(2)}</p>
              )}
            </div>
          </div>

          {/* MWST Berechnung */}
          {formData.vat_rate > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-gray-600">Netto</div>
                  <div className="font-bold text-gray-900">CHF {formData.amount_chf.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-gray-600">MWST ({formData.vat_rate}%)</div>
                  <div className="font-bold text-gray-900">CHF {vatAmount.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-gray-600">Brutto (Total)</div>
                  <div className="font-bold text-blue-900">CHF {totalWithVat.toFixed(2)}</div>
                </div>
              </div>
            </div>
          )}

          {/* Bezahlt von und Spesen */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bezahlt von</label>
              <input
                type="text"
                value={formData.paid_by}
                onChange={(e) => setFormData({ ...formData, paid_by: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                placeholder="Name der Person"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 px-3 py-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_reimbursed}
                  onChange={(e) => setFormData({ ...formData, is_reimbursed: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                />
                <span className="text-sm font-medium text-gray-700">Als Spesen beglichen</span>
              </label>
            </div>
          </div>

          {/* Quittung URL */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quittungs-Link (URL)</label>
              <input
                type="url"
                value={formData.receipt_url}
                onChange={(e) => setFormData({ ...formData, receipt_url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                placeholder="https://drive.google.com/..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quittungs-Dateiname</label>
              <input
                type="text"
                value={formData.receipt_filename}
                onChange={(e) => setFormData({ ...formData, receipt_filename: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                placeholder="rechnung.pdf"
              />
            </div>
          </div>

          {/* Beleg-Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Oder: Beleg hochladen (Quittung, Rechnung)
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/jpg,application/pdf"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="text-xs text-gray-500 mt-1">JPG, PNG oder PDF (max 5MB)</p>

            {attachmentPreview && (
              <div className="mt-2">
                <img src={attachmentPreview} alt="Vorschau" className="max-w-xs rounded border border-gray-200" />
              </div>
            )}

            {attachmentFile && (
              <div className="mt-2 text-sm text-green-600">
                {attachmentFile.name} ({(attachmentFile.size / 1024).toFixed(1)} KB)
              </div>
            )}
          </div>

          {/* Notizen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notizen</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              rows={2}
              placeholder="Zusätzliche Informationen..."
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
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
              {saving ? 'Speichere...' : entry ? 'Aktualisieren' : 'Erstellen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
