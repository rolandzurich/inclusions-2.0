/**
 * INCLUSIONS – Ticket-Verkäufe Integration
 * 
 * Holt Ticketverkaufs-Daten von Supermarket.li (WooCommerce/Tickera)
 * und cached sie in unserer PostgreSQL-Datenbank.
 * 
 * Konfiguration (in .env.local):
 *   WC_STORE_URL=https://supermarket.li
 *   WC_CONSUMER_KEY=ck_...
 *   WC_CONSUMER_SECRET=cs_...
 * 
 * Nutzung:
 *   await fetchAndCacheTicketSales()  → Holt aktuelle Daten + speichert
 *   await getLatestTicketSales()      → Liest gecachte Daten
 *   await isConfigured()              → Prüft ob API-Keys gesetzt sind
 */

import { query } from './db-postgres';

// ============================================================
// KONFIGURATION
// ============================================================

interface WCConfig {
  storeUrl: string;
  consumerKey: string;
  consumerSecret: string;
}

function getConfig(): WCConfig | null {
  const storeUrl = process.env.WC_STORE_URL;
  const consumerKey = process.env.WC_CONSUMER_KEY;
  const consumerSecret = process.env.WC_CONSUMER_SECRET;
  
  if (!storeUrl || !consumerKey || !consumerSecret) {
    return null;
  }
  
  return { storeUrl, consumerKey, consumerSecret };
}

export function isConfigured(): boolean {
  return getConfig() !== null;
}

// ============================================================
// TYPEN
// ============================================================

export interface TicketCategory {
  category: string;
  sold: number;
  total: number;
  remaining: number;
  price_chf: number;
  revenue_chf: number;
  checkins_pass: number;
  checkins_fail: number;
  percentage: number;
}

export interface TicketSalesSummary {
  total_sold: number;
  total_revenue: number;
  total_capacity: number;
  categories: TicketCategory[];
  fetched_at: string;
  source: string;
}

// ============================================================
// WOOCOMMERCE API
// ============================================================

/**
 * WooCommerce REST API Aufruf mit Consumer Key/Secret Auth.
 */
async function wcApiCall(endpoint: string): Promise<any> {
  const config = getConfig();
  if (!config) throw new Error('WooCommerce nicht konfiguriert');
  
  const url = new URL(`/wp-json/wc/v3/${endpoint}`, config.storeUrl);
  url.searchParams.set('consumer_key', config.consumerKey);
  url.searchParams.set('consumer_secret', config.consumerSecret);
  
  const res = await fetch(url.toString(), {
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`WooCommerce API Fehler (${res.status}): ${errorText}`);
  }
  
  return res.json();
}

/**
 * Holt alle abgeschlossenen Bestellungen und aggregiert Ticket-Verkäufe.
 */
async function fetchTicketDataFromWC(): Promise<TicketCategory[]> {
  // Alle Bestellungen holen (paginated)
  let allOrders: any[] = [];
  let page = 1;
  let hasMore = true;
  
  while (hasMore) {
    const orders = await wcApiCall(`orders?status=completed,processing&per_page=100&page=${page}`);
    if (orders.length === 0) {
      hasMore = false;
    } else {
      allOrders = allOrders.concat(orders);
      page++;
      if (orders.length < 100) hasMore = false;
    }
  }
  
  // Produkte/Tickets holen
  const products = await wcApiCall('products?per_page=100');
  
  // Ticket-Kategorien aus Produkten und Bestellungen aggregieren
  const categoryMap = new Map<string, TicketCategory>();
  
  // Produkte als Basis (Kontingent + Preis)
  for (const product of products) {
    const name = product.name || 'Unbekannt';
    // Nur Tickets (Tickera-Produkte haben oft bestimmte Kategorien/Tags)
    if (!categoryMap.has(name)) {
      categoryMap.set(name, {
        category: name,
        sold: 0,
        total: product.stock_quantity ? product.stock_quantity + (product.total_sales || 0) : 0,
        remaining: product.stock_quantity || 0,
        price_chf: parseFloat(product.price || '0'),
        revenue_chf: 0,
        checkins_pass: 0,
        checkins_fail: 0,
        percentage: 0,
      });
    }
  }
  
  // Bestellungen durchgehen → Verkäufe pro Produkt zählen
  for (const order of allOrders) {
    for (const item of (order.line_items || [])) {
      const name = item.name || 'Unbekannt';
      const existing = categoryMap.get(name);
      
      if (existing) {
        existing.sold += item.quantity || 0;
        existing.revenue_chf += parseFloat(item.total || '0');
      } else {
        categoryMap.set(name, {
          category: name,
          sold: item.quantity || 0,
          total: 0,
          remaining: 0,
          price_chf: parseFloat(item.price || '0'),
          revenue_chf: parseFloat(item.total || '0'),
          checkins_pass: 0,
          checkins_fail: 0,
          percentage: 0,
        });
      }
    }
  }
  
  // Prozentsatz berechnen
  const categories = Array.from(categoryMap.values());
  for (const cat of categories) {
    if (cat.total > 0) {
      cat.remaining = cat.total - cat.sold;
      cat.percentage = Math.round((cat.sold / cat.total) * 100);
    }
  }
  
  return categories;
}

// ============================================================
// CACHE: Lesen und Schreiben
// ============================================================

/**
 * Speichert frische Ticketdaten in der DB.
 */
async function cacheTicketSales(categories: TicketCategory[]): Promise<void> {
  const now = new Date().toISOString();
  
  // Einzelne Kategorien speichern
  for (const cat of categories) {
    await query(
      `INSERT INTO ticket_sales_cache 
       (category, sold, total, remaining, price_chf, revenue_chf, checkins_pass, checkins_fail, fetched_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [cat.category, cat.sold, cat.total, cat.remaining, cat.price_chf, cat.revenue_chf, cat.checkins_pass, cat.checkins_fail, now]
    );
  }
  
  // Summary speichern
  const totalSold = categories.reduce((s, c) => s + c.sold, 0);
  const totalRevenue = categories.reduce((s, c) => s + c.revenue_chf, 0);
  const totalCapacity = categories.reduce((s, c) => s + c.total, 0);
  
  await query(
    `INSERT INTO ticket_sales_summary (total_sold, total_revenue, total_capacity, details, fetched_at)
     VALUES ($1, $2, $3, $4, $5)`,
    [totalSold, totalRevenue, totalCapacity, JSON.stringify(categories), now]
  );
}

/**
 * Liest den letzten gecachten Snapshot.
 */
export async function getLatestTicketSales(): Promise<TicketSalesSummary | null> {
  const result = await query(
    `SELECT * FROM ticket_sales_summary ORDER BY fetched_at DESC LIMIT 1`
  );
  
  if (result.error || !result.data || result.data.length === 0) {
    return null;
  }
  
  const row = result.data[0];
  return {
    total_sold: row.total_sold,
    total_revenue: parseFloat(row.total_revenue),
    total_capacity: row.total_capacity,
    categories: row.details || [],
    fetched_at: row.fetched_at,
    source: row.source || 'woocommerce',
  };
}

/**
 * Prüft ob die Daten frisch sind (weniger als 24h alt).
 */
export async function isCacheFresh(): Promise<boolean> {
  const result = await query(
    `SELECT fetched_at FROM ticket_sales_summary ORDER BY fetched_at DESC LIMIT 1`
  );
  
  if (!result.data || result.data.length === 0) return false;
  
  const fetchedAt = new Date(result.data[0].fetched_at);
  const now = new Date();
  const hoursSince = (now.getTime() - fetchedAt.getTime()) / (1000 * 60 * 60);
  
  return hoursSince < 24;
}

// ============================================================
// HAUPTFUNKTION
// ============================================================

/**
 * Holt aktuelle Daten von WooCommerce und cached sie.
 * Gibt die frischen Daten zurück.
 */
export async function fetchAndCacheTicketSales(): Promise<{
  success: boolean;
  data?: TicketSalesSummary;
  error?: string;
}> {
  try {
    if (!isConfigured()) {
      return { success: false, error: 'WooCommerce API nicht konfiguriert. Bitte WC_CONSUMER_KEY und WC_CONSUMER_SECRET setzen.' };
    }
    
    console.log('🎫 Hole Ticketverkäufe von WooCommerce...');
    const categories = await fetchTicketDataFromWC();
    
    console.log(`  📊 ${categories.length} Kategorien gefunden`);
    categories.forEach(c => {
      console.log(`     ${c.category}: ${c.sold}/${c.total} (CHF ${c.revenue_chf.toFixed(2)})`);
    });
    
    // In DB cachen
    await cacheTicketSales(categories);
    
    // Frisch lesen
    const data = await getLatestTicketSales();
    
    console.log('✅ Ticketdaten gecached');
    return { success: true, data: data || undefined };
    
  } catch (err: any) {
    console.error('❌ Ticket-Fetch fehlgeschlagen:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Manueller Import: Daten direkt einspeisen (z.B. aus Screenshot).
 * Nützlich wenn die WC API noch nicht konfiguriert ist.
 */
export async function importTicketSalesManually(categories: TicketCategory[]): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await cacheTicketSales(categories);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
