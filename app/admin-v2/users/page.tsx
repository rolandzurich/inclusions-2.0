'use client';

import { useState, useEffect } from 'react';

type UserRole = 'admin' | 'crew';
type UserStatus = 'active' | 'pending' | 'disabled';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

const roleConfig: Record<UserRole, { label: string; icon: string; color: string; bg: string }> = {
  admin: { label: 'Admin', icon: '🔑', color: 'text-purple-800', bg: 'bg-purple-100' },
  crew: { label: 'Crew', icon: '👥', color: 'text-blue-800', bg: 'bg-blue-100' },
};

const statusConfig: Record<UserStatus, { label: string; color: string; bg: string }> = {
  active: { label: 'Aktiv', color: 'text-green-800', bg: 'bg-green-100' },
  pending: { label: 'Eingeladen', color: 'text-yellow-800', bg: 'bg-yellow-100' },
  disabled: { label: 'Deaktiviert', color: 'text-red-800', bg: 'bg-red-100' },
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin-v2/users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Fehler beim Laden:', error);
    } finally {
      setLoading(false);
    }
  }

  function showSuccess(msg: string) {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 4000);
  }

  async function handleStatusToggle(user: User) {
    const newStatus = user.status === 'active' ? 'disabled' : 'active';
    const action = newStatus === 'active' ? 'aktivieren' : 'deaktivieren';

    if (!confirm(`"${user.email}" wirklich ${action}?`)) return;

    try {
      const res = await fetch(`/api/admin-v2/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        showSuccess(`User ${data.user.email} ${action === 'aktivieren' ? 'aktiviert' : 'deaktiviert'}`);
        fetchUsers();
      } else {
        alert(data.error || 'Fehler');
      }
    } catch {
      alert('Netzwerkfehler');
    }
  }

  async function handleDelete(user: User) {
    if (!confirm(`"${user.email}" wirklich löschen? Dies kann nicht rückgängig gemacht werden.`)) return;

    try {
      const res = await fetch(`/api/admin-v2/users/${user.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showSuccess(data.message);
        fetchUsers();
      } else {
        alert(data.error || 'Fehler');
      }
    } catch {
      alert('Netzwerkfehler');
    }
  }

  const admins = users.filter((u) => u.role === 'admin');
  const crew = users.filter((u) => u.role === 'crew');

  return (
    <div className="space-y-6">
      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          ✓ {successMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">👤 User-Verwaltung</h1>
          <p className="mt-2 text-gray-600">
            {admins.length} Admins • {crew.length} Crew-Mitglieder
          </p>
        </div>
        <button
          onClick={() => { setEditingUser(null); setShowModal(true); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + User einladen
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Lade Users...</p>
        </div>
      ) : (
        <>
          {/* Admins */}
          <UserGroup
            title="Admins"
            subtitle="Volles Backend-Zugang"
            icon="🔑"
            users={admins}
            onEdit={(u) => { setEditingUser(u); setShowModal(true); }}
            onToggleStatus={handleStatusToggle}
            onDelete={handleDelete}
          />

          {/* Crew */}
          <UserGroup
            title="Crew"
            subtitle="Kalender & Events Zugang"
            icon="👥"
            users={crew}
            onEdit={(u) => { setEditingUser(u); setShowModal(true); }}
            onToggleStatus={handleStatusToggle}
            onDelete={handleDelete}
          />

          {users.length === 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <div className="text-6xl mb-4">👤</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Keine User vorhanden</h3>
              <p className="text-gray-600 mb-4">Lade zuerst die User-Datenbank mit der Init-Funktion.</p>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {showModal && (
        <UserModal
          user={editingUser}
          onClose={() => { setShowModal(false); setEditingUser(null); }}
          onSuccess={(msg) => {
            showSuccess(msg);
            fetchUsers();
            setShowModal(false);
            setEditingUser(null);
          }}
        />
      )}
    </div>
  );
}

// === User-Gruppe Komponente ===
function UserGroup({
  title,
  subtitle,
  icon,
  users,
  onEdit,
  onToggleStatus,
  onDelete,
}: {
  title: string;
  subtitle: string;
  icon: string;
  users: User[];
  onEdit: (user: User) => void;
  onToggleStatus: (user: User) => void;
  onDelete: (user: User) => void;
}) {
  if (users.length === 0) return null;

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-3">
        {icon} {title} <span className="text-sm font-normal text-gray-500">({users.length}) – {subtitle}</span>
      </h2>
      <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
        {users.map((user) => (
          <div key={user.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg">
                {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">
                    {user.name || user.email.split('@')[0]}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[user.status].bg} ${statusConfig[user.status].color}`}>
                    {statusConfig[user.status].label}
                  </span>
                </div>
                <div className="text-sm text-gray-500">{user.email}</div>
                {user.last_login_at && (
                  <div className="text-xs text-gray-400">
                    Letzter Login: {new Date(user.last_login_at).toLocaleDateString('de-CH', {
                      day: '2-digit', month: '2-digit', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit(user)}
                className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                title="Bearbeiten"
              >
                ✏️
              </button>
              <button
                onClick={() => onToggleStatus(user)}
                className={`px-3 py-1.5 text-sm border rounded-lg ${
                  user.status === 'active'
                    ? 'text-amber-600 border-amber-300 hover:bg-amber-50'
                    : 'text-green-600 border-green-300 hover:bg-green-50'
                }`}
                title={user.status === 'active' ? 'Deaktivieren' : 'Aktivieren'}
              >
                {user.status === 'active' ? '⏸️' : '▶️'}
              </button>
              <button
                onClick={() => onDelete(user)}
                className="px-3 py-1.5 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
                title="Löschen"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// === User Modal (Erstellen / Bearbeiten) ===
function UserModal({
  user,
  onClose,
  onSuccess,
}: {
  user: User | null;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}) {
  const [email, setEmail] = useState(user?.email || '');
  const [name, setName] = useState(user?.name || '');
  const [role, setRole] = useState<UserRole>(user?.role || 'crew');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (user) {
        // Update
        const body: any = { name, role };
        if (password) body.password = password;

        const res = await fetch(`/api/admin-v2/users/${user.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (data.success) {
          onSuccess('User aktualisiert');
        } else {
          setError(data.error);
        }
      } else {
        // Neuen User erstellen
        const res = await fetch('/api/admin-v2/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            name: name || undefined,
            role,
            password: password || undefined,
          }),
        });
        const data = await res.json();
        if (data.success) {
          onSuccess(data.message);
        } else {
          setError(data.error);
        }
      }
    } catch {
      setError('Netzwerkfehler');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {user ? 'User bearbeiten' : 'Neuen User einladen'}
          </h2>
          {!user && (
            <p className="text-sm text-gray-500 mt-1">
              Der User wählt sein Passwort selbst beim ersten Login.
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* E-Mail */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!!user}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
              placeholder="name@example.com"
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Vorname"
            />
          </div>

          {/* Rolle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rolle *</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`p-3 rounded-lg border-2 text-left transition-colors ${
                  role === 'admin'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-lg mb-1">🔑</div>
                <div className="font-medium text-sm text-gray-900">Admin</div>
                <div className="text-xs text-gray-500">Volles Backend</div>
              </button>
              <button
                type="button"
                onClick={() => setRole('crew')}
                className={`p-3 rounded-lg border-2 text-left transition-colors ${
                  role === 'crew'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-lg mb-1">👥</div>
                <div className="font-medium text-sm text-gray-900">Crew</div>
                <div className="text-xs text-gray-500">Kalender & Events</div>
              </button>
            </div>
          </div>

          {/* Passwort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Passwort {user ? '(leer = nicht ändern)' : '(optional)'}
            </label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={password ? 8 : undefined}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={user ? 'Neues Passwort eingeben...' : 'Leer = User wählt selbst beim Login'}
            />
            <p className="text-xs text-gray-400 mt-1">
              {user
                ? 'Nur ausfüllen wenn das Passwort geändert werden soll.'
                : 'Leer lassen → User setzt Passwort selbst beim ersten Login auf /crew'}
            </p>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              disabled={saving}
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {saving ? 'Speichere...' : user ? 'Aktualisieren' : 'User erstellen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
