'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type ProjectStatus = 'draft' | 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';

interface Project {
  id: string;
  title: string;
  description?: string;
  status: ProjectStatus;
  start_date?: string;
  end_date?: string;
  budget_chf?: number;
  client_name?: string;
  task_count: number;
  completed_task_count: number;
  created_at: string;
}

const statusConfig: Record<ProjectStatus, { label: string; color: string; bgColor: string }> = {
  draft: { label: 'Entwurf', color: 'text-gray-800', bgColor: 'bg-gray-100' },
  planning: { label: 'Planung', color: 'text-blue-800', bgColor: 'bg-blue-100' },
  active: { label: 'Aktiv', color: 'text-green-800', bgColor: 'bg-green-100' },
  on_hold: { label: 'Pausiert', color: 'text-yellow-800', bgColor: 'bg-yellow-100' },
  completed: { label: 'Abgeschlossen', color: 'text-purple-800', bgColor: 'bg-purple-100' },
  cancelled: { label: 'Abgebrochen', color: 'text-red-800', bgColor: 'bg-red-100' },
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'' | ProjectStatus>('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchProjects();
  }, [statusFilter, search]);

  async function fetchProjects() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (search) params.append('search', search);

      const res = await fetch(`/api/admin-v2/projects?${params}`);
      const data = await res.json();

      if (data.success) {
        setProjects(data.projects);
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
      const res = await fetch(`/api/admin-v2/projects/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (data.success) {
        showSuccess('Projekt erfolgreich gelöscht');
        fetchProjects();
      }
    } catch (error) {
      alert('Fehler beim Löschen');
    }
  }

  function showSuccess(message: string) {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  }

  function openModal(project?: Project) {
    setEditingProject(project || null);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingProject(null);
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('de-CH');
  };

  const getProgressPercentage = (completed: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  const activeProjects = projects.filter((p) => p.status === 'active');
  const totalBudget = projects.reduce((sum, p) => sum + (p.budget_chf || 0), 0);

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
          <h1 className="text-3xl font-bold text-gray-900">📁 Projekte</h1>
          <p className="mt-2 text-gray-600">
            {activeProjects.length} aktive • {projects.length} gesamt • Budget: {formatCurrency(totalBudget)}
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Neues Projekt
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              placeholder="Suche nach Titel, Beschreibung, Kunde..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Alle Status</option>
              {Object.entries(statusConfig).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Lade Projekte...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">📁</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {search || statusFilter ? 'Keine Projekte gefunden' : 'Noch keine Projekte'}
          </h3>
          <p className="text-gray-600 mb-6">
            {search || statusFilter ? 'Versuche eine andere Suche' : 'Erstelle dein erstes Projekt'}
          </p>
          {!search && !statusFilter && (
            <button
              onClick={() => openModal()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Erstes Projekt erstellen
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => {
            const progress = getProgressPercentage(
              project.completed_task_count,
              project.task_count
            );

            return (
              <Link
                key={project.id}
                href={`/admin-v2/projects/${project.id}`}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{project.title}</h3>
                  <span
                    className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                      statusConfig[project.status].bgColor
                    } ${statusConfig[project.status].color}`}
                  >
                    {statusConfig[project.status].label}
                  </span>
                </div>

                {/* Description */}
                {project.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {project.description}
                  </p>
                )}

                {/* Client */}
                {project.client_name && (
                  <div className="flex items-center text-sm text-gray-600 mb-4">
                    <span className="mr-2">🏢</span>
                    {project.client_name}
                  </div>
                )}

                {/* Dates */}
                {(project.start_date || project.end_date) && (
                  <div className="text-sm text-gray-600 mb-4">
                    {project.start_date && (
                      <div>📅 Start: {formatDate(project.start_date)}</div>
                    )}
                    {project.end_date && (
                      <div>🏁 Ende: {formatDate(project.end_date)}</div>
                    )}
                  </div>
                )}

                {/* Budget */}
                {project.budget_chf && (
                  <div className="text-sm font-medium text-gray-900 mb-4">
                    💰 Budget: {formatCurrency(project.budget_chf)}
                  </div>
                )}

                {/* Tasks Progress */}
                <div className="mb-2">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">
                      ✓ {project.completed_task_count} / {project.task_count} Tasks
                    </span>
                    <span className="text-gray-600">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      openModal(project);
                    }}
                    className="flex-1 px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    ✏️ Bearbeiten
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete(project.id, project.title);
                    }}
                    className="px-3 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <ProjectModal
          project={editingProject}
          onClose={closeModal}
          onSuccess={(message) => {
            showSuccess(message);
            fetchProjects();
            closeModal();
          }}
        />
      )}
    </div>
  );
}

function ProjectModal({
  project,
  onClose,
  onSuccess,
}: {
  project: Project | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
}) {
  const [formData, setFormData] = useState({
    title: project?.title || '',
    description: project?.description || '',
    status: project?.status || 'planning',
    start_date: project?.start_date || '',
    end_date: project?.end_date || '',
    budget_chf: project?.budget_chf || 0,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const url = project
        ? `/api/admin-v2/projects/${project.id}`
        : '/api/admin-v2/projects';
      const method = project ? 'PUT' : 'POST';

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
            {project ? 'Projekt bearbeiten' : 'Neues Projekt'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titel *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              placeholder="Website Redesign 2026"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              >
                {Object.entries(statusConfig).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Budget (CHF) 🇨🇭
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.budget_chf}
                onChange={(e) =>
                  setFormData({ ...formData, budget_chf: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                placeholder="10000"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Startdatum</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Enddatum</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
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
              {saving ? 'Speichere...' : project ? 'Aktualisieren' : 'Erstellen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
