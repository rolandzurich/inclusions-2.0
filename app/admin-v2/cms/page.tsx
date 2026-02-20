'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface CmsPage {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  status: string;
  sort_order: number;
  is_homepage: boolean;
  section_count: number;
  created_at: string;
  updated_at: string;
}

export default function CMSOverviewPage() {
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [schemaReady, setSchemaReady] = useState<boolean | null>(null);
  const [initMessage, setInitMessage] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPage, setNewPage] = useState({ title: '', slug: '', description: '', status: 'draft' });
  const [search, setSearch] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Schema prüfen
  useEffect(() => {
    checkSchema();
  }, []);

  async function checkSchema() {
    try {
      const res = await fetch('/api/admin-v2/cms/init');
      const data = await res.json();
      setSchemaReady(data.ready);
      if (data.ready) {
        loadPages();
      }
    } catch {
      setSchemaReady(false);
    }
    setLoading(false);
  }

  async function initSchema() {
    setInitMessage('Schema wird erstellt...');
    try {
      const res = await fetch('/api/admin-v2/cms/init', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setInitMessage('✅ Schema erfolgreich erstellt!');
        setSchemaReady(true);
        loadPages();
      } else {
        setInitMessage(`❌ Fehler: ${JSON.stringify(data.results?.filter((r: any) => !r.success))}`);
      }
    } catch (err: any) {
      setInitMessage(`❌ Fehler: ${err.message}`);
    }
  }

  async function loadPages() {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      const res = await fetch(`/api/admin-v2/cms/pages?${params}`);
      const data = await res.json();
      setPages(data.pages || []);
    } catch (err) {
      console.error('Fehler beim Laden:', err);
    }
  }

  async function createPage() {
    if (!newPage.title || !newPage.slug) return;

    try {
      const res = await fetch('/api/admin-v2/cms/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPage),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(`Seite "${newPage.title}" erstellt!`);
        setShowCreateModal(false);
        setNewPage({ title: '', slug: '', description: '', status: 'draft' });
        loadPages();
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        alert(data.error || 'Fehler beim Erstellen');
      }
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function deletePage(id: string, title: string) {
    if (!confirm(`Seite "${title}" wirklich löschen? Alle Sections werden gelöscht.`)) return;
    try {
      const res = await fetch(`/api/admin-v2/cms/pages/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSuccessMsg(`Seite "${title}" gelöscht.`);
        loadPages();
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function toggleStatus(page: CmsPage) {
    const newStatus = page.status === 'published' ? 'draft' : 'published';
    try {
      await fetch(`/api/admin-v2/cms/pages/${page.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      loadPages();
    } catch (err) {
      console.error(err);
    }
  }

  function autoSlug(title: string) {
    return title
      .toLowerCase()
      .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Schema nicht bereit
  if (schemaReady === false) {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">📄 CMS Setup</h1>
        <div className="bg-white rounded-xl shadow p-8 text-center space-y-4">
          <p className="text-gray-600">
            Die CMS-Tabellen müssen in der Datenbank erstellt werden.
          </p>
          <button
            onClick={initSchema}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Schema jetzt erstellen
          </button>
          {initMessage && (
            <p className="text-sm mt-2">{initMessage}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📄 CMS</h1>
          <p className="text-gray-500 mt-1">Seiten und Inhalte verwalten</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
        >
          <span>+</span> Neue Seite
        </button>
      </div>

      {/* Erfolgsmeldung */}
      {successMsg && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          ✅ {successMsg}
        </div>
      )}

      {/* Suche */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Seite suchen..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setTimeout(loadPages, 300);
          }}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Seiten-Liste */}
      {pages.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <p className="text-gray-500 text-lg">Noch keine Seiten erstellt.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Erste Seite erstellen
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Seite</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Slug</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Sections</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pages.map((page) => (
                <tr key={page.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {page.is_homepage && <span title="Homepage">🏠</span>}
                      <Link
                        href={`/admin-v2/cms/${page.id}`}
                        className="font-medium text-gray-900 hover:text-blue-600"
                      >
                        {page.title}
                      </Link>
                    </div>
                    {page.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-1">{page.description}</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">/{page.slug}</code>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      {page.section_count}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => toggleStatus(page)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer ${
                        page.status === 'published'
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                      }`}
                    >
                      {page.status === 'published' ? '✅ Live' : '📝 Entwurf'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin-v2/cms/${page.id}`}
                        className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
                      >
                        Bearbeiten
                      </Link>
                      <a
                        href={`/cms/${page.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 text-sm bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100"
                      >
                        Vorschau
                      </a>
                      <button
                        onClick={() => deletePage(page.id, page.title)}
                        className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded-md hover:bg-red-100"
                      >
                        Löschen
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-lg w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Neue Seite erstellen</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titel *</label>
                <input
                  type="text"
                  value={newPage.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    setNewPage({ ...newPage, title, slug: autoSlug(title) });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500"
                  placeholder="z.B. Über uns"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL-Slug *</label>
                <div className="flex items-center">
                  <span className="text-gray-500 mr-1">/</span>
                  <input
                    type="text"
                    value={newPage.slug}
                    onChange={(e) => setNewPage({ ...newPage, slug: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500"
                    placeholder="z.B. ueber-uns"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung (SEO)</label>
                <textarea
                  value={newPage.description}
                  onChange={(e) => setNewPage({ ...newPage, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Meta-Description für Suchmaschinen"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={newPage.status}
                  onChange={(e) => setNewPage({ ...newPage, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="draft">📝 Entwurf</option>
                  <option value="published">✅ Veröffentlicht</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={createPage}
                disabled={!newPage.title || !newPage.slug}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Seite erstellen
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
