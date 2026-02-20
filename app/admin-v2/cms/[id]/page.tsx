'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { SECTION_TYPES, SECTION_DEFAULTS } from '@/components/cms/SectionRenderer';

interface CmsPage {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  og_image: string | null;
  status: string;
  sort_order: number;
  is_homepage: boolean;
  metadata: any;
  sections: CmsSection[];
}

interface CmsSection {
  id: string;
  section_type: string;
  title: string | null;
  content: any;
  sort_order: number;
  is_visible: boolean;
  css_classes: string | null;
}

export default function CMSPageEditor() {
  const { id } = useParams();
  const [page, setPage] = useState<CmsPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Page settings editor
  const [editingSettings, setEditingSettings] = useState(false);
  const [pageSettings, setPageSettings] = useState({ title: '', slug: '', description: '', status: 'draft', is_homepage: false });

  // Section editor
  const [editingSection, setEditingSection] = useState<CmsSection | null>(null);
  const [showAddSection, setShowAddSection] = useState(false);
  const [addAfterIndex, setAddAfterIndex] = useState<number>(-1);

  const loadPage = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin-v2/cms/pages/${id}`);
      const data = await res.json();
      if (res.ok) {
        setPage(data.page);
        setPageSettings({
          title: data.page.title,
          slug: data.page.slug,
          description: data.page.description || '',
          status: data.page.status,
          is_homepage: data.page.is_homepage,
        });
      } else {
        setErrorMsg(data.error || 'Seite nicht gefunden');
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  function showSuccess(msg: string) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  }

  // === Page Settings ===
  async function savePageSettings() {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin-v2/cms/pages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pageSettings),
      });
      const data = await res.json();
      if (res.ok) {
        setPage(prev => prev ? { ...prev, ...data.page } : null);
        setEditingSettings(false);
        showSuccess('Seiteneinstellungen gespeichert');
      } else {
        setErrorMsg(data.error);
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    }
    setSaving(false);
  }

  // === Sections ===
  async function addSection(sectionType: string) {
    try {
      const defaultContent = SECTION_DEFAULTS[sectionType] || {};
      const typeInfo = SECTION_TYPES.find(t => t.value === sectionType);

      // Sort order: nach dem gewählten Index einfügen
      let sortOrder = 0;
      if (page && page.sections.length > 0) {
        if (addAfterIndex >= 0 && addAfterIndex < page.sections.length) {
          sortOrder = page.sections[addAfterIndex].sort_order + 1;
        } else {
          sortOrder = Math.max(...page.sections.map(s => s.sort_order)) + 1;
        }
      }

      const res = await fetch('/api/admin-v2/cms/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page_id: id,
          section_type: sectionType,
          title: typeInfo?.label || '',
          content: defaultContent,
          sort_order: sortOrder,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showSuccess(`${typeInfo?.label || sectionType} hinzugefügt`);
        setShowAddSection(false);
        loadPage();
      } else {
        setErrorMsg(data.error);
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  }

  async function saveSection(section: CmsSection) {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin-v2/cms/sections/${section.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: section.title,
          content: section.content,
          is_visible: section.is_visible,
          css_classes: section.css_classes,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showSuccess('Section gespeichert');
        setEditingSection(null);
        loadPage();
      } else {
        setErrorMsg(data.error);
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    }
    setSaving(false);
  }

  async function deleteSection(sectionId: string) {
    if (!confirm('Section wirklich löschen?')) return;
    try {
      const res = await fetch(`/api/admin-v2/cms/sections/${sectionId}`, { method: 'DELETE' });
      if (res.ok) {
        showSuccess('Section gelöscht');
        setEditingSection(null);
        loadPage();
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  }

  async function toggleSectionVisibility(section: CmsSection) {
    try {
      await fetch(`/api/admin-v2/cms/sections/${section.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_visible: !section.is_visible }),
      });
      loadPage();
    } catch (err) {
      console.error(err);
    }
  }

  async function moveSection(sectionId: string, direction: 'up' | 'down') {
    if (!page) return;
    const sections = [...page.sections].sort((a, b) => a.sort_order - b.sort_order);
    const idx = sections.findIndex(s => s.id === sectionId);
    if (idx < 0) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === sections.length - 1) return;

    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    const newIds = sections.map(s => s.id);
    [newIds[idx], newIds[swapIdx]] = [newIds[swapIdx], newIds[idx]];

    try {
      await fetch('/api/admin-v2/cms/sections/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section_ids: newIds }),
      });
      loadPage();
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{errorMsg || 'Seite nicht gefunden'}</p>
        <Link href="/admin-v2/cms" className="mt-4 text-blue-600 hover:underline">← Zurück zum CMS</Link>
      </div>
    );
  }

  const sortedSections = [...page.sections].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <div className="mb-4">
        <Link href="/admin-v2/cms" className="text-sm text-blue-600 hover:underline">← Zurück zum CMS</Link>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          ✅ {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          ❌ {errorMsg}
          <button onClick={() => setErrorMsg('')} className="ml-2 underline">Schliessen</button>
        </div>
      )}

      {/* Page Header */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{page.title}</h1>
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                page.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {page.status === 'published' ? '✅ Live' : '📝 Entwurf'}
              </span>
              {page.is_homepage && <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">🏠 Homepage</span>}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Slug: <code className="bg-gray-100 px-1 rounded">/{page.slug}</code>
              {' · '}{sortedSections.length} Sections
            </p>
          </div>
          <div className="flex gap-2">
            <a
              href={`/cms/${page.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              👁 Vorschau
            </a>
            <button
              onClick={() => setEditingSettings(true)}
              className="px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
            >
              ⚙️ Einstellungen
            </button>
          </div>
        </div>
      </div>

      {/* Sections List */}
      <div className="space-y-3">
        {sortedSections.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <p className="text-gray-500 text-lg mb-4">Noch keine Sections auf dieser Seite.</p>
            <button
              onClick={() => { setShowAddSection(true); setAddAfterIndex(-1); }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              + Erste Section hinzufügen
            </button>
          </div>
        ) : (
          <>
            {sortedSections.map((section, index) => {
              const typeInfo = SECTION_TYPES.find(t => t.value === section.section_type);

              return (
                <div key={section.id}>
                  <div className={`bg-white rounded-xl shadow p-4 ${!section.is_visible ? 'opacity-50' : ''}`}>
                    <div className="flex items-center gap-3">
                      {/* Drag handle / Order */}
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => moveSection(section.id, 'up')}
                          disabled={index === 0}
                          className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-700 disabled:opacity-30"
                          title="Nach oben"
                        >
                          ▲
                        </button>
                        <button
                          onClick={() => moveSection(section.id, 'down')}
                          disabled={index === sortedSections.length - 1}
                          className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-700 disabled:opacity-30"
                          title="Nach unten"
                        >
                          ▼
                        </button>
                      </div>

                      {/* Type Icon & Title */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{typeInfo?.icon || '📦'}</span>
                          <span className="font-medium text-gray-900">
                            {section.title || typeInfo?.label || section.section_type}
                          </span>
                          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded">
                            {typeInfo?.label || section.section_type}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {getContentPreview(section)}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleSectionVisibility(section)}
                          className={`px-2 py-1 text-xs rounded ${
                            section.is_visible
                              ? 'bg-green-50 text-green-600 hover:bg-green-100'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                          title={section.is_visible ? 'Ausblenden' : 'Einblenden'}
                        >
                          {section.is_visible ? '👁' : '👁‍🗨'}
                        </button>
                        <button
                          onClick={() => setEditingSection({ ...section })}
                          className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                        >
                          Bearbeiten
                        </button>
                        <button
                          onClick={() => deleteSection(section.id)}
                          className="px-2 py-1 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Add between sections */}
                  <div className="flex justify-center py-1">
                    <button
                      onClick={() => { setShowAddSection(true); setAddAfterIndex(index); }}
                      className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-all text-lg"
                      title="Section hier einfügen"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* Add at end */}
        {sortedSections.length > 0 && (
          <div className="text-center py-2">
            <button
              onClick={() => { setShowAddSection(true); setAddAfterIndex(sortedSections.length - 1); }}
              className="px-4 py-2 bg-white border-2 border-dashed border-gray-300 text-gray-500 rounded-xl hover:border-blue-400 hover:text-blue-600 transition-all"
            >
              + Section am Ende hinzufügen
            </button>
          </div>
        )}
      </div>

      {/* === Add Section Modal === */}
      {showAddSection && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Section hinzufügen</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {SECTION_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => addSection(type.value)}
                  className="text-left p-4 rounded-xl border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{type.icon}</span>
                    <span className="font-medium text-gray-900">{type.label}</span>
                  </div>
                  <p className="text-sm text-gray-500">{type.description}</p>
                </button>
              ))}
            </div>
            <div className="mt-6 text-right">
              <button
                onClick={() => setShowAddSection(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === Section Editor Modal === */}
      {editingSection && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 overflow-y-auto py-8">
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-3xl w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {SECTION_TYPES.find(t => t.value === editingSection.section_type)?.icon}{' '}
                Section bearbeiten
              </h2>
              <button
                onClick={() => setEditingSection(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {/* Section Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Section-Titel</label>
                <input
                  type="text"
                  value={editingSection.title || ''}
                  onChange={(e) => setEditingSection({ ...editingSection, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Dynamic Content Fields based on section_type */}
              <SectionContentEditor
                section={editingSection}
                onChange={(content) => setEditingSection({ ...editingSection, content })}
              />

              {/* CSS Classes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CSS-Klassen (optional)</label>
                <input
                  type="text"
                  value={editingSection.css_classes || ''}
                  onChange={(e) => setEditingSection({ ...editingSection, css_classes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500"
                  placeholder="z.B. bg-white/10 rounded-3xl"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => saveSection(editingSection)}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
              >
                {saving ? 'Speichere...' : 'Speichern'}
              </button>
              <button
                onClick={() => setEditingSection(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === Page Settings Modal === */}
      {editingSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-lg w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">⚙️ Seiteneinstellungen</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titel</label>
                <input
                  type="text"
                  value={pageSettings.title}
                  onChange={(e) => setPageSettings({ ...pageSettings, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input
                  type="text"
                  value={pageSettings.slug}
                  onChange={(e) => setPageSettings({ ...pageSettings, slug: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung (SEO)</label>
                <textarea
                  value={pageSettings.description}
                  onChange={(e) => setPageSettings({ ...pageSettings, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={pageSettings.status}
                  onChange={(e) => setPageSettings({ ...pageSettings, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="draft">📝 Entwurf</option>
                  <option value="published">✅ Veröffentlicht</option>
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={pageSettings.is_homepage}
                  onChange={(e) => setPageSettings({ ...pageSettings, is_homepage: e.target.checked })}
                  className="rounded"
                />
                Als Homepage setzen
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={savePageSettings}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
              >
                {saving ? 'Speichere...' : 'Speichern'}
              </button>
              <button
                onClick={() => setEditingSettings(false)}
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

// === Content Preview Helper ===
function getContentPreview(section: CmsSection): string {
  const c = section.content;
  switch (section.section_type) {
    case 'hero': return c.subtitle ? c.subtitle.substring(0, 60) + '...' : 'Hero Banner';
    case 'text': return c.body ? c.body.substring(0, 60) + '...' : 'Textblock';
    case 'text_image': return c.body ? c.body.substring(0, 60) + '...' : 'Text + Bild';
    case 'cards': return `${c.cards?.length || 0} Karten`;
    case 'faq': return `${c.items?.length || 0} Fragen`;
    case 'gallery': return `${c.images?.length || 0} Bilder`;
    case 'partners': return `${c.partners?.length || 0} Partner`;
    case 'cta': return c.body ? c.body.substring(0, 60) + '...' : 'Call to Action';
    case 'quotes': return `${c.quotes?.length || 0} Zitate`;
    case 'lineup': return `${c.artists?.length || 0} Künstler`;
    case 'custom_html': return 'Custom HTML';
    default: return '';
  }
}

// === Section Content Editor ===
function SectionContentEditor({ section, onChange }: { section: CmsSection; onChange: (content: any) => void }) {
  const content = section.content || {};

  switch (section.section_type) {
    case 'hero':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Untertitel</label>
            <input
              type="text"
              value={content.subtitle || ''}
              onChange={(e) => onChange({ ...content, subtitle: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bild-URL</label>
            <input
              type="text"
              value={content.image || ''}
              onChange={(e) => onChange({ ...content, image: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
              placeholder="/images/hero.jpg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bild Alt-Text</label>
            <input
              type="text"
              value={content.image_alt || ''}
              onChange={(e) => onChange({ ...content, image_alt: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
            />
          </div>
          <ButtonsEditor
            buttons={content.buttons || []}
            onChange={(buttons) => onChange({ ...content, buttons })}
          />
        </div>
      );

    case 'text':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Untertitel</label>
            <input
              type="text"
              value={content.subtitle || ''}
              onChange={(e) => onChange({ ...content, subtitle: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Text (Absätze mit Zeilenumbruch)</label>
            <textarea
              value={content.body || ''}
              onChange={(e) => onChange({ ...content, body: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
              rows={6}
            />
          </div>
        </div>
      );

    case 'text_image':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Text</label>
            <textarea
              value={content.body || ''}
              onChange={(e) => onChange({ ...content, body: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
              rows={4}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bild-URL</label>
              <input
                type="text"
                value={content.image || ''}
                onChange={(e) => onChange({ ...content, image: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bild-Position</label>
              <select
                value={content.image_position || 'right'}
                onChange={(e) => onChange({ ...content, image_position: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
              >
                <option value="right">Rechts</option>
                <option value="left">Links</option>
              </select>
            </div>
          </div>
          <ButtonsEditor
            buttons={content.buttons || []}
            onChange={(buttons) => onChange({ ...content, buttons })}
          />
        </div>
      );

    case 'cards':
      return (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Karten</label>
          {(content.cards || []).map((card: any, i: number) => (
            <div key={i} className="p-3 bg-gray-50 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">Karte {i + 1}</span>
                <button
                  onClick={() => {
                    const cards = [...(content.cards || [])];
                    cards.splice(i, 1);
                    onChange({ ...content, cards });
                  }}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Entfernen
                </button>
              </div>
              <input
                type="text"
                value={card.title || ''}
                onChange={(e) => {
                  const cards = [...(content.cards || [])];
                  cards[i] = { ...cards[i], title: e.target.value };
                  onChange({ ...content, cards });
                }}
                className="w-full px-3 py-1.5 border border-gray-300 rounded text-gray-900 bg-white text-sm"
                placeholder="Titel"
              />
              <textarea
                value={card.text || ''}
                onChange={(e) => {
                  const cards = [...(content.cards || [])];
                  cards[i] = { ...cards[i], text: e.target.value };
                  onChange({ ...content, cards });
                }}
                className="w-full px-3 py-1.5 border border-gray-300 rounded text-gray-900 bg-white text-sm"
                rows={2}
                placeholder="Beschreibung"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={card.icon || ''}
                  onChange={(e) => {
                    const cards = [...(content.cards || [])];
                    cards[i] = { ...cards[i], icon: e.target.value };
                    onChange({ ...content, cards });
                  }}
                  className="px-3 py-1.5 border border-gray-300 rounded text-gray-900 bg-white text-sm"
                  placeholder="Icon (Emoji)"
                />
                <input
                  type="text"
                  value={card.link || ''}
                  onChange={(e) => {
                    const cards = [...(content.cards || [])];
                    cards[i] = { ...cards[i], link: e.target.value };
                    onChange({ ...content, cards });
                  }}
                  className="px-3 py-1.5 border border-gray-300 rounded text-gray-900 bg-white text-sm"
                  placeholder="Link (optional)"
                />
              </div>
            </div>
          ))}
          <button
            onClick={() => {
              const cards = [...(content.cards || []), { title: '', text: '', icon: '', link: '' }];
              onChange({ ...content, cards });
            }}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            + Karte hinzufügen
          </button>
        </div>
      );

    case 'faq':
      return (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Fragen & Antworten</label>
          {(content.items || []).map((item: any, i: number) => (
            <div key={i} className="p-3 bg-gray-50 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">Frage {i + 1}</span>
                <button
                  onClick={() => {
                    const items = [...(content.items || [])];
                    items.splice(i, 1);
                    onChange({ ...content, items });
                  }}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Entfernen
                </button>
              </div>
              <input
                type="text"
                value={item.question || ''}
                onChange={(e) => {
                  const items = [...(content.items || [])];
                  items[i] = { ...items[i], question: e.target.value };
                  onChange({ ...content, items });
                }}
                className="w-full px-3 py-1.5 border border-gray-300 rounded text-gray-900 bg-white text-sm"
                placeholder="Frage"
              />
              <textarea
                value={item.answer || ''}
                onChange={(e) => {
                  const items = [...(content.items || [])];
                  items[i] = { ...items[i], answer: e.target.value };
                  onChange({ ...content, items });
                }}
                className="w-full px-3 py-1.5 border border-gray-300 rounded text-gray-900 bg-white text-sm"
                rows={2}
                placeholder="Antwort"
              />
            </div>
          ))}
          <button
            onClick={() => {
              const items = [...(content.items || []), { question: '', answer: '' }];
              onChange({ ...content, items });
            }}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            + Frage hinzufügen
          </button>
        </div>
      );

    case 'gallery':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Spalten</label>
            <select
              value={content.columns || 3}
              onChange={(e) => onChange({ ...content, columns: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
            >
              <option value={2}>2 Spalten</option>
              <option value={3}>3 Spalten</option>
              <option value={4}>4 Spalten</option>
            </select>
          </div>
          <label className="block text-sm font-medium text-gray-700">Bilder</label>
          {(content.images || []).map((img: any, i: number) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                type="text"
                value={img.src || ''}
                onChange={(e) => {
                  const images = [...(content.images || [])];
                  images[i] = { ...images[i], src: e.target.value };
                  onChange({ ...content, images });
                }}
                className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-gray-900 bg-white text-sm"
                placeholder="Bild-URL"
              />
              <input
                type="text"
                value={img.alt || ''}
                onChange={(e) => {
                  const images = [...(content.images || [])];
                  images[i] = { ...images[i], alt: e.target.value };
                  onChange({ ...content, images });
                }}
                className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-gray-900 bg-white text-sm"
                placeholder="Alt-Text"
              />
              <button
                onClick={() => {
                  const images = [...(content.images || [])];
                  images.splice(i, 1);
                  onChange({ ...content, images });
                }}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            onClick={() => {
              const images = [...(content.images || []), { src: '', alt: '' }];
              onChange({ ...content, images });
            }}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            + Bild hinzufügen
          </button>
        </div>
      );

    case 'partners':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Untertitel</label>
            <input
              type="text"
              value={content.subtitle || ''}
              onChange={(e) => onChange({ ...content, subtitle: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
            />
          </div>
          <label className="block text-sm font-medium text-gray-700">Partner</label>
          {(content.partners || []).map((partner: any, i: number) => (
            <div key={i} className="p-3 bg-gray-50 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">Partner {i + 1}</span>
                <button
                  onClick={() => {
                    const partners = [...(content.partners || [])];
                    partners.splice(i, 1);
                    onChange({ ...content, partners });
                  }}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Entfernen
                </button>
              </div>
              <input
                type="text"
                value={partner.name || ''}
                onChange={(e) => {
                  const partners = [...(content.partners || [])];
                  partners[i] = { ...partners[i], name: e.target.value };
                  onChange({ ...content, partners });
                }}
                className="w-full px-3 py-1.5 border border-gray-300 rounded text-gray-900 bg-white text-sm"
                placeholder="Name"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={partner.logo || ''}
                  onChange={(e) => {
                    const partners = [...(content.partners || [])];
                    partners[i] = { ...partners[i], logo: e.target.value };
                    onChange({ ...content, partners });
                  }}
                  className="px-3 py-1.5 border border-gray-300 rounded text-gray-900 bg-white text-sm"
                  placeholder="Logo-URL"
                />
                <input
                  type="text"
                  value={partner.url || ''}
                  onChange={(e) => {
                    const partners = [...(content.partners || [])];
                    partners[i] = { ...partners[i], url: e.target.value };
                    onChange({ ...content, partners });
                  }}
                  className="px-3 py-1.5 border border-gray-300 rounded text-gray-900 bg-white text-sm"
                  placeholder="Website-URL"
                />
              </div>
            </div>
          ))}
          <button
            onClick={() => {
              const partners = [...(content.partners || []), { name: '', logo: '', url: '' }];
              onChange({ ...content, partners });
            }}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            + Partner hinzufügen
          </button>
        </div>
      );

    case 'cta':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Text</label>
            <textarea
              value={content.body || ''}
              onChange={(e) => onChange({ ...content, body: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
              rows={3}
            />
          </div>
          <ButtonsEditor
            buttons={content.buttons || []}
            onChange={(buttons) => onChange({ ...content, buttons })}
          />
        </div>
      );

    case 'quotes':
      return (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Zitate</label>
          {(content.quotes || []).map((quote: any, i: number) => (
            <div key={i} className="p-3 bg-gray-50 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">Zitat {i + 1}</span>
                <button
                  onClick={() => {
                    const quotes = [...(content.quotes || [])];
                    quotes.splice(i, 1);
                    onChange({ ...content, quotes });
                  }}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Entfernen
                </button>
              </div>
              <textarea
                value={quote.text || ''}
                onChange={(e) => {
                  const quotes = [...(content.quotes || [])];
                  quotes[i] = { ...quotes[i], text: e.target.value };
                  onChange({ ...content, quotes });
                }}
                className="w-full px-3 py-1.5 border border-gray-300 rounded text-gray-900 bg-white text-sm"
                rows={2}
                placeholder="Zitat-Text"
              />
              <input
                type="text"
                value={quote.author || ''}
                onChange={(e) => {
                  const quotes = [...(content.quotes || [])];
                  quotes[i] = { ...quotes[i], author: e.target.value };
                  onChange({ ...content, quotes });
                }}
                className="w-full px-3 py-1.5 border border-gray-300 rounded text-gray-900 bg-white text-sm"
                placeholder="Autor (optional)"
              />
            </div>
          ))}
          <button
            onClick={() => {
              const quotes = [...(content.quotes || []), { text: '', author: '' }];
              onChange({ ...content, quotes });
            }}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            + Zitat hinzufügen
          </button>
        </div>
      );

    case 'lineup':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Untertitel</label>
            <input
              type="text"
              value={content.subtitle || ''}
              onChange={(e) => onChange({ ...content, subtitle: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
            />
          </div>
          <label className="block text-sm font-medium text-gray-700">Künstler</label>
          {(content.artists || []).map((artist: any, i: number) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                type="text"
                value={artist.name || ''}
                onChange={(e) => {
                  const artists = [...(content.artists || [])];
                  artists[i] = { ...artists[i], name: e.target.value };
                  onChange({ ...content, artists });
                }}
                className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-gray-900 bg-white text-sm"
                placeholder="Name"
              />
              <input
                type="text"
                value={artist.role || ''}
                onChange={(e) => {
                  const artists = [...(content.artists || [])];
                  artists[i] = { ...artists[i], role: e.target.value };
                  onChange({ ...content, artists });
                }}
                className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-gray-900 bg-white text-sm"
                placeholder="Rolle (optional)"
              />
              <button
                onClick={() => {
                  const artists = [...(content.artists || [])];
                  artists.splice(i, 1);
                  onChange({ ...content, artists });
                }}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            onClick={() => {
              const artists = [...(content.artists || []), { name: '', role: '', image: '' }];
              onChange({ ...content, artists });
            }}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            + Künstler hinzufügen
          </button>
        </div>
      );

    case 'custom_html':
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">HTML-Code</label>
          <textarea
            value={content.html || ''}
            onChange={(e) => onChange({ ...content, html: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white font-mono text-sm"
            rows={10}
          />
          <p className="text-xs text-gray-400 mt-1">Achtung: Wird direkt als HTML gerendert.</p>
        </div>
      );

    default:
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Content (JSON)</label>
          <textarea
            value={JSON.stringify(content, null, 2)}
            onChange={(e) => {
              try { onChange(JSON.parse(e.target.value)); } catch {}
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white font-mono text-sm"
            rows={8}
          />
        </div>
      );
  }
}

// === Buttons Editor (wiederverwendbar) ===
function ButtonsEditor({ buttons, onChange }: { buttons: any[]; onChange: (buttons: any[]) => void }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Buttons</label>
      {buttons.map((btn: any, i: number) => (
        <div key={i} className="flex gap-2 items-center">
          <input
            type="text"
            value={btn.text || ''}
            onChange={(e) => {
              const newButtons = [...buttons];
              newButtons[i] = { ...newButtons[i], text: e.target.value };
              onChange(newButtons);
            }}
            className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-gray-900 bg-white text-sm"
            placeholder="Button-Text"
          />
          <input
            type="text"
            value={btn.href || ''}
            onChange={(e) => {
              const newButtons = [...buttons];
              newButtons[i] = { ...newButtons[i], href: e.target.value };
              onChange(newButtons);
            }}
            className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-gray-900 bg-white text-sm"
            placeholder="Link (URL)"
          />
          <select
            value={btn.style || 'primary'}
            onChange={(e) => {
              const newButtons = [...buttons];
              newButtons[i] = { ...newButtons[i], style: e.target.value };
              onChange(newButtons);
            }}
            className="px-2 py-1.5 border border-gray-300 rounded text-gray-900 bg-white text-sm"
          >
            <option value="primary">Primary</option>
            <option value="outline">Outline</option>
          </select>
          <button
            onClick={() => {
              const newButtons = [...buttons];
              newButtons.splice(i, 1);
              onChange(newButtons);
            }}
            className="text-red-500 hover:text-red-700 text-sm"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        onClick={() => onChange([...buttons, { text: '', href: '#', style: 'primary' }])}
        className="text-sm text-blue-600 hover:text-blue-800"
      >
        + Button hinzufügen
      </button>
    </div>
  );
}
