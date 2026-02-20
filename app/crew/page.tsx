'use client';

import { useState, useEffect } from 'react';

interface CrewEvent {
  id: string;
  name: string;
  description?: string;
  start_at: string;
  end_at?: string;
  location_name?: string;
  location_address?: string;
  location_city?: string;
  max_attendees?: number;
  status: string;
  confirmed_count: number;
  rsvp_count: number;
}

interface RsvpPerson {
  user_name: string;
  status: string;
}

interface RsvpDetails {
  event: CrewEvent;
  my_rsvp: { status: string } | null;
  confirmed: RsvpPerson[];
  maybe: RsvpPerson[];
  declined: RsvpPerson[];
}

export default function CrewCalendarPage() {
  const [events, setEvents] = useState<CrewEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [rsvpDetails, setRsvpDetails] = useState<RsvpDetails | null>(null);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [rsvpSubmitting, setRsvpSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    setLoading(true);
    try {
      const res = await fetch('/api/crew/events');
      const data = await res.json();
      if (data.success) {
        setEvents(data.events);
      }
    } catch (err) {
      console.error('Fehler:', err);
    } finally {
      setLoading(false);
    }
  }

  async function openEvent(eventId: string) {
    setSelectedEvent(eventId);
    setRsvpLoading(true);
    try {
      const res = await fetch(`/api/crew/events/${eventId}/rsvp`);
      const data = await res.json();
      if (data.success) {
        setRsvpDetails(data);
      }
    } catch (err) {
      console.error('Fehler:', err);
    } finally {
      setRsvpLoading(false);
    }
  }

  async function handleRsvp(eventId: string, status: 'yes' | 'no' | 'maybe') {
    setRsvpSubmitting(true);
    try {
      const res = await fetch(`/api/crew/events/${eventId}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(data.message);
        setTimeout(() => setSuccessMsg(''), 3000);
        // Refresh details + list
        await openEvent(eventId);
        fetchEvents();
      } else {
        setSuccessMsg('');
        console.error('RSVP Fehler:', data.error);
      }
    } catch (err) {
      console.error('RSVP Fehler:', err);
    } finally {
      setRsvpSubmitting(false);
    }
  }

  function handleCalendarExport(eventId: string) {
    window.open(`/api/crew/events/${eventId}/ical`, '_blank');
  }

  const now = new Date();
  const upcoming = events.filter(e => new Date(e.start_at) >= now);
  const past = events.filter(e => new Date(e.start_at) < now);

  const formatDate = (d: string) => new Date(d).toLocaleDateString('de-CH', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
  const formatTime = (d: string) => new Date(d).toLocaleTimeString('de-CH', {
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="space-y-6">
      {successMsg && (
        <div className="fixed top-16 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse">
          ✓ {successMsg}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Kalender & Events</h1>
        <p className="text-gray-500 mt-1">
          {upcoming.length} kommende Event{upcoming.length !== 1 ? 's' : ''}
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-500">Lade Events...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Event-Liste */}
          <div className="lg:col-span-2 space-y-3">
            {upcoming.length === 0 && past.length === 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <div className="text-5xl mb-3">📅</div>
                <p className="text-gray-600">Noch keine Events geplant.</p>
              </div>
            )}

            {upcoming.length > 0 && (
              <>
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Kommende Events</h2>
                {upcoming.map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                    isSelected={selectedEvent === event.id}
                    onClick={() => openEvent(event.id)}
                    formatDate={formatDate}
                    formatTime={formatTime}
                  />
                ))}
              </>
            )}

            {past.length > 0 && (
              <>
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mt-6">Vergangene Events</h2>
                {past.map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                    isSelected={selectedEvent === event.id}
                    onClick={() => openEvent(event.id)}
                    formatDate={formatDate}
                    formatTime={formatTime}
                    isPast
                  />
                ))}
              </>
            )}
          </div>

          {/* Detail-Panel */}
          <div className="lg:col-span-1">
            {selectedEvent && rsvpDetails ? (
              <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-20 space-y-4">
                {rsvpLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
                  </div>
                ) : (
                  <>
                    {/* Event-Titel */}
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">
                        {rsvpDetails.event.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatDate(rsvpDetails.event.start_at)} · {formatTime(rsvpDetails.event.start_at)}
                        {rsvpDetails.event.end_at && ` – ${formatTime(rsvpDetails.event.end_at)}`}
                      </p>
                    </div>

                    {/* Ort */}
                    {rsvpDetails.event.location_name && (
                      <div className="flex items-start gap-2">
                        <span className="text-sm">📍</span>
                        <div>
                          <p className="text-sm font-medium text-gray-700">{rsvpDetails.event.location_name}</p>
                          {rsvpDetails.event.location_address && (
                            <p className="text-xs text-gray-400">{rsvpDetails.event.location_address}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Beschreibung */}
                    {rsvpDetails.event.description && (
                      <p className="text-sm text-gray-600 whitespace-pre-line border-t pt-3">
                        {rsvpDetails.event.description}
                      </p>
                    )}

                    {/* RSVP Buttons */}
                    <div className="border-t pt-3">
                      <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Dein Status</p>
                      <div className="flex gap-2">
                        {(['yes', 'no', 'maybe'] as const).map(s => {
                          const isActive = rsvpDetails.my_rsvp?.status === s;
                          const config = {
                            yes: { label: '✓ Dabei', active: 'bg-green-500 text-white border-green-500 shadow-green-200 shadow-md', inactive: 'border-green-300 text-green-700 hover:bg-green-50' },
                            no: { label: '✗ Nicht dabei', active: 'bg-red-500 text-white border-red-500 shadow-red-200 shadow-md', inactive: 'border-red-300 text-red-700 hover:bg-red-50' },
                            maybe: { label: '? Vielleicht', active: 'bg-yellow-500 text-white border-yellow-500 shadow-yellow-200 shadow-md', inactive: 'border-yellow-300 text-yellow-700 hover:bg-yellow-50' },
                          }[s];
                          return (
                            <button
                              key={s}
                              onClick={() => handleRsvp(selectedEvent, s)}
                              disabled={rsvpSubmitting}
                              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                                isActive ? config.active : config.inactive
                              } ${rsvpSubmitting ? 'opacity-50' : ''}`}
                            >
                              {config.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Kalender-Export */}
                    <button
                      onClick={() => handleCalendarExport(selectedEvent)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                    >
                      <span>📅</span>
                      <span>In meinen Kalender eintragen</span>
                    </button>

                    {/* Teilnehmer-Listen */}
                    <div className="border-t pt-3 space-y-3">
                      {/* Dabei */}
                      <RsvpGroup
                        label="Dabei"
                        icon="✓"
                        color="green"
                        people={rsvpDetails.confirmed}
                        max={rsvpDetails.event.max_attendees}
                      />

                      {/* Vielleicht */}
                      {(rsvpDetails.maybe?.length || 0) > 0 && (
                        <RsvpGroup
                          label="Vielleicht"
                          icon="?"
                          color="yellow"
                          people={rsvpDetails.maybe}
                        />
                      )}

                      {/* Abgesagt */}
                      {(rsvpDetails.declined?.length || 0) > 0 && (
                        <RsvpGroup
                          label="Nicht dabei"
                          icon="✗"
                          color="red"
                          people={rsvpDetails.declined}
                        />
                      )}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center sticky top-20">
                <div className="text-4xl mb-2">👈</div>
                <p className="text-sm text-gray-500">Wähle ein Event aus</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// === RSVP-Gruppe: Zeigt Liste der Personen mit Status ===
function RsvpGroup({
  label,
  icon,
  color,
  people,
  max,
}: {
  label: string;
  icon: string;
  color: 'green' | 'yellow' | 'red';
  people: RsvpPerson[];
  max?: number;
}) {
  const colorMap = {
    green: { bg: 'bg-green-100', text: 'text-green-700', badge: 'bg-green-500' },
    yellow: { bg: 'bg-yellow-100', text: 'text-yellow-700', badge: 'bg-yellow-500' },
    red: { bg: 'bg-red-100', text: 'text-red-700', badge: 'bg-red-500' },
  };
  const c = colorMap[color];

  return (
    <div>
      <div className="flex items-center gap-2 mb-1.5">
        <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full ${c.badge} text-white text-xs font-bold`}>
          {people.length}
        </span>
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {label}
          {max !== undefined && max !== null && color === 'green' ? ` / ${max}` : ''}
        </span>
      </div>
      {people.length === 0 ? (
        <p className="text-xs text-gray-400 pl-7">Noch niemand.</p>
      ) : (
        <div className="space-y-1 pl-1">
          {people.map((p, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full ${c.bg} ${c.text} flex items-center justify-center text-xs font-semibold`}>
                {p.user_name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <span className="text-sm text-gray-700">{p.user_name || 'Anonym'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// === Event-Karte in der Liste ===
function EventCard({
  event,
  isSelected,
  onClick,
  formatDate,
  formatTime,
  isPast = false,
}: {
  event: CrewEvent;
  isSelected: boolean;
  onClick: () => void;
  formatDate: (d: string) => string;
  formatTime: (d: string) => string;
  isPast?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left bg-white rounded-xl border p-4 transition-all hover:shadow-md ${
        isSelected ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200'
      } ${isPast ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{event.name}</h3>
          <div className="flex items-center gap-3 mt-1.5 text-sm text-gray-500">
            <span>📅 {formatDate(event.start_at)}</span>
            <span>🕐 {formatTime(event.start_at)}</span>
          </div>
          {event.location_name && (
            <div className="text-sm text-gray-400 mt-1">📍 {event.location_name}</div>
          )}
        </div>
        <div className="text-right ml-4">
          <div className={`text-sm font-medium ${Number(event.confirmed_count) > 0 ? 'text-green-600' : 'text-gray-400'}`}>
            {event.confirmed_count} Zusage{Number(event.confirmed_count) !== 1 ? 'n' : ''}
          </div>
          {event.max_attendees && (
            <div className="text-xs text-gray-400">
              / {event.max_attendees} Plätze
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
