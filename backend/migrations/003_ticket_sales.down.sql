-- ============================================
-- ROLLBACK 003: Ticket-Verkäufe Cache entfernen
-- ============================================

DROP TABLE IF EXISTS ticket_sales_summary;
DROP TABLE IF EXISTS ticket_sales_cache;

SELECT 'ROLLBACK 003_ticket_sales erfolgreich' as status;
