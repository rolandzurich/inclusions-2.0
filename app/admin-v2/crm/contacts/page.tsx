'use client';

import { useState, useEffect } from 'react';

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  company_name?: string;
  company_id?: string;
  address_line1?: string;
  address_line2?: string;
  postal_code?: string;
  city?: string;
  country?: string;
  notes?: string;
  tags?: string[];
  categories?: string[];
  has_disability?: boolean;
  source?: string;
  created_at: string;
}

const categoryConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  vip: { label: 'VIP', color: 'text-purple-800', bgColor: 'bg-purple-100' },
  newsletter: { label: 'Newsletter', color: 'text-blue-800', bgColor: 'bg-blue-100' },
  booking: { label: 'Booking', color: 'text-orange-800', bgColor: 'bg-orange-100' },
  macher: { label: 'Macher', color: 'text-green-800', bgColor: 'bg-green-100' },
  sponsor: { label: 'Sponsor', color: 'text-yellow-800', bgColor: 'bg-yellow-100' },
  institution: { label: 'Institution', color: 'text-teal-800', bgColor: 'bg-teal-100' },
  betreuer: { label: 'Betreuer', color: 'text-pink-800', bgColor: 'bg-pink-100' },
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchContacts();
  }, [search, roleFilter, categoryFilter]);

  async function fetchContacts() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (roleFilter) params.append('role', roleFilter);
      if (categoryFilter) params.append('category', categoryFilter);

      const res = await fetch(`/api/admin-v2/contacts?${params}`);
      const data = await res.json();

      if (data.success) {
        setContacts(data.contacts);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Kontakte:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Möchten Sie ${name} wirklich löschen?`)) return;

    try {
      const res = await fetch(`/api/admin-v2/contacts/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (data.success) {
        showSuccess('Kontakt erfolgreich gelöscht');
        fetchContacts();
      }
    } catch (error) {
      alert('Fehler beim Löschen');
    }
  }

  function showSuccess(message: string) {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  }

  function openModal(contact?: Contact) {
    setEditingContact(contact || null);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingContact(null);
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
          <h1 className="text-3xl font-bold text-gray-900">Kontakte</h1>
          <p className="mt-2 text-gray-600">
            {contacts.length} {contacts.length === 1 ? 'Kontakt' : 'Kontakte'}
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Neuer Kontakt
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-3">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Suche nach Name, E-Mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
          >
            <option value="">Alle Rollen</option>
            <option value="dj">DJ</option>
            <option value="partner">Partner</option>
            <option value="sponsor">Sponsor</option>
            <option value="crew">Crew</option>
            <option value="other">Andere</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
          >
            <option value="">Alle Kategorien</option>
            <option value="vip">♿ VIP-Gäste</option>
            <option value="newsletter">📧 Newsletter</option>
            <option value="booking">🎵 Booking</option>
            <option value="macher">💪 Macher</option>
            <option value="sponsor">🏆 Sponsor</option>
            <option value="institution">🏛️ Institution</option>
            <option value="betreuer">👥 Betreuer</option>
          </select>
        </div>
        {categoryFilter && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Filter:</span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${categoryConfig[categoryFilter]?.bgColor || 'bg-gray-100'} ${categoryConfig[categoryFilter]?.color || 'text-gray-800'}`}>
              {categoryConfig[categoryFilter]?.label || categoryFilter}
            </span>
            <button onClick={() => setCategoryFilter('')} className="text-gray-400 hover:text-gray-600 text-sm">✕</button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Lade Kontakte...</p>
          </div>
        ) : contacts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👤</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {search || roleFilter ? 'Keine Kontakte gefunden' : 'Noch keine Kontakte'}
            </h3>
            <p className="text-gray-600 mb-6">
              {search || roleFilter
                ? 'Versuche eine andere Suche'
                : 'Füge deinen ersten Kontakt hinzu'}
            </p>
            {!search && !roleFilter && (
              <button
                onClick={() => openModal()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                + Ersten Kontakt hinzufügen
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
                  E-Mail
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Telefon
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Kategorien
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Rolle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Unternehmen
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {contact.first_name} {contact.last_name}
                    </div>
                    {contact.city && (
                      <div className="text-xs text-gray-500">
                        {contact.postal_code} {contact.city}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{contact.email || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{contact.phone || '-'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(contact.categories || []).map((cat) => {
                        const config = categoryConfig[cat];
                        return (
                          <span
                            key={cat}
                            className={`px-2 py-0.5 text-xs font-medium rounded-full ${config?.bgColor || 'bg-gray-100'} ${config?.color || 'text-gray-700'}`}
                          >
                            {config?.label || cat}
                          </span>
                        );
                      })}
                      {(!contact.categories || contact.categories.length === 0) && (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {contact.role && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {contact.role}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">
                      {contact.company_name || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <button
                      onClick={() => openModal(contact)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Bearbeiten
                    </button>
                    <button
                      onClick={() =>
                        handleDelete(
                          contact.id,
                          `${contact.first_name} ${contact.last_name}`
                        )
                      }
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

      {/* Modal */}
      {showModal && (
        <ContactModal
          contact={editingContact}
          onClose={closeModal}
          onSuccess={(message) => {
            showSuccess(message);
            fetchContacts();
            closeModal();
          }}
        />
      )}
    </div>
  );
}

// Separate Modal Component (wird unten definiert)
function ContactModal({
  contact,
  onClose,
  onSuccess,
}: {
  contact: Contact | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
}) {
  const [formData, setFormData] = useState({
    first_name: contact?.first_name || '',
    last_name: contact?.last_name || '',
    email: contact?.email || '',
    phone: contact?.phone || '',
    role: contact?.role || '',
    address_line1: contact?.address_line1 || '',
    postal_code: contact?.postal_code || '',
    city: contact?.city || '',
    notes: contact?.notes || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const url = contact
        ? `/api/admin-v2/contacts/${contact.id}`
        : '/api/admin-v2/contacts';
      const method = contact ? 'PUT' : 'POST';

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
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {contact ? 'Kontakt bearbeiten' : 'Neuer Kontakt'}
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vorname *
              </label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={(e) =>
                  setFormData({ ...formData, first_name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nachname *
              </label>
              <input
                type="text"
                required
                value={formData.last_name}
                onChange={(e) =>
                  setFormData({ ...formData, last_name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              />
            </div>
          </div>

          {/* E-Mail & Telefon */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-Mail
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                placeholder="kontakt@example.ch"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefon 🇨🇭
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                placeholder="+41 79 123 45 67"
              />
              <p className="text-xs text-gray-500 mt-1">
                Format: +41 79 123 45 67
              </p>
            </div>
          </div>

          {/* Rolle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rolle
            </label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            >
              <option value="">Keine Rolle</option>
              <option value="dj">DJ</option>
              <option value="partner">Partner</option>
              <option value="sponsor">Sponsor</option>
              <option value="crew">Crew</option>
              <option value="other">Andere</option>
            </select>
          </div>

          {/* Adresse */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Strasse & Hausnummer
            </label>
            <input
              type="text"
              value={formData.address_line1}
              onChange={(e) =>
                setFormData({ ...formData, address_line1: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              placeholder="Musterstrasse 123"
            />
          </div>

          {/* PLZ & Ort */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PLZ 🇨🇭
              </label>
              <input
                type="text"
                value={formData.postal_code}
                onChange={(e) =>
                  setFormData({ ...formData, postal_code: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                placeholder="8000"
                pattern="\d{4}"
                title="4 Ziffern (z.B. 8000)"
              />
              <p className="text-xs text-gray-500 mt-1">4 Ziffern</p>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ort
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                placeholder="Zürich"
              />
            </div>
          </div>

          {/* Notizen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notizen
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              rows={3}
              placeholder="Zusätzliche Informationen..."
            />
          </div>

          {/* Buttons */}
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
              {saving ? 'Speichere...' : contact ? 'Aktualisieren' : 'Erstellen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
