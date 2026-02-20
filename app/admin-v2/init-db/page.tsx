'use client';

import { useState, useEffect } from 'react';

interface InitStatus {
  connection?: {
    success: boolean;
    version?: string;
    error?: string;
  };
  tables?: {
    success: boolean;
    tables: string[];
    error?: string;
  };
  ready?: boolean;
}

interface InitResult {
  success: boolean;
  message?: string;
  tables?: string[];
  executedStatements?: number;
  error?: string;
  details?: any;
}

export default function InitDbPage() {
  const [status, setStatus] = useState<InitStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InitResult | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);

  // Status beim Laden prüfen
  useEffect(() => {
    checkStatus();
  }, []);

  async function checkStatus() {
    setCheckingStatus(true);
    try {
      const res = await fetch('/api/admin-v2/init-db');
      const data = await res.json();
      setStatus(data);
    } catch (error) {
      console.error('Status-Check fehlgeschlagen:', error);
    } finally {
      setCheckingStatus(false);
    }
  }

  async function initializeDatabase() {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/admin-v2/init-db', {
        method: 'POST',
      });
      const data = await res.json();
      setResult(data);

      if (data.success) {
        // Status neu laden
        await checkStatus();
      }
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Datenbank-Initialisierung
        </h1>
        <p className="mt-2 text-gray-600">
          Erstelle die Admin-V2 Tabellen in der PostgreSQL-Datenbank
        </p>
      </div>

      {/* Status Check */}
      {checkingStatus ? (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-4"></div>
            <span className="text-gray-600">Prüfe Verbindung...</span>
          </div>
        </div>
      ) : status ? (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Aktueller Status
          </h2>

          {/* Verbindung */}
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <span className="mr-2">
                {status.connection?.success ? '✅' : '❌'}
              </span>
              <span className="font-medium">Datenbankverbindung</span>
            </div>
            {status.connection?.success ? (
              <div className="ml-6 text-sm text-gray-600">
                <p>{status.connection.version}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Host: {process.env.NEXT_PUBLIC_DB_HOST || 'localhost'}
                </p>
              </div>
            ) : (
              <div className="ml-6 text-sm text-red-600">
                {status.connection?.error}
              </div>
            )}
          </div>

          {/* Tabellen */}
          <div>
            <div className="flex items-center mb-2">
              <span className="mr-2">
                {status.tables && status.tables.tables.length > 0 ? '✅' : '⏳'}
              </span>
              <span className="font-medium">Tabellen</span>
            </div>
            {status.tables && status.tables.tables.length > 0 ? (
              <div className="ml-6 text-sm">
                <p className="text-green-600 font-medium mb-2">
                  {status.tables.tables.length} Tabellen gefunden
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {status.tables.tables.map((table) => (
                    <div
                      key={table}
                      className="px-3 py-1 bg-green-50 text-green-700 rounded text-xs"
                    >
                      {table}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="ml-6 text-sm text-gray-600">
                Noch keine Tabellen vorhanden
              </div>
            )}
          </div>

          {/* Ready Status */}
          {status.ready && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">
                ✅ Datenbank ist bereit!
              </p>
              <p className="text-sm text-green-700 mt-1">
                Du kannst diese Seite jetzt löschen und mit dem Dashboard fortfahren.
              </p>
            </div>
          )}
        </div>
      ) : null}

      {/* Initialisierungs-Button */}
      {status && !status.ready && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">
            Schema initialisieren
          </h2>
          <p className="text-blue-800 mb-6">
            Dieser Vorgang erstellt alle benötigten Tabellen für Admin-V2:
          </p>
          <ul className="text-sm text-blue-800 space-y-1 mb-6 ml-4">
            <li>• companies, contacts, deals (CRM)</li>
            <li>• projects, project_tasks (Projektmanagement)</li>
            <li>• events_v2, event_rsvps (Kalender)</li>
            <li>• journal_entries (Buchhaltung)</li>
          </ul>
          <button
            onClick={initializeDatabase}
            disabled={loading || !status.connection?.success}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Initialisiere...
              </span>
            ) : (
              '🚀 Datenbank jetzt initialisieren'
            )}
          </button>
        </div>
      )}

      {/* Ergebnis */}
      {result && (
        <div
          className={`p-6 rounded-lg border ${
            result.success
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}
        >
          <div className="flex items-start">
            <span className="text-3xl mr-4">
              {result.success ? '🎉' : '❌'}
            </span>
            <div className="flex-1">
              <h3
                className={`text-lg font-semibold mb-2 ${
                  result.success ? 'text-green-900' : 'text-red-900'
                }`}
              >
                {result.success ? 'Erfolgreich!' : 'Fehler'}
              </h3>
              <p
                className={`mb-4 ${
                  result.success ? 'text-green-800' : 'text-red-800'
                }`}
              >
                {result.success ? result.message : result.error}
              </p>

              {result.success && result.tables && (
                <div>
                  <p className="font-medium text-green-900 mb-2">
                    {result.tables.length} Tabellen erstellt:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {result.tables.map((table) => (
                      <div
                        key={table}
                        className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm"
                      >
                        ✓ {table}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-green-700 mt-4">
                    {result.executedStatements} SQL-Statements ausgeführt
                  </p>
                </div>
              )}

              {result.success && (
                <div className="mt-6 pt-4 border-t border-green-200">
                  <p className="text-green-800 font-medium mb-2">
                    Nächste Schritte:
                  </p>
                  <ol className="text-sm text-green-700 space-y-1 ml-4">
                    <li>1. Gehe zum Dashboard: <a href="/admin-v2/dashboard" className="underline">Admin-V2 Dashboard</a></li>
                    <li>2. Diese Seite kann gelöscht werden (optional)</li>
                    <li>3. Beginne mit dem Hinzufügen von Daten</li>
                  </ol>
                </div>
              )}
            </div>
          </div>

          {/* Details (zum Debuggen) */}
          {result.details && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900">
                Technische Details anzeigen
              </summary>
              <pre className="mt-2 p-4 bg-white rounded text-xs overflow-auto max-h-96">
                {JSON.stringify(result.details, null, 2)}
              </pre>
            </details>
          )}
        </div>
      )}

      {/* Warnung */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          ⚠️ <strong>Hinweis:</strong> Diese Seite ist nur für die initiale
          Einrichtung gedacht. Nach erfolgreicher Initialisierung kannst du sie
          löschen.
        </p>
      </div>

      {/* Refresh Button */}
      <div className="text-center">
        <button
          onClick={checkStatus}
          disabled={checkingStatus}
          className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
        >
          {checkingStatus ? 'Lädt...' : '🔄 Status aktualisieren'}
        </button>
      </div>
    </div>
  );
}
