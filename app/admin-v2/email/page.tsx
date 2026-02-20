'use client';

import { useState, useEffect, useCallback } from 'react';

// ============================================
// TYPEN
// ============================================

interface Email {
  id: string;
  account: string;
  from_email: string;
  from_name: string;
  subject: string;
  received_at: string;
  ai_status: string;
  ai_summary: string;
  ai_classification: string;
  ai_urgency: string;
  ai_sentiment: string;
  is_processed: boolean;
  is_read: boolean;
  has_attachments: boolean;
  pending_actions: number;
}

interface EmailAction {
  id: string;
  email_id: string;
  action_type: string;
  action_data: any;
  status: string;
  is_research: boolean;
  email_subject: string;
  email_from: string;
  email_from_name: string;
}

interface Stats {
  total: number;
  unread: number;
  pending_analysis: number;
  urgent: number;
  sponsoring: number;
  booking: number;
  partnership: number;
  media: number;
}

// ============================================
// KONSTANTEN
// ============================================

const CLASSIFICATION_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  sponsoring: { label: 'Sponsoring', icon: '💰', color: 'bg-yellow-100 text-yellow-800' },
  booking: { label: 'Booking', icon: '🎵', color: 'bg-purple-100 text-purple-800' },
  partnership: { label: 'Partnerschaft', icon: '🤝', color: 'bg-blue-100 text-blue-800' },
  media: { label: 'Medien', icon: '📰', color: 'bg-pink-100 text-pink-800' },
  volunteer: { label: 'Volunteer', icon: '🙋', color: 'bg-green-100 text-green-800' },
  vip: { label: 'VIP', icon: '⭐', color: 'bg-amber-100 text-amber-800' },
  donation: { label: 'Spende', icon: '❤️', color: 'bg-red-100 text-red-800' },
  general: { label: 'Allgemein', icon: '📧', color: 'bg-gray-100 text-gray-800' },
  internal: { label: 'Intern', icon: '🏠', color: 'bg-gray-100 text-gray-500' },
  automated: { label: 'Automatisch', icon: '🤖', color: 'bg-gray-100 text-gray-400' },
  newsletter: { label: 'Newsletter', icon: '📰', color: 'bg-gray-100 text-gray-400' },
  spam: { label: 'Spam', icon: '🚫', color: 'bg-gray-100 text-gray-400' },
};

const URGENCY_LABELS: Record<string, { label: string; color: string }> = {
  critical: { label: 'Kritisch', color: 'bg-red-600 text-white' },
  high: { label: 'Dringend', color: 'bg-red-100 text-red-700' },
  medium: { label: 'Mittel', color: 'bg-orange-100 text-orange-700' },
  normal: { label: 'Normal', color: 'bg-gray-100 text-gray-600' },
  low: { label: 'Niedrig', color: 'bg-gray-50 text-gray-400' },
};

const ACTION_LABELS: Record<string, { label: string; icon: string }> = {
  create_contact: { label: 'Kontakt erstellen', icon: '👤' },
  update_contact: { label: 'Kontakt aktualisieren', icon: '✏️' },
  create_company: { label: 'Unternehmen erstellen', icon: '🏢' },
  create_deal: { label: 'Deal erstellen', icon: '💼' },
  create_project: { label: 'Projekt erstellen', icon: '📋' },
  create_event: { label: 'Kalender-Eintrag', icon: '📅' },
  create_booking: { label: 'Booking erstellen', icon: '🎵' },
  create_vip: { label: 'VIP-Anmeldung', icon: '⭐' },
  add_note: { label: 'Notiz hinzufügen', icon: '📝' },
  web_research: { label: 'Web-Recherche', icon: '🔍' },
};

// ============================================
// KOMPONENTE
// ============================================

export default function EmailHubPage() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [actions, setActions] = useState<EmailAction[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [ingesting, setIngesting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [filter, setFilter] = useState({ account: '', classification: '', urgency: '', search: '' });
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [setupNeeded, setSetupNeeded] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Daten laden
  const loadData = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filter.account) params.set('account', filter.account);
      if (filter.classification) params.set('classification', filter.classification);
      if (filter.urgency) params.set('urgency', filter.urgency);
      if (filter.search) params.set('search', filter.search);

      const [emailRes, actionRes] = await Promise.all([
        fetch(`/api/admin-v2/email/inbox?${params}`),
        fetch('/api/admin-v2/email/actions?status=suggested'),
      ]);

      if (!emailRes.ok) {
        const err = await emailRes.json();
        if (err.error?.includes('email_messages')) {
          setSetupNeeded(true);
          return;
        }
      }

      const emailData = await emailRes.json();
      const actionData = await actionRes.json();

      setEmails(emailData.emails || []);
      setStats(emailData.stats || null);
      setActions(actionData.actions || []);
      setSetupNeeded(false);
    } catch {
      setSetupNeeded(true);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { loadData(); }, [loadData]);

  // Schema initialisieren
  async function initSchema() {
    setStatusMessage('Schema wird erstellt...');
    const res = await fetch('/api/admin-v2/email/init', { method: 'POST' });
    const data = await res.json();
    setStatusMessage(data.message || 'Fertig');
    setSetupNeeded(false);
    loadData();
  }

  // E-Mails abrufen
  async function handleIngest() {
    setIngesting(true);
    setStatusMessage('E-Mails werden abgerufen...');
    try {
      const res = await fetch('/api/admin-v2/email/ingest?days=14', { method: 'POST' });
      const data = await res.json();
      setStatusMessage(data.message || 'Fertig');
      loadData();
    } catch (err: any) {
      setStatusMessage(`Fehler: ${err.message}`);
    } finally {
      setIngesting(false);
    }
  }

  // KI-Analyse starten
  async function handleAnalyze() {
    setAnalyzing(true);
    setStatusMessage('KI analysiert E-Mails...');
    try {
      const res = await fetch('/api/admin-v2/email/analyze', { method: 'POST' });
      const data = await res.json();
      setStatusMessage(`${data.analyzed} analysiert, ${data.errors} Fehler`);
      loadData();
    } catch (err: any) {
      setStatusMessage(`Fehler: ${err.message}`);
    } finally {
      setAnalyzing(false);
    }
  }

  // Aktion bestätigen/ablehnen
  async function handleAction(actionId: string, action: 'approve' | 'reject') {
    try {
      const res = await fetch(`/api/admin-v2/email/actions/${actionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      setStatusMessage(data.message || (action === 'approve' ? 'Angewendet' : 'Abgelehnt'));
      loadData();
    } catch (err: any) {
      setStatusMessage(`Fehler: ${err.message}`);
    }
  }

  // IMAP-Verbindung testen
  async function handleTestConnection() {
    setStatusMessage('Teste IMAP-Verbindung...');
    try {
      const res = await fetch('/api/admin-v2/email/test-connection');
      const data = await res.json();
      if (data.success) {
        setStatusMessage(`Alle ${data.accounts.length} Verbindungen OK`);
      } else {
        const failed = data.accounts.filter((a: any) => a.status !== 'ok');
        setStatusMessage(`Fehler bei: ${failed.map((a: any) => a.account).join(', ')}`);
      }
    } catch (err: any) {
      setStatusMessage(`Fehler: ${err.message}`);
    }
  }

  // ============================================
  // SETUP-SEITE
  // ============================================

  if (setupNeeded) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">📧 KI-E-Mail-Hub einrichten</h1>
        <p className="text-gray-600 mb-6">
          Der E-Mail-Hub muss zuerst initialisiert werden. Das erstellt die nötigen Datenbanktabellen.
        </p>
        <div className="space-y-4">
          <button onClick={initSchema} className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 font-medium">
            Datenbank-Schema erstellen
          </button>
          <button onClick={handleTestConnection} className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium ml-3">
            IMAP-Verbindung testen
          </button>
          {statusMessage && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg text-blue-800 text-sm">
              {statusMessage}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ============================================
  // HAUPT-UI
  // ============================================

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📧 KI-E-Mail-Hub</h1>
          <p className="text-sm text-gray-500 mt-1">
            Alle E-Mails, KI-analysiert mit vorgeschlagenen CRM-Aktionen
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleIngest}
            disabled={ingesting}
            className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 text-sm font-medium"
          >
            {ingesting ? '📥 Lädt...' : '📥 E-Mails abrufen'}
          </button>
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm font-medium"
          >
            {analyzing ? '🤖 Analysiert...' : '🤖 KI-Analyse'}
          </button>
        </div>
      </div>

      {/* Status */}
      {statusMessage && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg text-blue-800 text-sm flex justify-between items-center">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage('')} className="text-blue-400 hover:text-blue-600">&times;</button>
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
          <StatCard label="Gesamt" value={stats.total} />
          <StatCard label="Ungelesen" value={stats.unread} color="blue" />
          <StatCard label="Analyse ausstehend" value={stats.pending_analysis} color="orange" />
          <StatCard label="Dringend" value={stats.urgent} color="red" />
          <StatCard label="Sponsoring" value={stats.sponsoring} color="yellow" />
          <StatCard label="Booking" value={stats.booking} color="purple" />
          <StatCard label="Partnerschaft" value={stats.partnership} color="blue" />
          <StatCard label="Medien" value={stats.media} color="pink" />
        </div>
      )}

      {/* Vorgeschlagene Aktionen */}
      {actions.length > 0 && (
        <div className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4">
          <h2 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
            🤖 KI-Vorschläge ({actions.length} offene Aktionen)
          </h2>
          <div className="space-y-2">
            {actions.slice(0, 10).map((action) => {
              const meta = ACTION_LABELS[action.action_type] || { label: action.action_type, icon: '❓' };
              return (
                <div key={action.id} className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-lg">{meta.icon}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{meta.label}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {action.email_from_name || action.email_from} – {action.email_subject}
                      </p>
                      {action.is_research && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">🔍 Research</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-3">
                    <button
                      onClick={() => handleAction(action.id, 'approve')}
                      className="px-3 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700"
                    >
                      ✓ Anwenden
                    </button>
                    <button
                      onClick={() => handleAction(action.id, 'reject')}
                      className="px-3 py-1 bg-gray-200 text-gray-600 rounded text-xs font-medium hover:bg-gray-300"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex flex-wrap gap-3 mb-4">
        <select
          value={filter.account}
          onChange={(e) => setFilter({ ...filter, account: e.target.value })}
          className="px-3 py-2 border rounded-lg text-sm text-gray-700"
        >
          <option value="">Alle Accounts</option>
          <option value="info@inclusions.zone">info@</option>
          <option value="reto@inclusions.zone">reto@</option>
          <option value="roland@inclusions.zone">roland@</option>
        </select>
        <select
          value={filter.classification}
          onChange={(e) => setFilter({ ...filter, classification: e.target.value })}
          className="px-3 py-2 border rounded-lg text-sm text-gray-700"
        >
          <option value="">Alle Kategorien</option>
          {Object.entries(CLASSIFICATION_LABELS).map(([key, { label, icon }]) => (
            <option key={key} value={key}>{icon} {label}</option>
          ))}
        </select>
        <select
          value={filter.urgency}
          onChange={(e) => setFilter({ ...filter, urgency: e.target.value })}
          className="px-3 py-2 border rounded-lg text-sm text-gray-700"
        >
          <option value="">Alle Prioritäten</option>
          <option value="critical">🔴 Kritisch</option>
          <option value="high">🟠 Dringend</option>
          <option value="medium">🟡 Mittel</option>
          <option value="normal">⚪ Normal</option>
        </select>
        <input
          type="search"
          placeholder="Suche nach Betreff, Absender..."
          value={filter.search}
          onChange={(e) => setFilter({ ...filter, search: e.target.value })}
          className="px-3 py-2 border rounded-lg text-sm flex-1 min-w-[200px] text-gray-700"
        />
      </div>

      {/* E-Mail-Liste */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Laden...</div>
      ) : emails.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg mb-2">Noch keine E-Mails</p>
          <p className="text-gray-400 text-sm">Klicke &quot;E-Mails abrufen&quot; um zu starten.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border shadow-sm divide-y">
          {emails.map((email) => {
            const cls = CLASSIFICATION_LABELS[email.ai_classification] || CLASSIFICATION_LABELS.general;
            const urg = URGENCY_LABELS[email.ai_urgency] || URGENCY_LABELS.normal;
            const accountShort = email.account.split('@')[0];
            const isSelected = selectedEmail === email.id;

            return (
              <div
                key={email.id}
                className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                  !email.is_read ? 'bg-blue-50/30' : ''
                } ${isSelected ? 'bg-purple-50' : ''}`}
                onClick={() => setSelectedEmail(isSelected ? null : email.id)}
              >
                <div className="flex items-center gap-3">
                  {/* Urgency Indicator */}
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    email.ai_urgency === 'critical' ? 'bg-red-600' :
                    email.ai_urgency === 'high' ? 'bg-red-400' :
                    email.ai_urgency === 'medium' ? 'bg-orange-400' :
                    'bg-gray-300'
                  }`} />

                  {/* Account Badge */}
                  <span className={`text-xs px-1.5 py-0.5 rounded flex-shrink-0 ${
                    accountShort === 'info' ? 'bg-blue-100 text-blue-700' :
                    accountShort === 'reto' ? 'bg-green-100 text-green-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {accountShort}
                  </span>

                  {/* Absender */}
                  <div className="w-36 flex-shrink-0 truncate">
                    <span className={`text-sm ${!email.is_read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                      {email.from_name || email.from_email}
                    </span>
                  </div>

                  {/* Betreff + Summary */}
                  <div className="flex-1 min-w-0">
                    <span className={`text-sm ${!email.is_read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                      {email.subject}
                    </span>
                    {email.ai_summary && (
                      <span className="text-xs text-gray-400 ml-2">– {email.ai_summary}</span>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {email.ai_classification && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${cls.color}`}>
                        {cls.icon} {cls.label}
                      </span>
                    )}
                    {email.ai_urgency && email.ai_urgency !== 'normal' && email.ai_urgency !== 'low' && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${urg.color}`}>
                        {urg.label}
                      </span>
                    )}
                    {parseInt(String(email.pending_actions)) > 0 && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                        {email.pending_actions} Aktionen
                      </span>
                    )}
                    {email.has_attachments && <span className="text-gray-400">📎</span>}
                  </div>

                  {/* Datum */}
                  <span className="text-xs text-gray-400 flex-shrink-0 w-20 text-right">
                    {formatDate(email.received_at)}
                  </span>
                </div>

                {/* Expanded Detail */}
                {isSelected && email.ai_summary && (
                  <div className="mt-3 pl-8 pr-4 pb-2">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-700 mb-2"><strong>KI-Zusammenfassung:</strong> {email.ai_summary}</p>
                      {email.ai_status === 'pending' && (
                        <p className="text-xs text-orange-600">⏳ Analyse ausstehend – klicke &quot;KI-Analyse&quot;</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================
// HILFSKOMPONENTEN
// ============================================

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
  const colorClass = {
    blue: 'bg-blue-50 text-blue-700',
    red: 'bg-red-50 text-red-700',
    orange: 'bg-orange-50 text-orange-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    purple: 'bg-purple-50 text-purple-700',
    pink: 'bg-pink-50 text-pink-700',
    green: 'bg-green-50 text-green-700',
  }[color || ''] || 'bg-gray-50 text-gray-700';

  return (
    <div className={`rounded-lg p-3 text-center ${colorClass}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs mt-0.5">{label}</p>
    </div>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return date.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' });
  } else if (days === 1) {
    return 'Gestern';
  } else if (days < 7) {
    return date.toLocaleDateString('de-CH', { weekday: 'short' });
  } else {
    return date.toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit' });
  }
}
