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
  result_type?: string;
  result_id?: string;
  research_source?: string;
  applied_at?: string;
  email_subject?: string;
  email_from?: string;
  email_from_name?: string;
}

interface EmailDetail extends Email {
  to_email?: string;
  cc?: string;
  body_text?: string;
  body_html?: string;
  ai_analysis?: any;
  notes?: string;
  web_research?: any;
  attachment_info?: any;
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
  const [emailActionsById, setEmailActionsById] = useState<Record<string, EmailAction[]>>({});
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [ingesting, setIngesting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [actionLoadingIds, setActionLoadingIds] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState({ account: '', classification: '', urgency: '', search: '' });
  const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'unprocessed' | 'analyzed' | 'pending'>('all');
  const [workflowView, setWorkflowView] = useState<'all' | 'triage' | 'decisions' | 'followup'>('all');
  const [showAdvancedActions, setShowAdvancedActions] = useState(false);
  const [showAllSuggestions, setShowAllSuggestions] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [selectedEmailDetail, setSelectedEmailDetail] = useState<EmailDetail | null>(null);
  const [setupNeeded, setSetupNeeded] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  function resetQuickFilters(nextStatus: 'all' | 'unread' | 'unprocessed' | 'analyzed' | 'pending' = 'all') {
    setStatusFilter(nextStatus);
    setFilter((prev) => ({ ...prev, classification: '', urgency: '' }));
  }

  function applyWorkflowPreset(view: 'all' | 'triage' | 'decisions' | 'followup') {
    setWorkflowView(view);
    if (view === 'triage') {
      setStatusFilter('unread');
      setFilter((prev) => ({ ...prev, urgency: 'high', classification: '' }));
      return;
    }
    if (view === 'decisions') {
      setStatusFilter('unprocessed');
      setFilter((prev) => ({ ...prev, urgency: '', classification: '' }));
      return;
    }
    if (view === 'followup') {
      setStatusFilter('analyzed');
      setFilter((prev) => ({ ...prev, urgency: '', classification: 'partnership' }));
      return;
    }
    resetQuickFilters('all');
  }

  // Daten laden
  const loadData = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filter.account) params.set('account', filter.account);
      if (filter.classification) params.set('classification', filter.classification);
      if (filter.urgency) params.set('urgency', filter.urgency);
      if (filter.search) params.set('search', filter.search);
      if (statusFilter !== 'all') params.set('status', statusFilter);

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
        setStatusMessage(`E-Mail-Daten konnten nicht geladen werden: ${err.error || 'Unbekannter Fehler'}`);
        setEmails([]);
        setStats(null);
        setActions([]);
        return;
      }

      const emailData = await emailRes.json();
      const actionData = await actionRes.json();

      setEmails(emailData.emails || []);
      setStats(emailData.stats || null);
      setActions(actionData.actions || []);
      setEmailActionsById({});
      setSetupNeeded(false);
    } catch {
      setSetupNeeded(true);
    } finally {
      setLoading(false);
    }
  }, [filter, statusFilter]);

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

  // Sync: Abrufen + Analyse in einem Schritt
  async function handleSync() {
    setSyncing(true);
    setStatusMessage('Synchronisiere Postfächer und starte KI-Analyse...');
    try {
      const res = await fetch('/api/admin-v2/email/sync?days=14&limit=30', { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        const accountErrors = (data.ingest?.accounts || [])
          .filter((row: any) => row.error)
          .map((row: any) => `${row.account}: ${row.error}`)
          .slice(0, 2);
        const details = accountErrors.length > 0 ? ` (${accountErrors.join(' | ')})` : '';
        throw new Error((data.error || data.message || 'Sync fehlgeschlagen') + details);
      }
      setStatusMessage(
        data.message ||
          `Sync fertig: ${data.ingest?.saved || 0} neue Mails, ${data.analyze?.analyzed || 0} analysiert`
      );
      loadData();
    } catch (err: any) {
      setStatusMessage(`Fehler: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  }

  // E-Mail-Detail laden (inkl. Aktionen) und als gelesen markieren
  async function loadEmailDetail(emailId: string) {
    try {
      const res = await fetch(`/api/admin-v2/email/${emailId}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Details konnten nicht geladen werden');
      }

      setSelectedEmailDetail(data.email || null);
      const detailActions: EmailAction[] = data.actions || [];
      setEmailActionsById((prev) => ({ ...prev, [emailId]: detailActions }));

      // Lokalen Read-Status direkt synchron halten
      setEmails((prev) =>
        prev.map((email) => (email.id === emailId ? { ...email, is_read: true } : email))
      );
      setStats((prev) =>
        prev
          ? {
              ...prev,
              unread: Math.max(
                0,
                prev.unread - (emails.find((e) => e.id === emailId && !e.is_read) ? 1 : 0)
              ),
            }
          : prev
      );
    } catch (err: any) {
      setStatusMessage(`Fehler: ${err.message}`);
    }
  }

  async function handleSelectEmail(emailId: string) {
    const isSame = selectedEmail === emailId;
    if (isSame) {
      setSelectedEmail(null);
      setSelectedEmailDetail(null);
      return;
    }

    setSelectedEmail(emailId);
    setSelectedEmailDetail(null);
    await loadEmailDetail(emailId);
  }

  // Aktion bestätigen/ablehnen
  async function handleAction(actionId: string, action: 'approve' | 'reject') {
    setActionLoadingIds((prev) => new Set(prev).add(actionId));
    try {
      const res = await fetch(`/api/admin-v2/email/actions/${actionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Aktion konnte nicht verarbeitet werden');
      }
      setStatusMessage(data.message || (action === 'approve' ? 'Angewendet' : 'Abgelehnt'));
      if (selectedEmail) {
        await loadEmailDetail(selectedEmail);
      }
      loadData();
    } catch (err: any) {
      setStatusMessage(`Fehler: ${err.message}`);
    } finally {
      setActionLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(actionId);
        return next;
      });
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

  function getActionPreview(action: EmailAction): string {
    const data = action.action_data || {};
    switch (action.action_type) {
      case 'create_company':
        return `Erstellt Unternehmen: ${data.name || data.organization || 'ohne Namen'}`;
      case 'create_contact':
        return `Erstellt Kontakt: ${[data.first_name, data.last_name].filter(Boolean).join(' ') || data.email || 'ohne Namen'}`;
      case 'update_contact':
        return `Aktualisiert Kontakt: ${data.email || 'bestehender Kontakt'}`;
      case 'create_deal':
        return `Erstellt Deal: ${data.title || 'Neuer Deal'}`;
      case 'create_project':
        return `Erstellt Projekt: ${data.title || data.name || 'Neues Projekt'}`;
      case 'create_booking':
        return `Erstellt Booking-Lead: ${data.booking_item || data.item || data.event_type || 'Anfrage'}`;
      case 'create_vip':
        return `Erstellt VIP-Anmeldung: ${data.name || data.email || 'Neuer VIP Kontakt'}`;
      case 'add_note':
        return `Fügt Notiz hinzu: ${data.note || data.reason || 'Interne Notiz'}`;
      case 'web_research':
        return `Startet Recherche: ${data.query || data.web_research_query || 'Organisation prüfen'}`;
      default:
        return 'Führt vorgeschlagene CRM-Aktion aus';
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
        <div className="flex items-center gap-2">
          <button
            onClick={handleSync}
            disabled={syncing || ingesting || analyzing}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium shadow-sm"
          >
            {syncing ? '⚡ Synchronisiert...' : '⚡ Synchronisieren'}
          </button>
          <button
            onClick={() => setShowAdvancedActions((prev) => !prev)}
            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
          >
            {showAdvancedActions ? 'Weniger' : 'Erweitert'}
          </button>
        </div>
      </div>
      {showAdvancedActions && (
        <div className="mb-5 flex flex-wrap gap-2">
          <button
            onClick={handleIngest}
            disabled={ingesting || syncing}
            className="px-3 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 text-sm font-medium"
          >
            {ingesting ? '📥 Lädt...' : '📥 E-Mails abrufen'}
          </button>
          <button
            onClick={handleAnalyze}
            disabled={analyzing || syncing}
            className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm font-medium"
          >
            {analyzing ? '🤖 Analysiert...' : '🤖 KI-Analyse'}
          </button>
          <button
            onClick={handleTestConnection}
            className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium"
          >
            IMAP testen
          </button>
        </div>
      )}

      {/* Status */}
      {statusMessage && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg text-blue-800 text-sm flex justify-between items-center">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage('')} className="text-blue-400 hover:text-blue-600">&times;</button>
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-3">
          <StatCard
            label="Gesamt"
            value={stats.total}
            active={statusFilter === 'all'}
            onClick={() => resetQuickFilters('all')}
            hint="Zeigt alle E-Mails"
          />
          <StatCard
            label="Ungelesen"
            value={stats.unread}
            color="blue"
            active={statusFilter === 'unread'}
            onClick={() => resetQuickFilters('unread')}
            hint="Nur ungelesene E-Mails"
          />
          <StatCard
            label="Analyse ausstehend"
            value={stats.pending_analysis}
            color="orange"
            active={statusFilter === 'pending'}
            onClick={() => resetQuickFilters('pending')}
            hint="KI noch nicht gelaufen"
          />
          <StatCard
            label="Dringend"
            value={stats.urgent}
            color="red"
            active={filter.urgency === 'high'}
            onClick={() => {
              setStatusFilter('all');
              setFilter((prev) => ({ ...prev, urgency: 'high', classification: '' }));
            }}
            hint="Urgency high/critical"
          />
          <StatCard
            label="Sponsoring"
            value={stats.sponsoring}
            color="yellow"
            active={filter.classification === 'sponsoring'}
            onClick={() => {
              setStatusFilter('all');
              setFilter((prev) => ({ ...prev, classification: 'sponsoring', urgency: '' }));
            }}
            hint="Nur Sponsoring-Anfragen"
          />
          <StatCard
            label="Booking"
            value={stats.booking}
            color="purple"
            active={filter.classification === 'booking'}
            onClick={() => {
              setStatusFilter('all');
              setFilter((prev) => ({ ...prev, classification: 'booking', urgency: '' }));
            }}
            hint="Nur Booking-Anfragen"
          />
          <StatCard
            label="Partnerschaft"
            value={stats.partnership}
            color="blue"
            active={filter.classification === 'partnership'}
            onClick={() => {
              setStatusFilter('all');
              setFilter((prev) => ({ ...prev, classification: 'partnership', urgency: '' }));
            }}
            hint="Nur Partnerschaftsanfragen"
          />
          <StatCard
            label="Medien"
            value={stats.media}
            color="pink"
            active={filter.classification === 'media'}
            onClick={() => {
              setStatusFilter('all');
              setFilter((prev) => ({ ...prev, classification: 'media', urgency: '' }));
            }}
            hint="Nur Medienanfragen"
          />
        </div>
      )}
      <div className="mb-3 flex items-center gap-2 text-xs text-gray-500">
        <span>Arbeitsansicht:</span>
        <button
          onClick={() => applyWorkflowPreset('all')}
          className={`px-2 py-1 rounded ${workflowView === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          Alles
        </button>
        <button
          onClick={() => applyWorkflowPreset('triage')}
          className={`px-2 py-1 rounded ${workflowView === 'triage' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          Inbox Triage
        </button>
        <button
          onClick={() => applyWorkflowPreset('decisions')}
          className={`px-2 py-1 rounded ${workflowView === 'decisions' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          KI Entscheidungen
        </button>
        <button
          onClick={() => applyWorkflowPreset('followup')}
          className={`px-2 py-1 rounded ${workflowView === 'followup' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          Follow-up
        </button>
      </div>

      {/* Vorgeschlagene Aktionen */}
      {actions.length > 0 && (
        <div className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4">
          <h2 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
            🤖 KI-Vorschläge ({actions.length} offene Aktionen)
          </h2>
          <p className="text-xs text-purple-700 mb-3">
            Klick auf einen Vorschlag öffnet die zugehörige E-Mail mit vollem Kontext.
          </p>
          <div className="space-y-2">
            {(showAllSuggestions ? actions : actions.slice(0, 5)).map((action) => {
              const meta = ACTION_LABELS[action.action_type] || { label: action.action_type, icon: '❓' };
              const isBusy = actionLoadingIds.has(action.id);
              return (
                <div
                  key={action.id}
                  className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm border border-transparent hover:border-purple-200 transition-colors cursor-pointer"
                  onClick={() => handleSelectEmail(action.email_id)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-lg">{meta.icon}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{meta.label}</p>
                      <p className="text-xs text-gray-700 truncate">{getActionPreview(action)}</p>
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
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAction(action.id, 'approve');
                      }}
                      disabled={isBusy}
                      className="px-3 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 disabled:opacity-50"
                    >
                      {isBusy ? '...' : '✓ Anwenden'}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAction(action.id, 'reject');
                      }}
                      disabled={isBusy}
                      className="px-3 py-1 bg-gray-200 text-gray-600 rounded text-xs font-medium hover:bg-gray-300 disabled:opacity-50"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          {actions.length > 5 && (
            <div className="mt-3">
              <button
                onClick={() => setShowAllSuggestions((prev) => !prev)}
                className="text-xs text-purple-700 hover:text-purple-900 font-medium"
              >
                {showAllSuggestions ? 'Weniger anzeigen' : `Weitere ${actions.length - 5} Vorschläge anzeigen`}
              </button>
            </div>
          )}
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
          <p className="text-gray-400 text-sm">Klicke &quot;Synchronisieren&quot; um Abruf und KI-Analyse zu starten.</p>
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
                onClick={() => handleSelectEmail(email.id)}
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
                {isSelected && (
                  <div className="mt-3 pl-8 pr-4 pb-2">
                    <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                      {selectedEmailDetail?.id === email.id ? (
                        <>
                          <div className="text-xs text-gray-500">
                            <span className="mr-3">Von: {selectedEmailDetail.from_email}</span>
                            {selectedEmailDetail.to_email && <span>An: {selectedEmailDetail.to_email}</span>}
                          </div>
                          <p className="text-sm text-gray-700">
                            <strong>KI-Zusammenfassung:</strong>{' '}
                            {selectedEmailDetail.ai_summary || 'Noch keine Zusammenfassung vorhanden.'}
                          </p>
                          {selectedEmailDetail.ai_analysis?.extracted?.intent && (
                            <p className="text-sm text-gray-700">
                              <strong>Intent:</strong> {selectedEmailDetail.ai_analysis.extracted.intent}
                            </p>
                          )}
                          {Array.isArray(selectedEmailDetail.ai_analysis?.extracted?.key_topics) &&
                            selectedEmailDetail.ai_analysis.extracted.key_topics.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {selectedEmailDetail.ai_analysis.extracted.key_topics.map((topic: string) => (
                                  <span key={topic} className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                                    {topic}
                                  </span>
                                ))}
                              </div>
                            )}
                          {selectedEmailDetail.body_text && (
                            <div className="bg-white border rounded p-2">
                              <p className="text-xs font-medium text-gray-600 mb-1">E-Mail-Auszug</p>
                              <p className="text-xs text-gray-600 whitespace-pre-wrap">
                                {selectedEmailDetail.body_text.slice(0, 900)}
                                {selectedEmailDetail.body_text.length > 900 ? '…' : ''}
                              </p>
                            </div>
                          )}
                          {(emailActionsById[email.id] || []).length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-gray-600 mb-1">Aktionen zu dieser E-Mail</p>
                              <div className="space-y-1">
                                {(emailActionsById[email.id] || []).map((entry) => {
                                  const isBusy = actionLoadingIds.has(entry.id);
                                  const meta = ACTION_LABELS[entry.action_type] || { label: entry.action_type, icon: '❓' };
                                  return (
                                    <div key={entry.id} className="flex items-center justify-between bg-white border rounded px-2 py-1.5">
                                      <div className="min-w-0">
                                        <p className="text-xs font-medium text-gray-800 truncate">{meta.icon} {meta.label}</p>
                                        <p className="text-xs text-gray-600 truncate">{getActionPreview(entry)}</p>
                                        {entry.action_data?.reason && <p className="text-xs text-gray-500 truncate">{entry.action_data.reason}</p>}
                                      </div>
                                      <div className="flex items-center gap-1 ml-2">
                                        {entry.status === 'suggested' ? (
                                          <>
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleAction(entry.id, 'approve');
                                              }}
                                              disabled={isBusy}
                                              className="px-2 py-0.5 text-xs bg-green-600 text-white rounded disabled:opacity-50"
                                            >
                                              Anwenden
                                            </button>
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleAction(entry.id, 'reject');
                                              }}
                                              disabled={isBusy}
                                              className="px-2 py-0.5 text-xs bg-gray-200 text-gray-700 rounded disabled:opacity-50"
                                            >
                                              ✕
                                            </button>
                                          </>
                                        ) : (
                                          <span className="text-[11px] text-gray-500">{entry.status}</span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                          {selectedEmailDetail.ai_status === 'pending' && (
                            <p className="text-xs text-orange-600">⏳ Analyse ausstehend – klicke &quot;KI-Analyse&quot;</p>
                          )}
                        </>
                      ) : (
                        <p className="text-xs text-gray-500">Lade Details...</p>
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

function StatCard({
  label,
  value,
  color,
  onClick,
  active = false,
  hint,
}: {
  label: string;
  value: number;
  color?: string;
  onClick?: () => void;
  active?: boolean;
  hint?: string;
}) {
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
    <button
      type="button"
      onClick={onClick}
      title={hint || label}
      className={`rounded-lg p-3 text-center w-full transition-all ${colorClass} ${onClick ? 'hover:shadow-sm' : ''} ${active ? 'ring-2 ring-gray-900/25' : ''}`}
    >
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs mt-0.5">{label}</p>
    </button>
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
