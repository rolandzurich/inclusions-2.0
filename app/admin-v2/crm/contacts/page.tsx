'use client';

import { useState, useEffect, useCallback } from 'react';

// ─── Typen ────────────────────────────────────────────────────────────────────

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  company_id?: string;
  company_name?: string;
  address_line1?: string;
  postal_code?: string;
  city?: string;
  notes?: string;
  tags?: string[];
  categories?: string[];
  vip_type?: 'selbstständig' | 'betreut';
  betreuer_id?: string;
  betreuer_name?: string;
  party_count?: number;
  party_history?: string[];
  last_party_date?: string;
  source_list?: string;
  created_at: string;
}

interface CompanyOption { id: string; name: string; is_insieme?: boolean; }
interface ContactOption { id: string; first_name: string; last_name: string; email?: string; }

// ─── Konstanten ───────────────────────────────────────────────────────────────

const CURRENT_YEAR = new Date().getFullYear();
const DANCE_CREW_YEARS = [CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1];
const DANCE_CREW_YEAR_TAGS = DANCE_CREW_YEARS.flatMap((year) => ([
  { value: `dance-crew-${year}`, label: `Dance Crew ${year}` },
  { value: `dance-crew-leitung-${year}`, label: `Dance Crew Leitung ${year}` },
]));

const TAG_GROUPS: { group: string; emoji: string; tags: { value: string; label: string }[] }[] = [
  {
    group: 'Team',
    emoji: '👥',
    tags: [
      { value: 'core-team',          label: 'Core Team' },
      { value: 'care-team',          label: 'Care Team' },
      { value: 'dance-crew',         label: 'Dance Crew' },
      { value: 'dance-crew-leitung', label: 'Dance Crew Leitung' },
      ...DANCE_CREW_YEAR_TAGS,
    ],
  },
  {
    group: 'DJ',
    emoji: '🎧',
    tags: [
      { value: 'dj-resident',    label: 'Resident DJ' },
      { value: 'inclusions-dj',  label: 'Inclusions-DJ' },
    ],
  },
  {
    group: 'Partner / Netzwerk',
    emoji: '🤝',
    tags: [
      { value: 'sponsor',      label: 'Sponsor' },
      { value: 'partner',      label: 'Partner' },
      { value: 'institution',  label: 'Institution' },
      { value: 'medien',       label: 'Medien' },
      { value: 'botschafter',  label: 'Botschafter' },
    ],
  },
  {
    group: 'VIP',
    emoji: '⭐',
    tags: [
      { value: 'vip-i2',         label: 'I2 · 25. Apr' },
      { value: 'vip-i3',         label: 'I3 · 3. Okt' },
      { value: 'vip-zielgruppe', label: 'Zielgruppe' },
      { value: 'vip-angemeldet', label: 'Angemeldet' },
    ],
  },
  {
    group: 'Allgemein',
    emoji: '📋',
    tags: [
      { value: 'newsletter',   label: 'Newsletter' },
      { value: 'interessent',  label: 'Interessent' },
    ],
  },
];

const ALL_TAGS = TAG_GROUPS.flatMap(g => g.tags);

const TAG_COLORS: Record<string, string> = {
  'core-team': 'bg-indigo-100 text-indigo-800',
  'care-team': 'bg-teal-100 text-teal-800',
  'dance-crew': 'bg-indigo-50 text-indigo-700',
  'dance-crew-leitung': 'bg-indigo-100 text-indigo-800',
  'dj-resident': 'bg-purple-100 text-purple-800',
  'inclusions-dj': 'bg-purple-100 text-purple-800',
  'sponsor': 'bg-amber-100 text-amber-800',
  'partner': 'bg-blue-100 text-blue-800',
  'institution': 'bg-sky-100 text-sky-800',
  'medien': 'bg-pink-100 text-pink-800',
  'botschafter': 'bg-emerald-100 text-emerald-800',
  'vip-i2': 'bg-yellow-100 text-yellow-800',
  'vip-i3': 'bg-yellow-100 text-yellow-800',
  'vip-zielgruppe': 'bg-yellow-50 text-yellow-700',
  'vip-angemeldet': 'bg-yellow-100 text-yellow-800',
  'newsletter': 'bg-gray-100 text-gray-700',
  'interessent': 'bg-gray-100 text-gray-600',
};

function getTagLabel(value: string) {
  if (/^dance-crew-leitung-\d{4}$/.test(value)) return `Dance Crew Leitung ${value.replace('dance-crew-leitung-', '')}`;
  if (/^dance-crew-\d{4}$/.test(value)) return `Dance Crew ${value.replace('dance-crew-', '')}`;
  if (value === 'dance-crew') return 'Dance Crew (Legacy)';
  if (value === 'dance-crew-leitung') return 'Dance Crew Leitung (Legacy)';
  if (value.startsWith('insieme-')) return `insieme ${value.replace('insieme-', '')}`;
  return ALL_TAGS.find(t => t.value === value)?.label || value;
}

function getTagColor(value: string) {
  if (value.startsWith('dance-crew-leitung-')) return 'bg-indigo-100 text-indigo-800';
  if (value.startsWith('dance-crew-')) return 'bg-indigo-50 text-indigo-700';
  if (value.startsWith('insieme-')) return 'bg-blue-50 text-blue-700';
  return TAG_COLORS[value] || 'bg-gray-100 text-gray-600';
}

function hasVipTag(tags: string[]) {
  return tags.some(t => t.startsWith('vip-'));
}

// ─── Haupt-Seite ──────────────────────────────────────────────────────────────

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState<'db' | 'local-fallback'>('db');
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [allContacts, setAllContacts] = useState<ContactOption[]>([]);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (search) p.append('search', search);
      if (tagFilter) p.append('tag', tagFilter);
      const res = await fetch(`/api/admin-v2/contacts?${p}&_ts=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setContacts(data.contacts || []);
        setDataSource(data.source === 'local-fallback' ? 'local-fallback' : 'db');
      }
    } finally {
      setLoading(false);
    }
  }, [search, tagFilter]);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  useEffect(() => {
    fetch('/api/admin-v2/companies?_ts=' + Date.now(), { cache: 'no-store' })
      .then(r => r.json())
      .then(d => { if (d.success) setCompanies(d.companies || []); });
    fetch('/api/admin-v2/contacts?_ts=' + Date.now(), { cache: 'no-store' })
      .then(r => r.json())
      .then(d => { if (d.success) setAllContacts(d.contacts || []); });
  }, []);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Möchten Sie "${name}" wirklich löschen?`)) return;
    await fetch(`/api/admin-v2/contacts/${id}`, { method: 'DELETE' });
    setContacts(prev => prev.filter(c => c.id !== id));
    showSuccess('Kontakt gelöscht');
  }

  function showSuccess(msg: string) {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 3500);
  }

  function openNew() { setEditingContact(null); setShowModal(true); }
  function openEdit(c: Contact) { setEditingContact(c); setShowModal(true); }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Alle Kontakte</h1>
          <p className="text-gray-500 mt-1">{contacts.length} Kontakte</p>
        </div>
        <button onClick={openNew}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium">
          + Neuer Kontakt
        </button>
      </div>

      {successMessage && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          ✅ {successMessage}
        </div>
      )}

      {dataSource === 'local-fallback' && (
        <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-sm">
          ⚠️ Lokaler Fallback aktiv. Du siehst aktuell lokale CRM-Dateien, nicht die produktive Datenbank.
        </div>
      )}

      {/* Filter */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-wrap gap-3">
        <input
          type="text" placeholder="Suche nach Name, E-Mail..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-48 px-3 py-2 border border-gray-200 rounded-lg text-sm"
        />
        <select value={tagFilter} onChange={e => setTagFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white min-w-44">
          <option value="">Alle Tags</option>
          {TAG_GROUPS.map(g => (
            <optgroup key={g.group} label={`${g.emoji} ${g.group}`}>
              {g.tags.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </optgroup>
          ))}
        </select>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Lade Kontakte...</div>
      ) : contacts.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg mb-2">Keine Kontakte gefunden</p>
          <button onClick={openNew} className="text-blue-600 hover:underline">Ersten Kontakt erstellen</button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Tags</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Kontakt</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Unternehmen</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {contacts.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{c.first_name} {c.last_name}</div>
                      {c.source_list && <div className="text-xs text-gray-400">{c.source_list}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(c.tags || []).slice(0, 5).map(t => (
                          <span key={t} className={`px-1.5 py-0.5 rounded text-xs font-medium ${getTagColor(t)}`}>
                            {getTagLabel(t)}
                          </span>
                        ))}
                        {(c.tags || []).length > 5 && (
                          <span className="text-xs text-gray-400">+{(c.tags || []).length - 5}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {c.email && <div className="text-xs">{c.email}</div>}
                      {c.phone && <div className="text-xs text-gray-400">{c.phone}</div>}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{c.company_name || '–'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => openEdit(c)}
                          className="text-xs text-blue-600 hover:underline">Bearbeiten</button>
                        <button onClick={() => handleDelete(c.id, `${c.first_name} ${c.last_name}`)}
                          className="text-xs text-red-500 hover:underline">Löschen</button>
                      </div>
                    </td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <ContactModal
          contact={editingContact}
          companies={companies}
          allContacts={allContacts}
          onClose={() => setShowModal(false)}
          onSuccess={(saved, isNew) => {
            if (isNew) {
              setContacts(prev => [saved, ...prev]);
            } else {
              setContacts(prev => prev.map(c => c.id === saved.id ? saved : c));
            }
            setShowModal(false);
            showSuccess(isNew ? 'Kontakt erstellt' : 'Kontakt aktualisiert');
          }}
        />
      )}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function ContactModal({
  contact,
  companies,
  allContacts,
  onClose,
  onSuccess,
}: {
  contact: Contact | null;
  companies: CompanyOption[];
  allContacts: ContactOption[];
  onClose: () => void;
  onSuccess: (saved: Contact, isNew: boolean) => void;
}) {
  const isNew = !contact;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // insieme-[ort] aus bestehenden Tags extrahieren
  const existingInsieme = (contact?.tags || []).find(t => t.startsWith('insieme-'));
  const [insiemeOrt, setInsiemeOrt] = useState(
    existingInsieme ? existingInsieme.replace('insieme-', '') : ''
  );

  const [form, setForm] = useState({
    first_name: contact?.first_name || '',
    last_name: contact?.last_name || '',
    email: contact?.email || '',
    phone: contact?.phone || '',
    company_id: contact?.company_id || '',
    address_line1: contact?.address_line1 || '',
    postal_code: contact?.postal_code || '',
    city: contact?.city || '',
    notes: contact?.notes || '',
    vip_type: contact?.vip_type || '',
    betreuer_id: contact?.betreuer_id || '',
    party_count: contact?.party_count || 0,
    source_list: contact?.source_list || '',
    tags: (contact?.tags || []).filter(t => !t.startsWith('insieme-')) as string[],
  });

  function toggleTag(tag: string) {
    setForm(f => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.first_name || !form.last_name) {
      setError('Vorname und Nachname sind pflichtfelder');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const url = isNew ? '/api/admin-v2/contacts' : `/api/admin-v2/contacts/${contact!.id}`;
      const method = isNew ? 'POST' : 'PUT';
      // insieme-[ort] Tag zusammenbauen
      const finalTags = [...form.tags];
      if (insiemeOrt.trim()) {
        finalTags.push(`insieme-${insiemeOrt.trim().toLowerCase().replace(/\s+/g, '-')}`);
      }

      const isVip = hasVipTag(finalTags);
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          company_id: form.company_id || null,
          betreuer_id: form.vip_type === 'betreut' ? (form.betreuer_id || null) : null,
          vip_type: isVip ? (form.vip_type || null) : null,
          party_count: Number(form.party_count) || 0,
          tags: finalTags,
        }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error || 'Fehler beim Speichern'); return; }
      onSuccess(data.contact, isNew);
    } catch {
      setError('Netzwerkfehler');
    } finally {
      setSaving(false);
    }
  }

  const betreuerOptions = allContacts.filter(c => c.id !== contact?.id);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl font-bold">{isNew ? 'Neuer Kontakt' : 'Kontakt bearbeiten'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm">{error}</div>}

          {/* Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vorname *</label>
              <input value={form.first_name} onChange={e => setForm(f => ({...f, first_name: e.target.value}))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nachname *</label>
              <input value={form.last_name} onChange={e => setForm(f => ({...f, last_name: e.target.value}))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" required />
            </div>
          </div>

          {/* Kontakt */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))}
                placeholder="name@example.ch"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefon 🇨🇭</label>
              <input value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))}
                placeholder="+41 79 123 45 67"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags (Mehrfachauswahl)</label>
            <div className="space-y-3">
              {TAG_GROUPS.map(group => (
                <div key={group.group}>
                  <div className="text-xs font-medium text-gray-500 mb-1">{group.emoji} {group.group}</div>
                  <div className="flex flex-wrap gap-2">
                    {group.tags.map(tag => (
                      <button type="button" key={tag.value}
                        onClick={() => toggleTag(tag.value)}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-all ${
                          form.tags.includes(tag.value)
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                        }`}>
                        {tag.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* insieme-[ort] */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-blue-800">🏛️ insieme</span>
              <span className="text-xs text-blue-500">(Tag: insieme-[ort])</span>
            </div>
            <div className="flex gap-2 items-center">
              <span className="text-sm text-blue-700 font-mono">insieme-</span>
              <input
                type="text"
                value={insiemeOrt}
                onChange={e => setInsiemeOrt(e.target.value)}
                placeholder="zürich, limmatthal, bern..."
                className="flex-1 border border-blue-200 rounded-lg px-3 py-1.5 text-sm bg-white"
              />
            </div>
            {insiemeOrt.trim() && (
              <div className="mt-2 text-xs text-blue-600">
                Tag: <span className="font-mono bg-blue-100 px-1.5 py-0.5 rounded">
                  insieme-{insiemeOrt.trim().toLowerCase().replace(/\s+/g, '-')}
                </span>
              </div>
            )}
            <p className="text-xs text-blue-400 mt-1">Leer lassen wenn kein insieme-Kontakt</p>
          </div>

          {/* Unternehmen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unternehmen / Institution</label>
            <select value={form.company_id} onChange={e => setForm(f => ({...f, company_id: e.target.value}))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
              <option value="">Kein Unternehmen</option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.is_insieme ? '🏛️ ' : ''}{c.name}</option>
              ))}
            </select>
          </div>

          {/* VIP-spezifische Felder */}
          {hasVipTag(form.tags) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 space-y-4">
              <div className="text-sm font-semibold text-yellow-800">⭐ VIP-Felder</div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">VIP-Typ</label>
                <div className="flex gap-3">
                  {[
                    { value: 'selbstständig', label: '✅ Selbständig', desc: 'Eigene E-Mail, entscheidet selbst' },
                    { value: 'betreut', label: '🛡️ Betreut', desc: 'Kommunikation über Betreuer/Institution' },
                  ].map(opt => (
                    <button type="button" key={opt.value}
                      onClick={() => setForm(f => ({...f, vip_type: opt.value as 'selbstständig' | 'betreut'}))}
                      className={`flex-1 p-3 rounded-lg border text-left text-sm transition-all ${
                        form.vip_type === opt.value
                          ? 'border-yellow-500 bg-yellow-100'
                          : 'border-gray-200 bg-white hover:border-yellow-300'
                      }`}>
                      <div className="font-medium">{opt.label}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {form.vip_type === 'betreut' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Betreuer / Kontaktperson</label>
                  <select value={form.betreuer_id} onChange={e => setForm(f => ({...f, betreuer_id: e.target.value}))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
                    <option value="">Betreuer auswählen...</option>
                    {betreuerOptions.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.first_name} {c.last_name}{c.email ? ` (${c.email})` : ''}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Die Kommunikation läuft über diese Person.</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Anzahl besuchte Partys</label>
                <input type="number" min="0" value={form.party_count}
                  onChange={e => setForm(f => ({...f, party_count: Number(e.target.value)}))}
                  className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
          )}

          {/* Adresse */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Strasse & Nr.</label>
              <input value={form.address_line1} onChange={e => setForm(f => ({...f, address_line1: e.target.value}))}
                placeholder="Musterstrasse 1"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PLZ 🇨🇭</label>
              <input value={form.postal_code} onChange={e => setForm(f => ({...f, postal_code: e.target.value}))}
                placeholder="8000" maxLength={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Ort</label>
              <input value={form.city} onChange={e => setForm(f => ({...f, city: e.target.value}))}
                placeholder="Zürich"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>

          {/* Notizen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notizen</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))}
              rows={3} placeholder="Zusätzliche Informationen..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={saving}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium">
              Abbrechen
            </button>
            <button type="submit" disabled={saving}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-60">
              {saving ? 'Speichere...' : isNew ? 'Erstellen' : 'Speichern'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
