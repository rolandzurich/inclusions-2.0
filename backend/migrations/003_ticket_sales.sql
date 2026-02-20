-- ============================================
-- Migration 003: Ticket-Verkäufe Cache
-- ============================================
-- Speichert tägliche Snapshots der Ticketverkäufe von Supermarket.li (WooCommerce/Tickera).
-- Wird einmal pro Tag aktualisiert.

CREATE TABLE IF NOT EXISTS ticket_sales_cache (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Ticket-Kategorie
  category      TEXT NOT NULL,            -- z.B. 'Early Bird', 'Regular'
  
  -- Verkaufszahlen
  sold          INTEGER NOT NULL DEFAULT 0,
  total         INTEGER NOT NULL DEFAULT 0,       -- Kontingent (z.B. 100, 300)
  remaining     INTEGER NOT NULL DEFAULT 0,
  
  -- Einnahmen
  price_chf     DECIMAL(10, 2) DEFAULT 0,         -- Preis pro Ticket
  revenue_chf   DECIMAL(12, 2) DEFAULT 0,         -- Umsatz = sold * price
  
  -- Check-in Daten
  checkins_pass INTEGER DEFAULT 0,
  checkins_fail INTEGER DEFAULT 0,
  
  -- Zeitstempel
  fetched_at    TIMESTAMPTZ DEFAULT NOW(),         -- Wann dieser Snapshot geholt wurde
  source        TEXT DEFAULT 'woocommerce',        -- Datenquelle
  
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Für schnelle Abfragen: Letzter Snapshot pro Kategorie
CREATE INDEX IF NOT EXISTS idx_ticket_sales_category ON ticket_sales_cache(category);
CREATE INDEX IF NOT EXISTS idx_ticket_sales_fetched ON ticket_sales_cache(fetched_at DESC);

-- Gesamtübersicht (aggregiert über alle Kategorien)
CREATE TABLE IF NOT EXISTS ticket_sales_summary (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  total_sold    INTEGER NOT NULL DEFAULT 0,
  total_revenue DECIMAL(12, 2) DEFAULT 0,
  total_capacity INTEGER DEFAULT 0,
  
  -- Details als JSON (flexibel für zukünftige Felder)
  details       JSONB,
  
  fetched_at    TIMESTAMPTZ DEFAULT NOW(),
  source        TEXT DEFAULT 'woocommerce',
  
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ticket_summary_fetched ON ticket_sales_summary(fetched_at DESC);

SELECT 'Migration 003_ticket_sales erfolgreich' as status;
