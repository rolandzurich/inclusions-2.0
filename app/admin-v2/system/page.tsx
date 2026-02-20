'use client';

import { useState, useEffect, useCallback } from 'react';

interface Migration {
  name: string;
  number: number;
  status: 'pending' | 'executed' | 'error';
  executed_at?: string;
}

interface MigrationResult {
  name: string;
  success: boolean;
  message: string;
  duration_ms: number;
}

interface Backup {
  name: string;
  created_at: string;
  size_kb: number;
  trigger: string;
}

interface Summary {
  total: number;
  executed: number;
  pending: number;
  errors: number;
}

export default function SystemPage() {
  const [migrations, setMigrations] = useState<Migration[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<MigrationResult[] | null>(null);
  const [backups, setBackups] = useState<Backup[]>([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'info' | 'success' | 'error'>('info');

  const loadMigrations = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin-v2/migrations');
      const data = await res.json();
      if (data.migrations) {
        setMigrations(data.migrations);
        setSummary(data.summary);
        setBackups(data.backups || []);
      }
    } catch (err: any) {
      setMessage(`Fehler beim Laden: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMigrations();
  }, [loadMigrations]);

  function showMessage(text: string, type: 'info' | 'success' | 'error' = 'info') {
    setMessage(text);
    setMessageType(type);
  }

  async function handleDryRun() {
    setRunning(true);
    setResults(null);
    setMessage('');
    try {
      const res = await fetch('/api/admin-v2/migrations?dry_run=true', { method: 'POST' });
      const data = await res.json();
      setResults(data.results);
      showMessage(data.message, 'info');
    } catch (err: any) {
      showMessage(`Fehler: ${err.message}`, 'error');
    } finally {
      setRunning(false);
    }
  }

  async function handleRun() {
    if (!confirm('Migrationen wirklich ausführen? Ein automatisches Backup wird vorher erstellt.')) return;
    setRunning(true);
    setResults(null);
    setMessage('');
    try {
      const res = await fetch('/api/admin-v2/migrations', { method: 'POST' });
      const data = await res.json();
      setResults(data.results);
      showMessage(data.message, data.success ? 'success' : 'error');
      await loadMigrations();
    } catch (err: any) {
      showMessage(`Fehler: ${err.message}`, 'error');
    } finally {
      setRunning(false);
    }
  }

  async function handleRollback() {
    const lastExecuted = migrations.filter(m => m.status === 'executed').pop();
    if (!lastExecuted) return;
    
    if (!confirm(
      `Letzte Migration "${lastExecuted.name}" wirklich rückgängig machen?\n\n` +
      `Ein automatisches Backup wird vorher erstellt.`
    )) return;
    
    setRunning(true);
    setResults(null);
    setMessage('');
    try {
      const res = await fetch('/api/admin-v2/migrations?action=rollback', { method: 'POST' });
      const data = await res.json();
      showMessage(
        data.message + (data.backup ? ` (Backup: ${data.backup.name})` : ''),
        data.success ? 'success' : 'error'
      );
      await loadMigrations();
    } catch (err: any) {
      showMessage(`Rollback-Fehler: ${err.message}`, 'error');
    } finally {
      setRunning(false);
    }
  }

  async function handleBackup() {
    setRunning(true);
    setMessage('');
    try {
      const res = await fetch('/api/admin-v2/migrations?action=backup', { method: 'POST' });
      const data = await res.json();
      showMessage(data.message, data.success ? 'success' : 'error');
      await loadMigrations();
    } catch (err: any) {
      showMessage(`Backup-Fehler: ${err.message}`, 'error');
    } finally {
      setRunning(false);
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString('de-CH', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  const statusIcon = (status: string) => {
    switch (status) {
      case 'executed': return '✅';
      case 'pending': return '⏳';
      case 'error': return '❌';
      default: return '❓';
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'executed': return 'text-green-600 bg-green-50';
      case 'pending': return 'text-amber-600 bg-amber-50';
      case 'error': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">System & Datenbank</h1>
        <p className="text-sm text-gray-500 mt-1">
          Datenbank-Migrationen verwalten und Systemstatus prüfen
        </p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-lg border p-4">
            <p className="text-2xl font-bold text-gray-900">{summary.total}</p>
            <p className="text-xs text-gray-500">Gesamt</p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <p className="text-2xl font-bold text-green-600">{summary.executed}</p>
            <p className="text-xs text-gray-500">Ausgeführt</p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <p className="text-2xl font-bold text-amber-600">{summary.pending}</p>
            <p className="text-xs text-gray-500">Ausstehend</p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <p className="text-2xl font-bold text-red-600">{summary.errors}</p>
            <p className="text-xs text-gray-500">Fehler</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="bg-white rounded-lg border p-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleDryRun}
            disabled={running || !summary?.pending}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {running ? '⏳ Läuft...' : '🔍 Dry Run'}
          </button>
          <button
            onClick={handleRun}
            disabled={running || !summary?.pending}
            className="px-4 py-2 text-sm bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {running ? '⏳ Läuft...' : '▶️ Migrationen ausführen'}
          </button>
          
          <div className="w-px h-6 bg-gray-200" />
          
          <button
            onClick={handleRollback}
            disabled={running || !summary?.executed}
            className="px-4 py-2 text-sm bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Letzte Migration rückgängig machen"
          >
            ⏪ Rollback
          </button>
          <button
            onClick={handleBackup}
            disabled={running}
            className="px-4 py-2 text-sm bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            💾 Backup erstellen
          </button>
          <button
            onClick={loadMigrations}
            disabled={loading}
            className="px-4 py-2 text-sm bg-white border text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            🔄
          </button>
          {summary?.pending === 0 && (
            <span className="text-xs text-green-600 ml-2">Alle Migrationen aktuell</span>
          )}
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`rounded-lg p-3 mb-4 text-sm border ${
          messageType === 'success' ? 'bg-green-50 border-green-200 text-green-700' :
          messageType === 'error' ? 'bg-red-50 border-red-200 text-red-700' :
          'bg-blue-50 border-blue-200 text-blue-700'
        }`}>
          {messageType === 'success' && '✅ '}
          {messageType === 'error' && '❌ '}
          {message}
        </div>
      )}

      {/* Results */}
      {results && results.length > 0 && (
        <div className="bg-white rounded-lg border mb-6 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b">
            <h3 className="text-sm font-semibold text-gray-700">Ergebnis</h3>
          </div>
          <div className="divide-y">
            {results.map((r) => (
              <div key={r.name} className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-base">{r.success ? '✅' : '❌'}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{r.name}</p>
                    <p className="text-xs text-gray-500">{r.message}</p>
                  </div>
                </div>
                {r.duration_ms > 0 && (
                  <span className="text-xs text-gray-400">{r.duration_ms}ms</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Migrations List */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b">
          <h3 className="text-sm font-semibold text-gray-700">Migrationen</h3>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Laden...</div>
        ) : migrations.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            Keine Migrationen gefunden. Stellen Sie sicher, dass der Ordner <code className="bg-gray-100 px-1 rounded">backend/migrations/</code> existiert.
          </div>
        ) : (
          <div className="divide-y">
            {migrations.map((m) => (
              <div key={m.name} className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-base">{statusIcon(m.status)}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900 font-mono">{m.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(m.status)}`}>
                    {m.status === 'executed' ? 'Ausgeführt' : m.status === 'pending' ? 'Ausstehend' : 'Fehler'}
                  </span>
                  {m.executed_at && (
                    <span className="text-xs text-gray-400">
                      {formatDate(m.executed_at)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Backups */}
      {backups.length > 0 && (
        <div className="bg-white rounded-lg border overflow-hidden mt-6">
          <div className="px-4 py-3 bg-gray-50 border-b flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">Backups</h3>
            <span className="text-xs text-gray-400">{backups.length} verfügbar</span>
          </div>
          <div className="divide-y">
            {backups.slice(0, 5).map((b) => (
              <div key={b.name} className="px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-base">💾</span>
                  <div>
                    <p className="text-xs font-medium text-gray-900 font-mono">{b.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    b.trigger === 'auto-migration' ? 'text-blue-600 bg-blue-50' :
                    b.trigger === 'auto-rollback' ? 'text-amber-600 bg-amber-50' :
                    'text-gray-600 bg-gray-50'
                  }`}>
                    {b.trigger === 'auto-migration' ? 'Vor Migration' :
                     b.trigger === 'auto-rollback' ? 'Vor Rollback' :
                     'Manuell'}
                  </span>
                  <span className="text-xs text-gray-400">{b.size_kb} KB</span>
                  <span className="text-xs text-gray-400">{formatDate(b.created_at)}</span>
                </div>
              </div>
            ))}
            {backups.length > 5 && (
              <div className="px-4 py-2 text-xs text-gray-400 text-center">
                + {backups.length - 5} weitere Backups
              </div>
            )}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 bg-gray-50 rounded-lg border p-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Sicherheitskonzept</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div className="text-xs text-gray-600">
            <p className="font-medium text-gray-700 mb-1">Vor Migration</p>
            <p>Automatisches Backup der gesamten DB wird erstellt, bevor Änderungen laufen.</p>
          </div>
          <div className="text-xs text-gray-600">
            <p className="font-medium text-gray-700 mb-1">Bei Fehler</p>
            <p>Migrationen stoppen sofort beim ersten Fehler. Keine halb-ausgeführten Änderungen.</p>
          </div>
          <div className="text-xs text-gray-600">
            <p className="font-medium text-gray-700 mb-1">Rollback</p>
            <p>Jede Migration hat eine DOWN-Datei, die sie rückgängig macht. Backup wird vorher erstellt.</p>
          </div>
        </div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Workflow</h4>
        <ol className="text-xs text-gray-600 space-y-1.5 list-decimal list-inside">
          <li>Neue Migration erstellen: <code className="bg-gray-100 px-1 rounded">backend/migrations/003_feature_name.sql</code></li>
          <li>DOWN-Datei erstellen: <code className="bg-gray-100 px-1 rounded">backend/migrations/003_feature_name.down.sql</code></li>
          <li>Lokal testen mit <strong>Dry Run</strong></li>
          <li>Code committen und deployen</li>
          <li>Auf dem Server <strong>Migrationen ausführen</strong> (Backup wird automatisch erstellt)</li>
        </ol>
      </div>
    </div>
  );
}
