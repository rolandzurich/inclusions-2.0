-- ============================================
-- Migration: Add viewed_at fields for tracking viewed entries
-- ============================================

-- Add viewed_at to contact_requests
ALTER TABLE contact_requests 
ADD COLUMN IF NOT EXISTS viewed_at TIMESTAMPTZ;

-- Add index for viewed_at
CREATE INDEX IF NOT EXISTS idx_contact_requests_viewed_at ON contact_requests(viewed_at);

-- Add viewed_at to vip_registrations
ALTER TABLE vip_registrations 
ADD COLUMN IF NOT EXISTS viewed_at TIMESTAMPTZ;

-- Add index for viewed_at
CREATE INDEX IF NOT EXISTS idx_vip_registrations_viewed_at ON vip_registrations(viewed_at);

-- Add mailchimp_synced_at to newsletter_subscribers for tracking Mailchimp sync
ALTER TABLE newsletter_subscribers 
ADD COLUMN IF NOT EXISTS mailchimp_synced_at TIMESTAMPTZ;

-- Add mailchimp_id to newsletter_subscribers for storing Mailchimp contact ID
ALTER TABLE newsletter_subscribers 
ADD COLUMN IF NOT EXISTS mailchimp_id TEXT;

-- Add index for mailchimp tracking
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_mailchimp_synced ON newsletter_subscribers(mailchimp_synced_at);
