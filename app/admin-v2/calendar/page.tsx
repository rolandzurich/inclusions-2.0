'use client';

import { useState, useEffect } from 'react';

type EventStatus = 'draft' | 'published' | 'cancelled';
type RsvpStatus = 'yes' | 'no' | 'maybe';

interface Event {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  start_at: string;
  end_at?: string;
  location_name?: string;
  location_address?: string;
  location_city?: string;
  max_attendees?: number;
  rsvp_enabled: boolean;
  status: EventStatus;
  rsvp_count: number;
  confirmed_count: number;
  tags?: string[];
  created_at: string;
}

interface Rsvp {
  id: string;
  event_id: string;
  user_email: string;
  user_name?: string;
  status: RsvpStatus;
  notes?: string;
  created_at: string;
}

const statusConfig: Record<EventStatus, { label: string; color: string; bgColor: string }> = {
  draft: { label: 'Entwurf', color: 'text-gray-800', bgColor: 'bg-gray-100' },
  published: { label: 'Veröffentlicht', color: 'text-green-800', bgColor: 'bg-green-100' },
  cancelled: { label: 'Abgesagt', color: 'text-red-800', bgColor: 'bg-red-100' },
};

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [duplicateSource, setDuplicateSource] = useState<Event | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showRsvpModal, setShowRsvpModal] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin-v2/events');
      const data = await res.json();

      if (data.success) {
        setEvents(data.events);
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
      const res = await fetch(`/api/admin-v2/events/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (data.success) {
        showSuccess('Event erfolgreich gelöscht');
        fetchEvents();
      }
    } catch (error) {
      alert('Fehler beim Löschen');
    }
  }

  function showSuccess(message: string) {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  }

  function openModal(event?: Event) {
    setEditingEvent(event || null);
    setDuplicateSource(null);
    setShowModal(true);
  }

  function handleDuplicate(event: Event) {
    setEditingEvent(null); // kein Edit → neues Event
    setDuplicateSource(event); // Quelldaten für Vorausfüllung
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingEvent(null);
    setDuplicateSource(null);
  }

  function openRsvpModal(event: Event) {
    setSelectedEvent(event);
    setShowRsvpModal(true);
  }

  function closeRsvpModal() {
    setShowRsvpModal(false);
    setSelectedEvent(null);
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('de-CH', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('de-CH', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const upcomingEvents = events.filter(
    (e) => new Date(e.start_at) >= new Date() && e.status !== 'cancelled'
  );
  const pastEvents = events.filter((e) => new Date(e.start_at) < new Date());

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
          <h1 className="text-3xl font-bold text-gray-900">📅 Kalender & Events</h1>
          <p className="mt-2 text-gray-600">
            {upcomingEvents.length} kommende Events • {events.length} gesamt
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Neues Event
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Lade Events...</p>
        </div>
      ) : (
        <>
          {/* Upcoming Events */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Kommende Events</h2>
            {upcomingEvents.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Keine kommenden Events
                </h3>
                <p className="text-gray-600 mb-6">Erstelle dein erstes Event</p>
                <button
                  onClick={() => openModal()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  + Erstes Event erstellen
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onEdit={() => openModal(event)}
                    onDuplicate={() => handleDuplicate(event)}
                    onDelete={() => handleDelete(event.id, event.name)}
                    onRsvp={() => openRsvpModal(event)}
                    formatDate={formatDate}
                    formatTime={formatTime}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Past Events */}
          {pastEvents.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Vergangene Events</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pastEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onEdit={() => openModal(event)}
                    onDuplicate={() => handleDuplicate(event)}
                    onDelete={() => handleDelete(event.id, event.name)}
                    onRsvp={() => openRsvpModal(event)}
                    formatDate={formatDate}
                    formatTime={formatTime}
                    isPast
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Event Modal */}
      {showModal && (
        <EventModal
          event={editingEvent}
          duplicateSource={duplicateSource}
          onClose={closeModal}
          onSuccess={(message) => {
            showSuccess(message);
            fetchEvents();
            closeModal();
          }}
        />
      )}

      {/* RSVP Modal */}
      {showRsvpModal && selectedEvent && (
        <RsvpModal
          event={selectedEvent}
          onClose={closeRsvpModal}
          onSuccess={(message) => {
            showSuccess(message);
            fetchEvents();
          }}
        />
      )}
    </div>
  );
}

function EventCard({
  event,
  onEdit,
  onDuplicate,
  onDelete,
  onRsvp,
  formatDate,
  formatTime,
  isPast = false,
}: {
  event: Event;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onRsvp: () => void;
  formatDate: (date: string) => string;
  formatTime: (date: string) => string;
  isPast?: boolean;
}) {
  const capacityPercentage = event.max_attendees
    ? (event.confirmed_count / event.max_attendees) * 100
    : 0;

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow ${
        isPast ? 'opacity-75' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{event.name}</h3>
          <span
            className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
              statusConfig[event.status].bgColor
            } ${statusConfig[event.status].color}`}
          >
            {statusConfig[event.status].label}
          </span>
        </div>
      </div>

      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <div className="flex items-center">
          <span className="mr-2">📅</span>
          {formatDate(event.start_at)}
        </div>
        <div className="flex items-center">
          <span className="mr-2">🕐</span>
          {formatTime(event.start_at)}
          {event.end_at && ` - ${formatTime(event.end_at)}`}
        </div>
        {event.location_name && (
          <div className="flex items-center">
            <span className="mr-2">📍</span>
            {event.location_name}
          </div>
        )}
      </div>

      {/* RSVP Stats */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-600">
            ✓ {event.confirmed_count} Zusagen
            {event.max_attendees && ` / ${event.max_attendees} Plätze`}
          </span>
          {event.max_attendees && (
            <span className="text-gray-600">{Math.round(capacityPercentage)}%</span>
          )}
        </div>
        {event.max_attendees && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                capacityPercentage >= 100 ? 'bg-red-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onRsvp}
          className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
        >
          👋 Zusagen
        </button>
        <button
          onClick={onDuplicate}
          className="px-3 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors text-sm"
          title="Event kopieren"
        >
          📋
        </button>
        <button
          onClick={onEdit}
          className="px-3 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          title="Bearbeiten"
        >
          ✏️
        </button>
        <button
          onClick={onDelete}
          className="px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors text-sm"
          title="Löschen"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}

function EventModal({
  event,
  duplicateSource,
  onClose,
  onSuccess,
}: {
  event: Event | null;
  duplicateSource?: Event | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
}) {
  // Quelle für Vorausfüllung: beim Duplizieren das Original, sonst das editierte Event
  const source = duplicateSource || event;
  const isDuplicate = !!duplicateSource;

  const [formData, setFormData] = useState({
    name: isDuplicate ? `${source?.name || ''} (Kopie)` : (source?.name || ''),
    description: source?.description || '',
    // Beim Duplizieren: Datum leer lassen, damit User neues Datum setzt
    start_at: isDuplicate
      ? ''
      : source?.start_at
        ? new Date(source.start_at).toISOString().slice(0, 16)
        : '',
    end_at: isDuplicate
      ? ''
      : source?.end_at
        ? new Date(source.end_at).toISOString().slice(0, 16)
        : '',
    location_name: source?.location_name || '',
    location_address: source?.location_address || '',
    max_attendees: source?.max_attendees || '',
    status: isDuplicate ? 'draft' as EventStatus : (source?.status || 'draft'),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const url = event ? `/api/admin-v2/events/${event.id}` : '/api/admin-v2/events';
      const method = event ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          max_attendees: formData.max_attendees ? parseInt(formData.max_attendees as any) : null,
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
            {isDuplicate ? '📋 Event duplizieren' : event ? 'Event bearbeiten' : 'Neues Event'}
          </h2>
          {isDuplicate && (
            <p className="text-sm text-blue-600 mt-1">
              Kopie von „{duplicateSource?.name}" – passe das Datum an und speichere.
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Inclusions Party 2026"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Beschreibung
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Startzeit * 🇨🇭
              </label>
              <input
                type="datetime-local"
                required
                value={formData.start_at}
                onChange={(e) => setFormData({ ...formData, start_at: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Endzeit</label>
              <input
                type="datetime-local"
                value={formData.end_at}
                onChange={(e) => setFormData({ ...formData, end_at: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={formData.location_name}
                onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                placeholder="Halle 622"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max. Kapazität
              </label>
              <input
                type="number"
                min="0"
                value={formData.max_attendees}
                onChange={(e) => setFormData({ ...formData, max_attendees: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                placeholder="300"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
            <input
              type="text"
              value={formData.location_address}
              onChange={(e) => setFormData({ ...formData, location_address: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Zürcherstrasse 25, 8400 Winterthur"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as EventStatus })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="draft">Entwurf</option>
              <option value="published">Veröffentlicht</option>
              <option value="cancelled">Abgesagt</option>
            </select>
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
              {saving ? 'Speichere...' : isDuplicate ? 'Kopie erstellen' : event ? 'Aktualisieren' : 'Erstellen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RsvpModal({
  event,
  onClose,
  onSuccess,
}: {
  event: Event;
  onClose: () => void;
  onSuccess: (message: string) => void;
}) {
  const [rsvps, setRsvps] = useState<Rsvp[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRsvps();
  }, []);

  async function fetchRsvps() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin-v2/events/${event.id}`);
      const data = await res.json();
      if (data.success) {
        setRsvps(data.rsvps || []);
      }
    } catch (error) {
      console.error('Fehler beim Laden:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleRsvp(status: RsvpStatus) {
    if (!email) {
      alert('Bitte E-Mail eingeben');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin-v2/rsvps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: event.id,
          user_email: email,
          user_name: name || null,
          status,
        }),
      });

      const data = await res.json();

      if (data.success) {
        onSuccess(data.message);
        fetchRsvps();
        setEmail('');
        setName('');
      } else {
        alert(data.error || 'Fehler beim Zusagen');
      }
    } catch (error) {
      alert('Netzwerkfehler');
    } finally {
      setSubmitting(false);
    }
  }

  const confirmedRsvps = rsvps.filter((r) => r.status === 'yes');
  const maybeRsvps = rsvps.filter((r) => r.status === 'maybe');
  const declinedRsvps = rsvps.filter((r) => r.status === 'no');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">{event.name}</h2>
          <p className="text-gray-600 mt-1">
            {new Date(event.start_at).toLocaleDateString('de-CH', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* RSVP Form */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Zusagen / Absagen</h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <input
                type="email"
                placeholder="E-Mail *"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleRsvp('yes')}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 transition-colors"
              >
                ✓ Zusagen
              </button>
              <button
                onClick={() => handleRsvp('maybe')}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:bg-gray-400 transition-colors"
              >
                ? Vielleicht
              </button>
              <button
                onClick={() => handleRsvp('no')}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-400 transition-colors"
              >
                ✗ Absagen
              </button>
            </div>
          </div>

          {/* RSVP Lists */}
          {loading ? (
            <div className="text-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Confirmed */}
              <div>
                <h4 className="font-semibold text-green-800 mb-2">
                  ✓ Zugesagt ({confirmedRsvps.length})
                </h4>
                {confirmedRsvps.length === 0 ? (
                  <p className="text-sm text-gray-500">Noch keine Zusagen</p>
                ) : (
                  <div className="space-y-2">
                    {confirmedRsvps.map((rsvp) => (
                      <div
                        key={rsvp.id}
                        className="bg-green-50 border border-green-200 rounded-lg p-3"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">
                              {rsvp.user_name || rsvp.user_email}
                            </div>
                            {rsvp.user_name && (
                              <div className="text-sm text-gray-600">{rsvp.user_email}</div>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(rsvp.created_at).toLocaleDateString('de-CH')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Maybe */}
              {maybeRsvps.length > 0 && (
                <div>
                  <h4 className="font-semibold text-yellow-800 mb-2">
                    ? Vielleicht ({maybeRsvps.length})
                  </h4>
                  <div className="space-y-2">
                    {maybeRsvps.map((rsvp) => (
                      <div
                        key={rsvp.id}
                        className="bg-yellow-50 border border-yellow-200 rounded-lg p-3"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">
                              {rsvp.user_name || rsvp.user_email}
                            </div>
                            {rsvp.user_name && (
                              <div className="text-sm text-gray-600">{rsvp.user_email}</div>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(rsvp.created_at).toLocaleDateString('de-CH')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Declined */}
              {declinedRsvps.length > 0 && (
                <div>
                  <h4 className="font-semibold text-red-800 mb-2">
                    ✗ Abgesagt ({declinedRsvps.length})
                  </h4>
                  <div className="space-y-2">
                    {declinedRsvps.map((rsvp) => (
                      <div
                        key={rsvp.id}
                        className="bg-red-50 border border-red-200 rounded-lg p-3"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">
                              {rsvp.user_name || rsvp.user_email}
                            </div>
                            {rsvp.user_name && (
                              <div className="text-sm text-gray-600">{rsvp.user_email}</div>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(rsvp.created_at).toLocaleDateString('de-CH')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Schliessen
          </button>
        </div>
      </div>
    </div>
  );
}
