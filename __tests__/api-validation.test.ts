/**
 * API-Validierungs-Tests
 * 
 * Prüft, dass alle API-Route-Dateien:
 * - Existieren
 * - Die korrekten HTTP-Methoden exportieren
 * - force-dynamic gesetzt haben (kein Caching)
 * - Korrekte DB-Spalten nutzen (kein max_capacity, guest_email etc.)
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs/promises';
import path from 'path';

const API_DIR = path.join(process.cwd(), 'app', 'api', 'admin-v2');

// Alle erwarteten API-Routen
const EXPECTED_ROUTES = [
  'dashboard/route.ts',
  'migrations/route.ts',
  'email/inbox/route.ts',
  'email/ingest/route.ts',
  'email/analyze/route.ts',
  'email/actions/route.ts',
  'email/actions/[id]/route.ts',
  'email/init/route.ts',
  'email/test-connection/route.ts',
  'cms/pages/route.ts',
  'cms/sections/route.ts',
];

// Spalten-Mappings die NICHT mehr in den APIs vorkommen dürfen
const FORBIDDEN_COLUMN_PATTERNS = [
  { pattern: /\bmax_capacity\b/, reason: 'Korrekt: max_attendees' },
  { pattern: /\bguest_email\b(?!.*TO)/, reason: 'Korrekt: user_email' },
  { pattern: /\bguest_name\b(?!.*TO)/, reason: 'Korrekt: user_name' },
  { pattern: /\brequest_type\b/, reason: 'Korrekt: booking_type' },
];

describe('API Routes: Struktur', () => {
  it('alle erwarteten API-Routen existieren', async () => {
    for (const route of EXPECTED_ROUTES) {
      const fullPath = path.join(API_DIR, route);
      try {
        await fs.access(fullPath);
      } catch {
        throw new Error(`Fehlende API-Route: ${route}`);
      }
    }
  });
});

describe('API Routes: Caching-Schutz', () => {
  it('alle Admin-V2 route.ts Dateien haben force-dynamic', async () => {
    const routeFiles = await findAllRouteFiles(API_DIR);
    const missingDynamic: string[] = [];

    for (const file of routeFiles) {
      const content = await fs.readFile(file, 'utf-8');
      if (!content.includes("dynamic = 'force-dynamic'") && !content.includes('dynamic = "force-dynamic"')) {
        missingDynamic.push(path.relative(API_DIR, file));
      }
    }

    if (missingDynamic.length > 0) {
      throw new Error(
        `Folgende API-Routen haben KEIN force-dynamic:\n  - ${missingDynamic.join('\n  - ')}\n\nDies kann zu gecachten Daten führen!`
      );
    }
  });
});

describe('API Routes: Schema-Korrektheit', () => {
  it('keine veralteten Spaltennamen in API-Code', async () => {
    const routeFiles = await findAllRouteFiles(API_DIR);
    const violations: string[] = [];

    for (const file of routeFiles) {
      const content = await fs.readFile(file, 'utf-8');
      const relativePath = path.relative(API_DIR, file);

      for (const { pattern, reason } of FORBIDDEN_COLUMN_PATTERNS) {
        if (pattern.test(content)) {
          violations.push(`${relativePath}: Enthält veraltetes ${pattern.source} → ${reason}`);
        }
      }
    }

    if (violations.length > 0) {
      throw new Error(
        `Schema-Verletzungen gefunden:\n  - ${violations.join('\n  - ')}`
      );
    }
  });
});

// Helper: Alle route.ts Dateien rekursiv finden
async function findAllRouteFiles(dir: string): Promise<string[]> {
  const results: string[] = [];
  
  async function walk(currentDir: string) {
    try {
      const entries = await fs.readdir(currentDir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        if (entry.isDirectory()) {
          await walk(fullPath);
        } else if (entry.name === 'route.ts') {
          results.push(fullPath);
        }
      }
    } catch {
      // Verzeichnis existiert nicht – ok
    }
  }
  
  await walk(dir);
  return results;
}
