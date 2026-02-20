'use client';

import { useState, useEffect } from 'react';

type Period = '24h' | '7d' | '30d' | '90d';

interface AnalyticsData {
  configured: boolean;
  period?: string;
  stats?: {
    pageviews: { value: number; change: number };
    visitors: { value: number; change: number };
    visits: { value: number; change: number };
    bounces: { value: number; change: number };
    totaltime: { value: number; change: number };
  };
  pageviews?: {
    pageviews: Array<{ x: string; y: number }>;
    sessions: Array<{ x: string; y: number }>;
  };
  topPages?: Array<{ x: string; y: number }>;
  referrers?: Array<{ x: string; y: number }>;
  browsers?: Array<{ x: string; y: number }>;
  devices?: Array<{ x: string; y: number }>;
  countries?: Array<{ x: string; y: number }>;
  activeVisitors?: Array<{ x: string }> | number;
  umamiUrl?: string;
  error?: string;
  hint?: string;
  message?: string;
  setup?: {
    steps: string[];
    envVars: Record<string, string>;
  };
}

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: '24h', label: 'Letzte 24 Stunden' },
  { value: '7d', label: 'Letzte 7 Tage' },
  { value: '30d', label: 'Letzte 30 Tage' },
  { value: '90d', label: 'Letzte 90 Tage' },
];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>('7d');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  async function fetchAnalytics() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin-v2/analytics?endpoint=all&period=${period}`);
      const json = await res.json();
      setData(json);
    } catch (error) {
      setData({
        configured: false,
        error: 'Netzwerkfehler beim Laden der Analytics',
      });
    } finally {
      setLoading(false);
    }
  }

  // Nicht konfiguriert – Setup-Anleitung
  if (!loading && data && !data.configured && !data.error) {
    return <SetupGuide data={data} />;
  }

  // Fehler beim Laden (Umami nicht erreichbar)
  if (!loading && data && data.error) {
    return <ConnectionError data={data} onRetry={fetchAnalytics} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📈 Webseiten-Traffic</h1>
          <p className="mt-2 text-gray-600">
            Besucher, Seitenaufrufe und Herkunft – datenschutzkonform via Umami
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Period Selector */}
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as Period)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
          >
            {PERIOD_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {data?.umamiUrl && (
            <a
              href={data.umamiUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Umami Dashboard ↗
            </a>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Lade Traffic-Daten...</p>
        </div>
      ) : data?.stats ? (
        <>
          {/* Active Visitors */}
          {data.activeVisitors !== undefined && data.activeVisitors !== null && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              <span className="text-green-800 font-medium">
                {typeof data.activeVisitors === 'number'
                  ? data.activeVisitors
                  : Array.isArray(data.activeVisitors)
                  ? data.activeVisitors.length
                  : 0}{' '}
                Besucher gerade online
              </span>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatCard
              label="Seitenaufrufe"
              value={data.stats.pageviews.value}
              change={data.stats.pageviews.change}
              icon="👁️"
            />
            <StatCard
              label="Besucher"
              value={data.stats.visitors.value}
              change={data.stats.visitors.change}
              icon="👤"
            />
            <StatCard
              label="Besuche"
              value={data.stats.visits.value}
              change={data.stats.visits.change}
              icon="🔄"
            />
            <StatCard
              label="Bounces"
              value={data.stats.bounces.value}
              change={data.stats.bounces.change}
              icon="↩️"
              invertChange
            />
            <StatCard
              label="Ø Verweildauer"
              value={Math.round((data.stats.totaltime.value || 0) / Math.max(data.stats.visits.value, 1))}
              change={data.stats.totaltime.change}
              icon="⏱️"
              suffix="s"
            />
          </div>

          {/* Pageviews Chart (simple bar chart) */}
          {data.pageviews && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Seitenaufrufe im Zeitverlauf
              </h2>
              <SimpleBarChart
                data={data.pageviews.pageviews || []}
                sessions={data.pageviews.sessions || []}
                period={period}
              />
            </div>
          )}

          {/* Grids */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Pages */}
            {data.topPages && data.topPages.length > 0 && (
              <MetricsList
                title="Meistbesuchte Seiten"
                icon="📄"
                items={data.topPages.slice(0, 10)}
                labelPrefix=""
              />
            )}

            {/* Referrers */}
            {data.referrers && data.referrers.length > 0 && (
              <MetricsList
                title="Herkunft (Referrer)"
                icon="🔗"
                items={data.referrers.slice(0, 10)}
                labelPrefix=""
              />
            )}

            {/* Browsers */}
            {data.browsers && data.browsers.length > 0 && (
              <MetricsList
                title="Browser"
                icon="🌐"
                items={data.browsers.slice(0, 8)}
                labelPrefix=""
              />
            )}

            {/* Devices */}
            {data.devices && data.devices.length > 0 && (
              <MetricsList
                title="Geräte"
                icon="📱"
                items={data.devices.slice(0, 8)}
                labelPrefix=""
              />
            )}

            {/* Countries */}
            {data.countries && data.countries.length > 0 && (
              <MetricsList
                title="Länder"
                icon="🌍"
                items={data.countries.slice(0, 10)}
                labelPrefix=""
              />
            )}
          </div>
        </>
      ) : (
        <NoDataYet umamiUrl={data?.umamiUrl} />
      )}
    </div>
  );
}

/* ============ Komponenten ============ */

function StatCard({
  label,
  value,
  change,
  icon,
  suffix = '',
  invertChange = false,
}: {
  label: string;
  value: number;
  change: number;
  icon: string;
  suffix?: string;
  invertChange?: boolean;
}) {
  const isPositive = invertChange ? change <= 0 : change >= 0;
  const changePercent = change;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xl">{icon}</span>
        {changePercent !== 0 && (
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              isPositive
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {changePercent > 0 ? '+' : ''}
            {changePercent}%
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900">
        {value.toLocaleString('de-CH')}
        {suffix}
      </div>
      <div className="text-sm text-gray-500 mt-1">{label}</div>
    </div>
  );
}

function SimpleBarChart({
  data,
  sessions,
  period,
}: {
  data: Array<{ x: string; y: number }>;
  sessions: Array<{ x: string; y: number }>;
  period: Period;
}) {
  if (!data || data.length === 0) {
    return <p className="text-gray-500 text-sm">Keine Daten verfügbar</p>;
  }

  const maxValue = Math.max(...data.map((d) => d.y), 1);

  const formatLabel = (x: string) => {
    const date = new Date(x);
    if (period === '24h') {
      return date.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit' });
  };

  return (
    <div>
      {/* Legend */}
      <div className="flex gap-4 mb-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-blue-500" />
          Seitenaufrufe
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-purple-300" />
          Besuche
        </div>
      </div>

      {/* Chart */}
      <div className="flex items-end gap-1 h-48 overflow-x-auto pb-6 relative">
        {data.map((point, i) => {
          const height = (point.y / maxValue) * 100;
          const sessionVal = sessions[i]?.y || 0;
          const sessionHeight = (sessionVal / maxValue) * 100;

          return (
            <div key={i} className="flex flex-col items-center flex-1 min-w-[20px] group relative">
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                {formatLabel(point.x)}: {point.y} Aufrufe, {sessionVal} Besuche
              </div>
              <div className="w-full flex gap-0.5 items-end" style={{ height: '100%' }}>
                <div
                  className="flex-1 bg-blue-500 rounded-t opacity-80 hover:opacity-100 transition-opacity"
                  style={{ height: `${Math.max(height, 1)}%` }}
                />
                <div
                  className="flex-1 bg-purple-300 rounded-t opacity-80 hover:opacity-100 transition-opacity"
                  style={{ height: `${Math.max(sessionHeight, 1)}%` }}
                />
              </div>
              {/* X Label */}
              {(data.length <= 14 || i % Math.ceil(data.length / 14) === 0) && (
                <span className="text-[10px] text-gray-400 mt-1 absolute -bottom-5 whitespace-nowrap">
                  {formatLabel(point.x)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MetricsList({
  title,
  icon,
  items,
  labelPrefix,
}: {
  title: string;
  icon: string;
  items: Array<{ x: string; y: number }>;
  labelPrefix: string;
}) {
  const maxValue = Math.max(...items.map((i) => i.y), 1);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span>{icon}</span>
        {title}
      </h3>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-700 truncate flex-1 mr-2">
                {labelPrefix}
                {item.x || '(Direkt)'}
              </span>
              <span className="font-medium text-gray-900 tabular-nums">
                {item.y.toLocaleString('de-CH')}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div
                className="bg-blue-500 h-1.5 rounded-full transition-all"
                style={{ width: `${(item.y / maxValue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NoDataYet({ umamiUrl }: { umamiUrl?: string }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
      <div className="text-6xl mb-4">📊</div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Noch keine Traffic-Daten
      </h3>
      <p className="text-gray-600 mb-6">
        Umami ist verbunden, aber es wurden noch keine Daten gesammelt.
        Sobald Besucher die Website nutzen, erscheinen die Daten hier.
      </p>
      {umamiUrl && (
        <a
          href={umamiUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Umami Dashboard öffnen ↗
        </a>
      )}
    </div>
  );
}

function ConnectionError({ data, onRetry }: { data: AnalyticsData; onRetry: () => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">📈 Webseiten-Traffic</h1>
        <p className="mt-2 text-gray-600">Besucher und Seitenaufrufe</p>
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-orange-900 mb-2">
          Umami nicht erreichbar
        </h3>
        <p className="text-orange-800 mb-4">{data.error}</p>
        {data.hint && <p className="text-sm text-orange-700 mb-4">{data.hint}</p>}
        <div className="flex gap-3">
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Erneut versuchen
          </button>
          {data.umamiUrl && (
            <a
              href={data.umamiUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 border border-orange-300 text-orange-800 rounded-lg hover:bg-orange-100 transition-colors"
            >
              Umami direkt öffnen ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function SetupGuide({ data }: { data: AnalyticsData }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">📈 Webseiten-Traffic</h1>
        <p className="mt-2 text-gray-600">
          Datenschutzkonformes Website-Tracking mit Umami Analytics
        </p>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-3">
          Was ist Umami?
        </h3>
        <p className="text-blue-800 mb-3">
          Umami ist eine <strong>DSGVO-konforme</strong>, selbst-gehostete Analytics-Lösung.
          Keine Cookies, anonymisierte Daten, volle Kontrolle.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <div className="bg-white rounded-lg p-3 text-center">
            <div className="text-2xl mb-1">👁️</div>
            <div className="text-xs text-gray-600">Seitenaufrufe</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center">
            <div className="text-2xl mb-1">👤</div>
            <div className="text-xs text-gray-600">Besucher</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center">
            <div className="text-2xl mb-1">🔗</div>
            <div className="text-xs text-gray-600">Herkunft</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center">
            <div className="text-2xl mb-1">🌍</div>
            <div className="text-xs text-gray-600">Länder</div>
          </div>
        </div>
      </div>

      {/* Setup Steps */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Einrichtung in 5 Schritten
        </h3>
        {data.setup?.steps && (
          <ol className="space-y-4">
            {data.setup.steps.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">
                  {i + 1}
                </span>
                <div className="pt-0.5">
                  <p className="text-gray-800">{step}</p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>

      {/* Environment Variables */}
      {data.setup?.envVars && (
        <div className="bg-gray-900 rounded-lg p-6 text-sm">
          <h3 className="text-gray-300 font-bold mb-3">
            .env.local – Folgende Variablen hinzufügen:
          </h3>
          <pre className="text-green-400 font-mono whitespace-pre-wrap">
            {Object.entries(data.setup.envVars)
              .map(([key, value]) => `${key}=${value}`)
              .join('\n')}
          </pre>
        </div>
      )}

      {/* Quick Access */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 text-center">
        <p className="text-gray-600 mb-4">
          Umami ist bereits im Docker-Setup enthalten und läuft auf Port 3002.
        </p>
        <a
          href="http://10.55.55.155:3002"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Umami Dashboard öffnen (Server) ↗
        </a>
      </div>
    </div>
  );
}
