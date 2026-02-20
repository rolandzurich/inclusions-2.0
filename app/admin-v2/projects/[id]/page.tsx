'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

type ProjectStatus = 'draft' | 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
type TaskStatus = 'todo' | 'in_progress' | 'review' | 'completed' | 'blocked';
type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

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
}

interface Task {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string;
  assigned_to?: string;
  estimated_hours?: number;
  actual_hours?: number;
  created_at: string;
}

const taskStatusConfig: Record<TaskStatus, { label: string; color: string; bgColor: string }> = {
  todo: { label: 'Todo', color: 'text-gray-800', bgColor: 'bg-gray-100' },
  in_progress: { label: 'In Arbeit', color: 'text-blue-800', bgColor: 'bg-blue-100' },
  review: { label: 'Review', color: 'text-yellow-800', bgColor: 'bg-yellow-100' },
  completed: { label: 'Erledigt', color: 'text-green-800', bgColor: 'bg-green-100' },
  blocked: { label: 'Blockiert', color: 'text-red-800', bgColor: 'bg-red-100' },
};

const priorityConfig: Record<TaskPriority, { label: string; icon: string; color: string }> = {
  low: { label: 'Niedrig', icon: '⬇️', color: 'text-gray-600' },
  medium: { label: 'Mittel', icon: '➡️', color: 'text-blue-600' },
  high: { label: 'Hoch', icon: '⬆️', color: 'text-orange-600' },
  urgent: { label: 'Dringend', icon: '🔥', color: 'text-red-600' },
};

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);

  async function fetchProjectDetails() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin-v2/projects/${projectId}`);
      const data = await res.json();

      if (data.success) {
        setProject(data.project);
        setTasks(data.tasks);
      } else if (res.status === 404) {
        router.push('/admin-v2/projects');
      }
    } catch (error) {
      console.error('Fehler beim Laden:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteTask(id: string, title: string) {
    if (!confirm(`Möchten Sie "${title}" wirklich löschen?`)) return;

    try {
      const res = await fetch(`/api/admin-v2/tasks/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (data.success) {
        showSuccess('Task erfolgreich gelöscht');
        fetchProjectDetails();
      }
    } catch (error) {
      alert('Fehler beim Löschen');
    }
  }

  function showSuccess(message: string) {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  }

  function openTaskModal(task?: Task) {
    setEditingTask(task || null);
    setShowTaskModal(true);
  }

  function closeTaskModal() {
    setShowTaskModal(false);
    setEditingTask(null);
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

  const tasksByStatus = (status: TaskStatus) => tasks.filter((t) => t.status === status);

  if (loading || !project) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Lade Projekt...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          ✓ {successMessage}
        </div>
      )}

      {/* Breadcrumb */}
      <div className="text-sm text-gray-600">
        <Link href="/admin-v2/projects" className="hover:underline">
          Projekte
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{project.title}</span>
      </div>

      {/* Project Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.title}</h1>
            {project.description && (
              <p className="text-gray-600">{project.description}</p>
            )}
          </div>
          <Link
            href="/admin-v2/projects"
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            ← Zurück
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          {project.client_name && (
            <div>
              <div className="text-sm text-gray-600">Kunde</div>
              <div className="font-medium text-gray-900">{project.client_name}</div>
            </div>
          )}
          {project.budget_chf && (
            <div>
              <div className="text-sm text-gray-600">Budget 🇨🇭</div>
              <div className="font-medium text-gray-900">{formatCurrency(project.budget_chf)}</div>
            </div>
          )}
          {project.start_date && (
            <div>
              <div className="text-sm text-gray-600">Start</div>
              <div className="font-medium text-gray-900">{formatDate(project.start_date)}</div>
            </div>
          )}
          {project.end_date && (
            <div>
              <div className="text-sm text-gray-600">Ende</div>
              <div className="font-medium text-gray-900">{formatDate(project.end_date)}</div>
            </div>
          )}
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">
              Fortschritt: {project.completed_task_count} / {project.task_count} Tasks
            </span>
            <span className="text-sm text-gray-600">
              {project.task_count > 0
                ? Math.round((project.completed_task_count / project.task_count) * 100)
                : 0}
              %
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all"
              style={{
                width: `${
                  project.task_count > 0
                    ? (project.completed_task_count / project.task_count) * 100
                    : 0
                }%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Task Board Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Task-Board</h2>
        <button
          onClick={() => openTaskModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Neue Task
        </button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {(Object.keys(taskStatusConfig) as TaskStatus[]).map((status) => (
          <div key={status} className="bg-gray-50 rounded-lg p-4">
            <div className="mb-3">
              <h3 className="font-semibold text-gray-900">
                {taskStatusConfig[status].label}
              </h3>
              <p className="text-sm text-gray-600">{tasksByStatus(status).length} Tasks</p>
            </div>
            <div className="space-y-3">
              {tasksByStatus(status).map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={() => openTaskModal(task)}
                  onDelete={() => handleDeleteTask(task.id, task.title)}
                  formatDate={formatDate}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <TaskModal
          task={editingTask}
          projectId={projectId}
          onClose={closeTaskModal}
          onSuccess={(message) => {
            showSuccess(message);
            fetchProjectDetails();
            closeTaskModal();
          }}
        />
      )}
    </div>
  );
}

function TaskCard({
  task,
  onEdit,
  onDelete,
  formatDate,
}: {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  formatDate: (date: string) => string;
}) {
  return (
    <div className="bg-white p-3 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-gray-900 text-sm flex-1">{task.title}</h4>
        <span className={`text-lg ${priorityConfig[task.priority].color}`}>
          {priorityConfig[task.priority].icon}
        </span>
      </div>

      {task.description && (
        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{task.description}</p>
      )}

      {task.due_date && (
        <div className="text-xs text-gray-500 mb-2">
          📅 {formatDate(task.due_date)}
        </div>
      )}

      {task.assigned_to && (
        <div className="text-xs text-gray-500 mb-2">
          👤 {task.assigned_to}
        </div>
      )}

      {(task.estimated_hours || task.actual_hours) && (
        <div className="text-xs text-gray-500 mb-2">
          ⏱️ {task.actual_hours || 0}h / {task.estimated_hours || 0}h
        </div>
      )}

      <div className="flex gap-1 mt-3 pt-3 border-t border-gray-200">
        <button
          onClick={onEdit}
          className="flex-1 px-2 py-1 text-xs text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
        >
          ✏️
        </button>
        <button
          onClick={onDelete}
          className="px-2 py-1 text-xs text-red-600 border border-red-300 rounded hover:bg-red-50 transition-colors"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}

function TaskModal({
  task,
  projectId,
  onClose,
  onSuccess,
}: {
  task: Task | null;
  projectId: string;
  onClose: () => void;
  onSuccess: (message: string) => void;
}) {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'todo',
    priority: task?.priority || 'medium',
    due_date: task?.due_date || '',
    assigned_to: task?.assigned_to || '',
    estimated_hours: task?.estimated_hours || 0,
    actual_hours: task?.actual_hours || 0,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const url = task ? `/api/admin-v2/tasks/${task.id}` : '/api/admin-v2/tasks';
      const method = task ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          project_id: projectId,
        }),
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
            {task ? 'Task bearbeiten' : 'Neue Task'}
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
              placeholder="Design erstellen"
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
                onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              >
                {Object.entries(taskStatusConfig).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priorität *</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              >
                {Object.entries(priorityConfig).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.icon} {config.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fälligkeitsdatum</label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Zugewiesen an</label>
              <input
                type="text"
                value={formData.assigned_to}
                onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                placeholder="Max Muster"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Geschätzte Stunden</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={formData.estimated_hours}
                onChange={(e) =>
                  setFormData({ ...formData, estimated_hours: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tatsächliche Stunden</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={formData.actual_hours}
                onChange={(e) =>
                  setFormData({ ...formData, actual_hours: parseFloat(e.target.value) || 0 })
                }
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
              {saving ? 'Speichere...' : task ? 'Aktualisieren' : 'Erstellen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
