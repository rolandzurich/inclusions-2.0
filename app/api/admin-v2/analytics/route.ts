export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

const UMAMI_URL = process.env.NEXT_PUBLIC_UMAMI_URL || process.env.UMAMI_API_URL;
const UMAMI_WEBSITE_ID = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
const UMAMI_API_KEY = process.env.UMAMI_API_KEY; // Optional: API Token for auth

/**
 * Analytics API – Proxy zu Umami
 * Holt Traffic-Daten und liefert sie an das Admin-Dashboard
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '24h'; // 24h, 7d, 30d, 90d
    const endpoint = searchParams.get('endpoint') || 'stats'; // stats, pageviews, metrics, active

    // Prüfe ob Umami konfiguriert ist
    if (!UMAMI_URL || !UMAMI_WEBSITE_ID) {
      return NextResponse.json({
        configured: false,
        message: 'Umami Analytics ist noch nicht konfiguriert',
        setup: {
          steps: [
            'Docker-Container starten: cd backend && docker compose up -d',
            'Umami Dashboard öffnen: http://10.55.55.155:3002',
            'Website registrieren und Website-ID kopieren',
            'In .env.local eintragen: NEXT_PUBLIC_UMAMI_URL und NEXT_PUBLIC_UMAMI_WEBSITE_ID',
            'Optional: UMAMI_API_KEY für API-Zugriff',
          ],
          envVars: {
            NEXT_PUBLIC_UMAMI_URL: 'http://10.55.55.155:3002',
            NEXT_PUBLIC_UMAMI_WEBSITE_ID: '<deine-website-id>',
            UMAMI_API_KEY: '<optional-api-token>',
          },
        },
      });
    }

    // Zeitraum berechnen
    const now = new Date();
    let startAt: Date;
    switch (period) {
      case '24h':
        startAt = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startAt = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startAt = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startAt = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startAt = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };

    if (UMAMI_API_KEY) {
      headers['x-umami-api-key'] = UMAMI_API_KEY;
    }

    const baseUrl = `${UMAMI_URL}/api/websites/${UMAMI_WEBSITE_ID}`;
    const timeParams = `startAt=${startAt.getTime()}&endAt=${now.getTime()}`;

    // Verschiedene Endpunkte abfragen
    if (endpoint === 'all') {
      // Alle Daten auf einmal holen
      const [statsRes, pageviewsRes, metricsUrlRes, metricsRefRes, metricsBrowserRes, metricsDeviceRes, metricsCountryRes, activeRes] = await Promise.allSettled([
        fetch(`${baseUrl}/stats?${timeParams}`, { headers }),
        fetch(`${baseUrl}/pageviews?${timeParams}&unit=${period === '24h' ? 'hour' : 'day'}`, { headers }),
        fetch(`${baseUrl}/metrics?${timeParams}&type=url`, { headers }),
        fetch(`${baseUrl}/metrics?${timeParams}&type=referrer`, { headers }),
        fetch(`${baseUrl}/metrics?${timeParams}&type=browser`, { headers }),
        fetch(`${baseUrl}/metrics?${timeParams}&type=device`, { headers }),
        fetch(`${baseUrl}/metrics?${timeParams}&type=country`, { headers }),
        fetch(`${baseUrl}/active`, { headers }),
      ]);

      const getData = async (res: PromiseSettledResult<Response>) => {
        if (res.status === 'fulfilled' && res.value.ok) {
          return await res.value.json();
        }
        return null;
      };

      return NextResponse.json({
        configured: true,
        period,
        stats: await getData(statsRes),
        pageviews: await getData(pageviewsRes),
        topPages: await getData(metricsUrlRes),
        referrers: await getData(metricsRefRes),
        browsers: await getData(metricsBrowserRes),
        devices: await getData(metricsDeviceRes),
        countries: await getData(metricsCountryRes),
        activeVisitors: await getData(activeRes),
        umamiUrl: UMAMI_URL,
      });
    }

    // Einzelner Endpunkt
    let url: string;
    switch (endpoint) {
      case 'active':
        url = `${baseUrl}/active`;
        break;
      case 'pageviews':
        url = `${baseUrl}/pageviews?${timeParams}&unit=${period === '24h' ? 'hour' : 'day'}`;
        break;
      case 'metrics':
        const type = searchParams.get('type') || 'url';
        url = `${baseUrl}/metrics?${timeParams}&type=${type}`;
        break;
      default:
        url = `${baseUrl}/stats?${timeParams}`;
    }

    const res = await fetch(url, { headers, next: { revalidate: 60 } });

    if (!res.ok) {
      return NextResponse.json({
        configured: true,
        error: `Umami API Fehler: ${res.status} ${res.statusText}`,
        umamiUrl: UMAMI_URL,
      }, { status: res.status });
    }

    const data = await res.json();

    return NextResponse.json({
      configured: true,
      period,
      endpoint,
      data,
      umamiUrl: UMAMI_URL,
    });
  } catch (error: any) {
    return NextResponse.json({
      configured: !!UMAMI_URL && !!UMAMI_WEBSITE_ID,
      error: error.message,
      hint: 'Umami ist möglicherweise nicht erreichbar. Prüfe ob der Docker-Container läuft.',
    }, { status: 500 });
  }
}
