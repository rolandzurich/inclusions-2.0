'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface TicketCategory {
  category: string;
  sold: number;
  total: number;
  remaining: number;
  price_chf: number;
  revenue_chf: number;
  percentage: number;
}

interface TicketData {
  configured: boolean;
  has_data: boolean;
  cache_fresh: boolean;
  data: {
    total_sold: number;
    total_revenue: number;
    total_capacity: number;
    categories: TicketCategory[];
    fetched_at: string;
  } | null;
}

interface DashboardData {
  stats: {
    vip: number;
    newsletter: number;
    bookings: number;
    contacts: number;
    companies: number;
    deals: number;
    events: number;
    projects: number;
    cmsPages: number;
  };
  pendingCounts: {
    vip: number;
    bookings: number;
  };
  recentVip: any[];
  recentBookings: any[];
  recentNewsletter: any[];
  dataSource: {
    dbConnected: boolean;
    pgStats: { vip: number; newsletter: number; bookings: number };
    jsonStats: { vip: number; newsletter: number; bookings: number };
  };
}

export default function AdminV2Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [ticketData, setTicketData] = useState<TicketData | null>(null);
  const [ticketRefreshing, setTicketRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTickets = useCallback(async () => {
    try {
      const res = await fetch('/api/admin-v2/tickets');
      if (res.ok) {
        const json = await res.json();
        setTicketData(json);
      }
    } catch {
      // Ticket-Daten sind optional – kein Fehler
    }
  }, []);

  useEffect(() => {
    loadDashboard();
    loadTickets();
  }, [loadTickets]);

  async function loadDashboard() {
    try {
      const res = await fetch('/api/admin-v2/dashboard');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        setError('Dashboard konnte nicht geladen werden');
      }
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  }

  async function refreshTickets() {
    setTicketRefreshing(true);
    try {
      const res = await fetch('/api/admin-v2/tickets', { method: 'POST' });
      if (res.ok) {
        await loadTickets();
      }
    } catch {
      // Silently fail
    }
    setTicketRefreshing(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
        <p className="font-medium">Fehler beim Laden des Dashboards</p>
        <p className="text-sm mt-1">{error}</p>
        <button onClick={loadDashboard} className="mt-3 text-sm text-red-600 underline">
          Erneut versuchen
        </button>
      </div>
    );
  }

  const { stats, pendingCounts, recentVip, recentBookings, recentNewsletter, dataSource } = data;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Übersicht aller Daten und Aktivitäten</p>
      </div>

      {/* Datenquelle Info */}
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
        dataSource.dbConnected
          ? 'bg-green-50 text-green-700'
          : 'bg-yellow-50 text-yellow-700'
      }`}>
        <span>{dataSource.dbConnected ? '🟢' : '🟡'}</span>
        <span>
          {dataSource.dbConnected
            ? 'Datenbank verbunden – alle Daten synchron'
            : 'Datenbank nicht erreichbar – Daten aus JSON-Backup'}
        </span>
      </div>

      {/* === WICHTIG: Formular-Daten (VIP, Newsletter, Bookings) === */}
      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Formular-Eingänge
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* VIP */}
          <Link href="/admin-v2/crm/vip" className="block group">
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-pink-200 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">VIP-Gäste</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.vip}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center text-2xl group-hover:bg-pink-100 transition-colors">
                  ⭐
                </div>
              </div>
              {pendingCounts.vip > 0 && (
                <div className="mt-3 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                  <span className="text-xs font-medium text-orange-600">
                    {pendingCounts.vip} neue Anmeldung{pendingCounts.vip > 1 ? 'en' : ''}
                  </span>
                </div>
              )}
              {pendingCounts.vip === 0 && (
                <p className="mt-3 text-xs text-gray-400">Alle bearbeitet</p>
              )}
            </div>
          </Link>

          {/* Newsletter */}
          <Link href="/admin-v2/crm/newsletter" className="block group">
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Newsletter</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.newsletter}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-2xl group-hover:bg-blue-100 transition-colors">
                  📧
                </div>
              </div>
              <p className="mt-3 text-xs text-gray-400">Abonnenten</p>
            </div>
          </Link>

          {/* Bookings */}
          <Link href="/admin-v2/crm/bookings" className="block group">
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-purple-200 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Booking-Anfragen</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.bookings}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-2xl group-hover:bg-purple-100 transition-colors">
                  🎵
                </div>
              </div>
              {pendingCounts.bookings > 0 && (
                <div className="mt-3 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                  <span className="text-xs font-medium text-orange-600">
                    {pendingCounts.bookings} offen
                  </span>
                </div>
              )}
              {pendingCounts.bookings === 0 && (
                <p className="mt-3 text-xs text-gray-400">Alle bearbeitet</p>
              )}
            </div>
          </Link>
        </div>
      </div>

      {/* === TICKET-VERKÄUFE === */}
      <TicketSalesWidget
        data={ticketData}
        refreshing={ticketRefreshing}
        onRefresh={refreshTickets}
      />

      {/* === CRM & System Stats === */}
      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          System
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard label="Kontakte" value={stats.contacts} icon="👤" href="/admin-v2/crm/contacts" />
          <StatCard label="Unternehmen" value={stats.companies} icon="🏢" href="/admin-v2/crm/companies" />
          <StatCard label="Deals" value={stats.deals} icon="💰" href="/admin-v2/crm/deals" />
          <StatCard label="Events" value={stats.events} icon="📅" href="/admin-v2/calendar" />
          <StatCard label="Projekte" value={stats.projects} icon="📁" href="/admin-v2/projects" />
          <StatCard label="CMS Seiten" value={stats.cmsPages} icon="📄" href="/admin-v2/cms" />
        </div>
      </div>

      {/* === Letzte Eingänge === */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Letzte VIP-Anmeldungen */}
        <RecentList
          title="Letzte VIP-Anmeldungen"
          items={recentVip}
          href="/admin-v2/crm/vip"
          emptyText="Noch keine VIP-Anmeldungen"
          renderItem={(item) => (
            <div className="flex items-center justify-between py-2">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {item.first_name} {item.last_name}
                </p>
                <p className="text-xs text-gray-500 truncate">{item.email}</p>
              </div>
              <StatusBadge status={item.status} />
            </div>
          )}
        />

        {/* Letzte Booking-Anfragen */}
        <RecentList
          title="Letzte Booking-Anfragen"
          items={recentBookings}
          href="/admin-v2/crm/bookings"
          emptyText="Noch keine Booking-Anfragen"
          renderItem={(item) => (
            <div className="flex items-center justify-between py-2">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {item.first_name} {item.last_name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {item.booking_type || 'Anfrage'} · {item.email}
                </p>
              </div>
              <StatusBadge status={item.status} />
            </div>
          )}
        />

        {/* Letzte Newsletter-Abos */}
        <RecentList
          title="Letzte Newsletter-Abos"
          items={recentNewsletter}
          href="/admin-v2/crm/newsletter"
          emptyText="Noch keine Newsletter-Abos"
          renderItem={(item) => (
            <div className="flex items-center justify-between py-2">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {item.first_name ? `${item.first_name} ${item.last_name}` : item.email}
                </p>
                <p className="text-xs text-gray-500 truncate">{item.email}</p>
              </div>
              <StatusBadge status={item.status} />
            </div>
          )}
        />
      </div>

      {/* === Datenquelle Details (nur wenn nötig) === */}
      {(dataSource.jsonStats.vip > dataSource.pgStats.vip ||
        dataSource.jsonStats.newsletter > dataSource.pgStats.newsletter ||
        dataSource.jsonStats.bookings > dataSource.pgStats.bookings) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-yellow-800 mb-2">
            ⚠️ Nicht migrierte Daten erkannt
          </h3>
          <p className="text-xs text-yellow-700 mb-2">
            Es gibt Einträge in den JSON-Dateien, die noch nicht in die Datenbank migriert wurden.
            Diese Daten gehen nicht verloren – sie werden als Maximum angezeigt.
          </p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-white/60 rounded p-2">
              <p className="text-yellow-600 font-medium">VIP</p>
              <p>DB: {dataSource.pgStats.vip} | JSON: {dataSource.jsonStats.vip}</p>
            </div>
            <div className="bg-white/60 rounded p-2">
              <p className="text-yellow-600 font-medium">Newsletter</p>
              <p>DB: {dataSource.pgStats.newsletter} | JSON: {dataSource.jsonStats.newsletter}</p>
            </div>
            <div className="bg-white/60 rounded p-2">
              <p className="text-yellow-600 font-medium">Bookings</p>
              <p>DB: {dataSource.pgStats.bookings} | JSON: {dataSource.jsonStats.bookings}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// === Hilfskomponenten ===

function StatCard({ label, value, icon, href }: { label: string; value: number; icon: string; href: string }) {
  return (
    <Link href={href} className="block group">
      <div className="bg-white px-4 py-3 rounded-xl border border-gray-200 hover:shadow-sm hover:border-gray-300 transition-all">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <span className="text-xs text-gray-500">{label}</span>
        </div>
        <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
    </Link>
  );
}

function RecentList({ title, items, href, emptyText, renderItem }: {
  title: string;
  items: any[];
  href: string;
  emptyText: string;
  renderItem: (item: any) => React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <Link href={href} className="text-xs text-pink-600 hover:text-pink-700">
          Alle ansehen →
        </Link>
      </div>
      <div className="px-4 divide-y divide-gray-50">
        {items.length === 0 ? (
          <p className="py-6 text-xs text-gray-400 text-center">{emptyText}</p>
        ) : (
          items.map((item, i) => (
            <div key={item.id || i}>{renderItem(item)}</div>
          ))
        )}
      </div>
    </div>
  );
}

function TicketSalesWidget({ data, refreshing, onRefresh }: {
  data: TicketData | null;
  refreshing: boolean;
  onRefresh: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editEarlyBird, setEditEarlyBird] = useState(0);
  const [editRegular, setEditRegular] = useState(0);

  // Ticket-Konfiguration (fest, ändert sich selten)
  const EARLY_BIRD = { total: 100, price: 25.00 };
  const REGULAR = { total: 300, price: 35.00 };

  function startEdit() {
    const sales = data?.data;
    const eb = sales?.categories.find(c => c.category === 'Early Bird');
    const reg = sales?.categories.find(c => c.category === 'Regular');
    setEditEarlyBird(eb?.sold || 0);
    setEditRegular(reg?.sold || 0);
    setEditing(true);
  }

  async function saveEdit() {
    setSaving(true);
    try {
      const categories = [
        {
          category: 'Early Bird',
          sold: editEarlyBird,
          total: EARLY_BIRD.total,
          remaining: EARLY_BIRD.total - editEarlyBird,
          price_chf: EARLY_BIRD.price,
          revenue_chf: editEarlyBird * EARLY_BIRD.price,
          checkins_pass: 0,
          checkins_fail: 0,
          percentage: Math.round((editEarlyBird / EARLY_BIRD.total) * 100),
        },
        {
          category: 'Regular',
          sold: editRegular,
          total: REGULAR.total,
          remaining: REGULAR.total - editRegular,
          price_chf: REGULAR.price,
          revenue_chf: editRegular * REGULAR.price,
          checkins_pass: 0,
          checkins_fail: 0,
          percentage: Math.round((editRegular / REGULAR.total) * 100),
        },
      ];

      await fetch('/api/admin-v2/tickets?action=import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories }),
      });

      setEditing(false);
      onRefresh(); // Daten neu laden
    } catch {
      // Fehler still ignorieren
    }
    setSaving(false);
  }

  // Kein Ticket-Daten verfügbar → Quick-Setup
  if (!data || !data.has_data) {
    return (
      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Ticketverkäufe
        </h2>
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
          <p className="text-3xl mb-2">🎫</p>
          <p className="text-sm font-medium text-gray-700 mb-1">Ticketverkäufe aktualisieren</p>
          <p className="text-xs text-gray-500 mb-4">
            Trage die aktuellen Zahlen von <a href="https://supermarket.li/wp-admin" target="_blank" rel="noopener" className="text-pink-600 underline">supermarket.li</a> ein.
          </p>
          <button
            onClick={startEdit}
            className="px-4 py-2 text-sm bg-pink-600 text-white rounded-lg hover:bg-pink-700"
          >
            Zahlen eintragen
          </button>
        </div>
      </div>
    );
  }

  const { data: sales } = data;
  if (!sales) return null;

  const totalPercentage = sales.total_capacity > 0
    ? Math.round((sales.total_sold / sales.total_capacity) * 100)
    : 0;

  const fetchedDate = new Date(sales.fetched_at).toLocaleString('de-CH', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  // Quick-Edit Modus
  if (editing) {
    const previewRevenue = (editEarlyBird * EARLY_BIRD.price) + (editRegular * REGULAR.price);
    const previewTotal = editEarlyBird + editRegular;

    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Ticketverkäufe aktualisieren
          </h2>
          <a href="https://supermarket.li/wp-admin" target="_blank" rel="noopener"
             className="text-xs text-pink-600 hover:text-pink-700">
            Supermarket.li öffnen →
          </a>
        </div>
        <div className="bg-white rounded-xl border-2 border-pink-200 p-5 shadow-sm">
          <p className="text-xs text-gray-500 mb-4">
            Trage die Anzahl verkaufter Tickets ein. Einnahmen werden automatisch berechnet.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Early Bird */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Early Bird <span className="text-xs font-normal text-gray-400">(CHF {EARLY_BIRD.price.toFixed(2)} · max {EARLY_BIRD.total})</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={0}
                  max={EARLY_BIRD.total}
                  value={editEarlyBird}
                  onChange={(e) => setEditEarlyBird(Math.min(parseInt(e.target.value) || 0, EARLY_BIRD.total))}
                  className="w-24 px-3 py-2 text-2xl font-bold text-center border border-gray-300 rounded-lg focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                />
                <div className="text-sm text-gray-500">
                  <p>= CHF {(editEarlyBird * EARLY_BIRD.price).toLocaleString('de-CH', { minimumFractionDigits: 2 })}</p>
                  <p className="text-xs text-gray-400">{EARLY_BIRD.total - editEarlyBird} übrig</p>
                </div>
              </div>
            </div>

            {/* Regular */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Regular <span className="text-xs font-normal text-gray-400">(CHF {REGULAR.price.toFixed(2)} · max {REGULAR.total})</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={0}
                  max={REGULAR.total}
                  value={editRegular}
                  onChange={(e) => setEditRegular(Math.min(parseInt(e.target.value) || 0, REGULAR.total))}
                  className="w-24 px-3 py-2 text-2xl font-bold text-center border border-gray-300 rounded-lg focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                />
                <div className="text-sm text-gray-500">
                  <p>= CHF {(editRegular * REGULAR.price).toLocaleString('de-CH', { minimumFractionDigits: 2 })}</p>
                  <p className="text-xs text-gray-400">{REGULAR.total - editRegular} übrig</p>
                </div>
              </div>
            </div>
          </div>

          {/* Vorschau */}
          <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
            <div className="text-sm">
              <span className="text-gray-500">Gesamt: </span>
              <span className="font-bold text-gray-900">{previewTotal} Tickets</span>
              <span className="text-gray-400 mx-2">·</span>
              <span className="font-bold text-emerald-600">CHF {previewRevenue.toLocaleString('de-CH', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditing(false)}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
              >
                Abbrechen
              </button>
              <button
                onClick={saveEdit}
                disabled={saving}
                className="px-4 py-1.5 text-sm bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50"
              >
                {saving ? '⏳ Speichern...' : '✅ Speichern'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
          Ticketverkäufe · INCLUSIONS
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-400">
            Stand: {fetchedDate}
            {!data.cache_fresh && <span className="text-amber-500 ml-1">(veraltet)</span>}
          </span>
          <button
            onClick={startEdit}
            className="text-xs text-pink-600 hover:text-pink-700 font-medium transition-colors"
            title="Zahlen aktualisieren"
          >
            ✏️ Aktualisieren
          </button>
        </div>
      </div>

      {/* Gesamtübersicht */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-5 rounded-xl text-white shadow-sm">
          <p className="text-xs font-medium text-emerald-100 uppercase tracking-wider">Gesamteinnahmen</p>
          <p className="text-3xl font-bold mt-1">CHF {sales.total_revenue.toLocaleString('de-CH', { minimumFractionDigits: 2 })}</p>
          <p className="text-xs text-emerald-200 mt-2">{sales.total_sold} Tickets verkauft</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Verkauft / Kapazität</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{sales.total_sold} <span className="text-lg text-gray-400">/ {sales.total_capacity}</span></p>
          <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-pink-500 h-2 rounded-full transition-all"
              style={{ width: `${Math.min(totalPercentage, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">{totalPercentage}% ausgelastet</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Noch verfügbar</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{sales.total_capacity - sales.total_sold}</p>
          <p className="text-xs text-gray-400 mt-2">Tickets übrig</p>
        </div>
      </div>

      {/* Pro Kategorie */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sales.categories.map((cat) => {
          const pct = cat.total > 0 ? Math.round((cat.sold / cat.total) * 100) : 0;
          const barColor = pct >= 80 ? 'bg-red-500' : pct >= 50 ? 'bg-amber-500' : 'bg-emerald-500';
          
          return (
            <div key={cat.category} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-900">{cat.category}</h3>
                <span className="text-xs font-medium text-gray-500">
                  CHF {cat.price_chf.toFixed(2)} / Ticket
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div>
                  <p className="text-xs text-gray-500">Verkauft</p>
                  <p className="text-xl font-bold text-gray-900">{cat.sold}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Kontingent</p>
                  <p className="text-xl font-bold text-gray-400">{cat.total}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Einnahmen</p>
                  <p className="text-xl font-bold text-emerald-600">
                    {cat.revenue_chf.toLocaleString('de-CH', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`${barColor} h-2.5 rounded-full transition-all`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-xs text-gray-400">
                  {cat.remaining} übrig
                </span>
                <span className="text-xs font-medium text-gray-600">
                  {pct}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    pending: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Neu' },
    new: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Neu' },
    confirmed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Bestätigt' },
    approved: { bg: 'bg-green-100', text: 'text-green-700', label: 'Genehmigt' },
    active: { bg: 'bg-green-100', text: 'text-green-700', label: 'Aktiv' },
    contacted: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Kontaktiert' },
    declined: { bg: 'bg-red-100', text: 'text-red-700', label: 'Abgelehnt' },
    cancelled: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Storniert' },
    unsubscribed: { bg: 'bg-gray-100', text: 'text-gray-500', label: 'Abgemeldet' },
  };

  const c = config[status] || { bg: 'bg-gray-100', text: 'text-gray-600', label: status };

  return (
    <span className={`flex-shrink-0 px-2 py-0.5 text-[10px] font-medium rounded-full ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
}
