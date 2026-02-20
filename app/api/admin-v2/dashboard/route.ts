/**
 * Dashboard Stats API
 * Holt echte Zahlen aus PostgreSQL und JSON-Fallback
 * Zeigt immer das Maximum der verfügbaren Daten
 */

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { query } from '@/lib/db-postgres';
import { promises as fs } from 'fs';
import path from 'path';

async function readJsonFile(filename: string): Promise<any[]> {
  try {
    const filePath = path.join(process.cwd(), 'data', filename);
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return [];
  }
}

export async function GET() {
  try {
    // === PostgreSQL Daten ===
    let pgStats = {
      vip: 0,
      newsletter: 0,
      bookings: 0,
      contacts: 0,
      companies: 0,
      deals: 0,
      events: 0,
      projects: 0,
      cmsPages: 0,
      dbConnected: false,
    };

    let recentVip: any[] = [];
    let recentBookings: any[] = [];
    let recentNewsletter: any[] = [];
    let pendingCounts = { vip: 0, bookings: 0 };

    try {
      // Counts
      const [vipRes, nlRes, bookRes, contactRes, compRes, dealRes, eventRes, projRes, cmsRes] = await Promise.all([
        query('SELECT COUNT(*) as count FROM vip_registrations'),
        query('SELECT COUNT(*) as count FROM newsletter_subscriptions'),
        query('SELECT COUNT(*) as count FROM booking_requests'),
        query('SELECT COUNT(*) as count FROM contacts'),
        query('SELECT COUNT(*) as count FROM companies'),
        query('SELECT COUNT(*) as count FROM deals'),
        query('SELECT COUNT(*) as count FROM events_v2'),
        query('SELECT COUNT(*) as count FROM projects'),
        query('SELECT COUNT(*) as count FROM cms_pages'),
      ]);

      pgStats = {
        vip: parseInt(vipRes.data?.[0]?.count || '0'),
        newsletter: parseInt(nlRes.data?.[0]?.count || '0'),
        bookings: parseInt(bookRes.data?.[0]?.count || '0'),
        contacts: parseInt(contactRes.data?.[0]?.count || '0'),
        companies: parseInt(compRes.data?.[0]?.count || '0'),
        deals: parseInt(dealRes.data?.[0]?.count || '0'),
        events: parseInt(eventRes.data?.[0]?.count || '0'),
        projects: parseInt(projRes.data?.[0]?.count || '0'),
        cmsPages: parseInt(cmsRes.data?.[0]?.count || '0'),
        dbConnected: true,
      };

      // Pending counts
      const [pendingVip, pendingBook] = await Promise.all([
        query("SELECT COUNT(*) as count FROM vip_registrations WHERE status = 'pending'"),
        query("SELECT COUNT(*) as count FROM booking_requests WHERE status IN ('pending', 'new')"),
      ]);
      pendingCounts = {
        vip: parseInt(pendingVip.data?.[0]?.count || '0'),
        bookings: parseInt(pendingBook.data?.[0]?.count || '0'),
      };

      // Recent entries (last 5)
      const [recentVipRes, recentBookRes, recentNlRes] = await Promise.all([
        query(`
          SELECT v.id, v.created_at, v.status, c.first_name, c.last_name, c.email
          FROM vip_registrations v
          LEFT JOIN contacts c ON v.contact_id = c.id
          ORDER BY v.created_at DESC LIMIT 5
        `),
        query(`
          SELECT b.id, b.created_at, b.status, b.booking_type, c.first_name, c.last_name, c.email
          FROM booking_requests b
          LEFT JOIN contacts c ON b.contact_id = c.id
          ORDER BY b.created_at DESC LIMIT 5
        `),
        query(`
          SELECT n.id, n.created_at, n.status, c.first_name, c.last_name, c.email
          FROM newsletter_subscriptions n
          LEFT JOIN contacts c ON n.contact_id = c.id
          ORDER BY n.created_at DESC LIMIT 5
        `),
      ]);

      recentVip = recentVipRes.data || [];
      recentBookings = recentBookRes.data || [];
      recentNewsletter = recentNlRes.data || [];
    } catch (err) {
      console.warn('⚠️ PostgreSQL nicht erreichbar für Dashboard:', err);
    }

    // === JSON Fallback Daten ===
    const jsonVip = await readJsonFile('vip_registrations.json');
    const jsonNewsletter = await readJsonFile('newsletter_subscribers.json');
    const jsonBookings = await readJsonFile('contact_requests.json');

    const jsonStats = {
      vip: jsonVip.length,
      newsletter: jsonNewsletter.length,
      bookings: jsonBookings.length,
    };

    // Nimm das Maximum (DB oder JSON)
    const stats = {
      vip: Math.max(pgStats.vip, jsonStats.vip),
      newsletter: Math.max(pgStats.newsletter, jsonStats.newsletter),
      bookings: Math.max(pgStats.bookings, jsonStats.bookings),
      contacts: pgStats.contacts,
      companies: pgStats.companies,
      deals: pgStats.deals,
      events: pgStats.events,
      projects: pgStats.projects,
      cmsPages: pgStats.cmsPages,
    };

    return NextResponse.json({
      stats,
      pendingCounts,
      recentVip,
      recentBookings,
      recentNewsletter,
      dataSource: {
        dbConnected: pgStats.dbConnected,
        pgStats: { vip: pgStats.vip, newsletter: pgStats.newsletter, bookings: pgStats.bookings },
        jsonStats,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
