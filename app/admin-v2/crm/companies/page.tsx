'use client';

import { useState, useEffect } from 'react';

interface CompanyContact {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  tags?: string[];
}

interface Company {
  id: string;
  name: string;
  legal_name?: string;
  uid?: string;
  vat_number?: string;
  email?: string;
  phone?: string;
  website?: string;
  postal_code?: string;
  city?: string;
  country?: string;
  contact_count?: number;
  contacts?: CompanyContact[];
  company_type?: string;
  is_insieme?: boolean;
  insieme_region?: string;
  created_at: string;
}

const COMPANY_TYPES = [
  { value: 'insieme',     label: '🏛️ insieme Verein' },
  { value: 'institution', label: '🏥 Institution / Heim' },
  { value: 'sponsor',     label: '💰 Sponsor' },
  { value: 'partner',     label: '🤝 Partner' },
  { value: 'label',       label: '🎵 Club / Label' },
  { value: 'media',       label: '📰 Medienpartner' },
  { value: 'other',       label: '🏢 Andere' },
];

const COMPANIES_CACHE_KEY = 'crm_companies_cache_v1';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const cached = localStorage.getItem(COMPANIES_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as Company[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCompanies(parsed);
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [search]);

  async function fetchCompanies() {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      params.append('_ts', Date.now().toString());

      const res = await fetch(`/api/admin-v2/companies?${params.toString()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      const data = await res.json();

      if (res.ok && data.success) {
        const fetchedCompanies = data.companies || [];
        if (fetchedCompanies.length > 0) {
          setCompanies(fetchedCompanies);
          try {
            localStorage.setItem(COMPANIES_CACHE_KEY, JSON.stringify(fetchedCompanies));
          } catch {}
        } else {
          // Schütze bestehende Liste vor "leerem Überschreiben"
          try {
            const cached = localStorage.getItem(COMPANIES_CACHE_KEY);
            if (cached) {
              const parsed = JSON.parse(cached) as Company[];
              if (Array.isArray(parsed) && parsed.length > 0) {
                const filtered = search
                  ? parsed.filter((c) =>
                      [c.name, c.uid, c.city]
                        .filter(Boolean)
                        .some((value) =>
                          String(value).toLowerCase().includes(search.toLowerCase())
                        )
                    )
                  : parsed;
                setCompanies(filtered);
              } else {
                setCompanies([]);
              }
            } else {
              setCompanies([]);
            }
          } catch {
            setCompanies([]);
          }
        }
      } else {
        setError(data.error || 'Unternehmen konnten nicht geladen werden');
      }
    } catch (error) {
      console.error('Fehler beim Laden:', error);
      setError('Verbindung fehlgeschlagen. Bitte später erneut versuchen.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Möchten Sie ${name} wirklich löschen?`)) return;

    try {
      const res = await fetch(`/api/admin-v2/companies/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (data.success) {
        showSuccess('Unternehmen erfolgreich gelöscht');
        fetchCompanies();
      }
    } catch (error) {
      alert('Fehler beim Löschen');
    }
  }

  function showSuccess(message: string) {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  }

  function openModal(company?: Company) {
    setEditingCompany(company || null);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingCompany(null);
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Unternehmen</h1>
          <p className="mt-2 text-gray-600">
            {companies.length} {companies.length === 1 ? 'Unternehmen' : 'Unternehmen'}
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Neues Unternehmen
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <input
          type="text"
          placeholder="Suche nach Name, UID, Stadt..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {error && (
          <div className="mx-6 mt-6 mb-0 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
            {error}
          </div>
        )}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Lade Unternehmen...</p>
          </div>
        ) : companies.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏢</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {search ? 'Keine Unternehmen gefunden' : 'Noch keine Unternehmen'}
            </h3>
            <p className="text-gray-600 mb-6">
              {search ? 'Versuche eine andere Suche' : 'Füge dein erstes Unternehmen hinzu'}
            </p>
            {!search && (
              <button
                onClick={() => openModal()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                + Erstes Unternehmen hinzufügen
              </button>
            )}
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  UID 🇨🇭
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Ort
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Kontakte
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {companies.map((company) => {
                const contacts = company.contacts || [];
                const isExpanded = expandedId === company.id;
                const count = Number(company.contact_count) || 0;
                return (
                  <tr key={company.id} className="hover:bg-gray-50 align-top">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium text-gray-900">
                          {company.is_insieme && <span className="mr-1">🏛️</span>}
                          {company.name}
                        </div>
                      </div>
                      {company.legal_name && (
                        <div className="text-xs text-gray-500">{company.legal_name}</div>
                      )}
                      {company.company_type && company.company_type !== 'other' && (
                        <div className="text-xs text-blue-600 mt-0.5">
                          {COMPANY_TYPES.find(t => t.value === company.company_type)?.label}
                          {company.insieme_region && ` · ${company.insieme_region}`}
                        </div>
                      )}
                      {company.email && (
                        <div className="text-xs text-gray-400 mt-0.5">{company.email}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600 font-mono">
                        {company.uid || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {company.city
                          ? `${company.postal_code} ${company.city}, ${company.country}`
                          : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {count > 0 ? (
                        <div>
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : company.id)}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                          >
                            {count} {count === 1 ? 'Kontakt' : 'Kontakte'} {isExpanded ? '▲' : '▼'}
                          </button>
                          {isExpanded && (
                            <div className="mt-2 space-y-1.5">
                              {contacts.map(c => (
                                <div key={c.id} className="flex items-center gap-2 text-xs bg-gray-50 rounded-lg px-3 py-1.5">
                                  <span className="font-medium text-gray-800">
                                    {c.first_name} {c.last_name}
                                  </span>
                                  {c.email && (
                                    <span className="text-gray-400">{c.email}</span>
                                  )}
                                  {c.phone && (
                                    <span className="text-gray-400">{c.phone}</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">0</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => openModal(company)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Bearbeiten
                      </button>
                      <button
                        onClick={() => handleDelete(company.id, company.name)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Löschen
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <CompanyModal
          company={editingCompany}
          onClose={closeModal}
          onSuccess={(message, savedCompany) => {
            showSuccess(message);
            if (savedCompany) {
              setCompanies((prev) => {
                const idx = prev.findIndex((item) => item.id === savedCompany.id);
                let next: Company[];
                if (idx >= 0) {
                  const updated = [...prev];
                  updated[idx] = { ...updated[idx], ...savedCompany };
                  next = updated;
                } else {
                  next = [savedCompany, ...prev];
                }
                try {
                  localStorage.setItem(COMPANIES_CACHE_KEY, JSON.stringify(next));
                } catch {}
                return next;
              });
            }
            setSearch('');
            closeModal();
          }}
        />
      )}
    </div>
  );
}

function CompanyModal({
  company,
  onClose,
  onSuccess,
}: {
  company: Company | null;
  onClose: () => void;
  onSuccess: (message: string, company?: Company) => void;
}) {
  const [formData, setFormData] = useState({
    name: company?.name || '',
    legal_name: company?.legal_name || '',
    uid: company?.uid || '',
    vat_number: company?.vat_number || '',
    email: company?.email || '',
    phone: company?.phone || '',
    website: company?.website || '',
    postal_code: company?.postal_code || '',
    city: company?.city || '',
    company_type: company?.company_type || 'other',
    is_insieme: company?.is_insieme || false,
    insieme_region: company?.insieme_region || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const url = company
        ? `/api/admin-v2/companies/${company.id}`
        : '/api/admin-v2/companies';
      const method = company ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        const fallbackCompany: Company = {
          id: data.company?.id || `temp-${Date.now()}`,
          name: formData.name,
          legal_name: formData.legal_name || undefined,
          uid: formData.uid || undefined,
          vat_number: formData.vat_number || undefined,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
          website: formData.website || undefined,
          postal_code: formData.postal_code || undefined,
          city: formData.city || undefined,
          country: 'CH',
          contact_count: data.company?.contact_count || 0,
          created_at: data.company?.created_at || new Date().toISOString(),
        };
        onSuccess(data.message, data.company || fallbackCompany);
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
            {company ? 'Unternehmen bearbeiten' : 'Neues Unternehmen'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Unternehmenstyp */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Typ</label>
            <div className="flex flex-wrap gap-2">
              {COMPANY_TYPES.map(t => (
                <button type="button" key={t.value}
                  onClick={() => setFormData(f => ({
                    ...f,
                    company_type: t.value,
                    is_insieme: t.value === 'insieme',
                  }))}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                    formData.company_type === t.value
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* insieme Region */}
          {formData.is_insieme && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <label className="block text-sm font-medium text-blue-800 mb-1">
                🏛️ insieme Region / Ort
              </label>
              <input
                type="text"
                value={formData.insieme_region}
                onChange={e => setFormData(f => ({...f, insieme_region: e.target.value}))}
                placeholder="z.B. Zürich, Limmatthal, Bern..."
                className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm bg-white"
              />
              <p className="text-xs text-blue-600 mt-1">Wird für die insieme-Segmentierung genutzt.</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Firmenname *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              placeholder="Beispiel AG"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Offizieller Name (optional)
            </label>
            <input
              type="text"
              value={formData.legal_name}
              onChange={(e) => setFormData({ ...formData, legal_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              placeholder="Beispiel Aktiengesellschaft"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                UID 🇨🇭
              </label>
              <input
                type="text"
                value={formData.uid}
                onChange={(e) => setFormData({ ...formData, uid: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                placeholder="CHE-123.456.789"
                pattern="CHE-\d{3}\.\d{3}\.\d{3}"
                title="Format: CHE-XXX.XXX.XXX"
              />
              <p className="text-xs text-gray-500 mt-1">CHE-XXX.XXX.XXX</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                MWST-Nummer
              </label>
              <input
                type="text"
                value={formData.vat_number}
                onChange={(e) => setFormData({ ...formData, vat_number: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-Mail
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                placeholder="info@example.ch"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefon
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                placeholder="+41 44 123 45 67"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Website
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              placeholder="https://www.example.ch"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PLZ 🇨🇭
              </label>
              <input
                type="text"
                value={formData.postal_code}
                onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                placeholder="8000"
                pattern="\d{4}"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ort
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                placeholder="Zürich"
              />
            </div>
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
              {saving ? 'Speichere...' : company ? 'Aktualisieren' : 'Erstellen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
