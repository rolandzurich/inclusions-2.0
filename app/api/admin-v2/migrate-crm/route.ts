export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db-postgres';

// GET - Status-Check
export async function GET() {
  try {
    const tables = await query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('vip_registrations', 'newsletter_subscriptions', 'booking_requests')
      ORDER BY table_name
    `);

    const contactCols = await query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'contacts'
      AND column_name IN ('has_disability', 'has_iv_card', 'special_needs', 'categories')
    `);

    return NextResponse.json({
      success: true,
      tables: tables.data?.map((t: any) => t.table_name) || [],
      contact_columns: contactCols.data?.map((c: any) => c.column_name) || [],
      ready: (tables.data?.length || 0) >= 3 && (contactCols.data?.length || 0) >= 4,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Alle Schema-Statements
const SCHEMA_STEPS = [
  { label: 'UUID Extension', sql: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"` },
  { label: 'contacts: has_disability', sql: `ALTER TABLE contacts ADD COLUMN IF NOT EXISTS has_disability BOOLEAN DEFAULT FALSE` },
  { label: 'contacts: has_iv_card', sql: `ALTER TABLE contacts ADD COLUMN IF NOT EXISTS has_iv_card BOOLEAN DEFAULT FALSE` },
  { label: 'contacts: special_needs', sql: `ALTER TABLE contacts ADD COLUMN IF NOT EXISTS special_needs TEXT` },
  { label: 'contacts: categories', sql: `ALTER TABLE contacts ADD COLUMN IF NOT EXISTS categories TEXT[] DEFAULT '{}'` },
  { label: 'contacts: idx_categories', sql: `CREATE INDEX IF NOT EXISTS idx_contacts_categories ON contacts USING GIN(categories)` },
  { label: 'vip_registrations', sql: `CREATE TABLE IF NOT EXISTS vip_registrations (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE, registration_type TEXT NOT NULL DEFAULT 'self', caregiver_id UUID REFERENCES contacts(id) ON DELETE SET NULL, event_date DATE, event_location TEXT, arrival_time TEXT, tixi_taxi BOOLEAN DEFAULT FALSE, tixi_address TEXT, needs_caregiver BOOLEAN DEFAULT FALSE, caregiver_name TEXT, caregiver_phone TEXT, emergency_contact_name TEXT, emergency_contact_phone TEXT, status TEXT NOT NULL DEFAULT 'pending', admin_notes TEXT, viewed_at TIMESTAMPTZ, raw_data JSONB)` },
  { label: 'vip: indexes', sql: `CREATE INDEX IF NOT EXISTS idx_vip_reg_contact_id ON vip_registrations(contact_id)` },
  { label: 'newsletter_subscriptions', sql: `CREATE TABLE IF NOT EXISTS newsletter_subscriptions (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE, interests TEXT[] DEFAULT '{}', status TEXT NOT NULL DEFAULT 'pending', opt_in_confirmed_at TIMESTAMPTZ, UNIQUE(contact_id))` },
  { label: 'newsletter: indexes', sql: `CREATE INDEX IF NOT EXISTS idx_newsletter_sub_contact_id ON newsletter_subscriptions(contact_id)` },
  { label: 'booking_requests', sql: `CREATE TABLE IF NOT EXISTS booking_requests (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE, booking_type TEXT, booking_item TEXT, event_date DATE, event_location TEXT, event_type TEXT, message TEXT, status TEXT NOT NULL DEFAULT 'new', admin_notes TEXT, viewed_at TIMESTAMPTZ)` },
  { label: 'booking: indexes', sql: `CREATE INDEX IF NOT EXISTS idx_booking_req_contact_id ON booking_requests(contact_id)` },
];

// POST - Einzelnes Statement oder alles ausfuehren
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stepParam = searchParams.get('step');

    // Einzelnes Statement
    if (stepParam !== null) {
      const stepIndex = parseInt(stepParam);
      if (stepIndex < 0 || stepIndex >= SCHEMA_STEPS.length) {
        return NextResponse.json({ error: `Ungültiger Step: ${stepIndex}. Max: ${SCHEMA_STEPS.length - 1}` }, { status: 400 });
      }

      const step = SCHEMA_STEPS[stepIndex];
      const result = await query(step.sql);

      if (result.error) {
        if (result.error.includes('already exists')) {
          return NextResponse.json({ success: true, step: stepIndex, label: step.label, message: 'Bereits vorhanden (SKIP)' });
        }
        return NextResponse.json({ success: false, step: stepIndex, label: step.label, error: result.error }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        step: stepIndex,
        label: step.label,
        message: 'OK',
        total_steps: SCHEMA_STEPS.length,
        next_step: stepIndex + 1 < SCHEMA_STEPS.length ? stepIndex + 1 : null,
      });
    }

    // Alles ausfuehren (alle Steps)
    const results: any[] = [];
    for (let i = 0; i < SCHEMA_STEPS.length; i++) {
      const step = SCHEMA_STEPS[i];
      try {
        const result = await query(step.sql);
        if (result.error) {
          results.push({ step: i, label: step.label, status: result.error.includes('already exists') ? 'skip' : 'error', message: result.error });
        } else {
          results.push({ step: i, label: step.label, status: 'ok' });
        }
      } catch (err: any) {
        results.push({ step: i, label: step.label, status: 'error', message: err.message });
      }
    }

    return NextResponse.json({ success: true, message: 'Schema-Migration abgeschlossen', results, total: SCHEMA_STEPS.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
