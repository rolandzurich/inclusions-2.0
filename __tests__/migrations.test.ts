/**
 * Migrations-System Tests
 * 
 * Testet die Kernfunktionen des Migrations-Systems:
 * - Migrations-Dateien werden korrekt gelesen und sortiert
 * - Tracking-Logik (pending vs executed)
 * - Idempotenz: Bereits ausgeführte Migrationen werden übersprungen
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs/promises';
import path from 'path';

// Mock: db-postgres
vi.mock('@/lib/db-postgres', () => ({
  query: vi.fn(),
}));

describe('Migrations: Dateisystem', () => {
  const migrationsDir = path.join(process.cwd(), 'backend', 'migrations');

  it('Migrations-Verzeichnis existiert', async () => {
    const stat = await fs.stat(migrationsDir);
    expect(stat.isDirectory()).toBe(true);
  });

  it('enthält nummerierte SQL-Dateien', async () => {
    const files = await fs.readdir(migrationsDir);
    const sqlFiles = files.filter(f => f.endsWith('.sql') && !f.includes('.down.') && !f.startsWith('.'));
    
    expect(sqlFiles.length).toBeGreaterThanOrEqual(1);
    
    // Alle beginnen mit einer Nummer
    sqlFiles.forEach(f => {
      expect(f).toMatch(/^\d+/);
    });
  });

  it('Migrationen sind in korrekter Reihenfolge nummeriert', async () => {
    const files = await fs.readdir(migrationsDir);
    const numbers = files
      .filter(f => f.endsWith('.sql') && !f.includes('.down.') && !f.startsWith('.'))
      .map(f => parseInt(f.match(/^(\d+)/)?.[1] || '999'))
      .sort((a, b) => a - b);
    
    // Keine doppelten Nummern
    const unique = [...new Set(numbers)];
    expect(numbers).toEqual(unique);
  });

  it('jede UP-Migration hat eine DOWN-Datei', async () => {
    const files = await fs.readdir(migrationsDir);
    const upFiles = files.filter(f => f.endsWith('.sql') && !f.includes('.down.') && !f.startsWith('.'));
    const downFiles = files.filter(f => f.includes('.down.sql'));
    
    for (const up of upFiles) {
      const expectedDown = up.replace('.sql', '.down.sql');
      expect(downFiles).toContain(expectedDown);
    }
  });

  it('000_migration_system.sql existiert und enthält CREATE TABLE', async () => {
    const content = await fs.readFile(
      path.join(migrationsDir, '000_migration_system.sql'),
      'utf-8'
    );
    expect(content).toContain('CREATE TABLE IF NOT EXISTS _migrations');
    expect(content).toContain('name');
    expect(content).toContain('executed_at');
  });

  it('002_consolidate_schemas.sql enthält alle bekannten Fixes', async () => {
    const content = await fs.readFile(
      path.join(migrationsDir, '002_consolidate_schemas.sql'),
      'utf-8'
    );
    
    // Projects Fixes
    expect(content).toContain('name TO title');
    expect(content).toContain('company_id TO client_id');
    expect(content).toContain('budget_chf');
    expect(content).toContain('metadata');
    
    // RSVP Fixes
    expect(content).toContain('guest_email TO user_email');
    expect(content).toContain('guest_name TO user_name');
    
    // Alles ist idempotent
    expect(content).toContain('IF EXISTS');
    expect(content).toContain('IF NOT EXISTS');
  });
});

describe('Migrations: Runner-Logik', () => {
  let queryMock: any;

  beforeEach(async () => {
    vi.resetModules();
    const dbModule = await import('@/lib/db-postgres');
    queryMock = vi.mocked(dbModule.query);
    queryMock.mockReset();
  });

  it('getMigrationStatus gibt alle Migrationen mit Status zurück', async () => {
    // Mock: _migrations Tabelle erstellen
    queryMock.mockResolvedValueOnce({ data: null, error: null }); // ensureMigrationsTable
    
    // Mock: getExecutedMigrations
    queryMock.mockResolvedValueOnce({
      data: [{ name: '000_migration_system' }, { name: '001_baseline' }],
      error: null,
    });
    
    // Mock: Alle Migrations-Records
    queryMock.mockResolvedValueOnce({
      data: [
        { name: '000_migration_system', executed_at: '2025-01-01', success: true },
        { name: '001_baseline', executed_at: '2025-01-01', success: true },
      ],
      error: null,
    });

    const { getMigrationStatus } = await import('@/lib/migrations');
    const status = await getMigrationStatus();
    
    expect(status).toBeDefined();
    expect(Array.isArray(status)).toBe(true);
    
    // Mindestens unsere 3 Migrationen sollten auftauchen
    expect(status.length).toBeGreaterThanOrEqual(3);
    
    // 000 und 001 sollten executed sein
    const migration000 = status.find(m => m.name === '000_migration_system');
    expect(migration000?.status).toBe('executed');
    
    // Alle nicht-gemockten sollten pending sein
    const pendingMigrations = status.filter(m => m.status === 'pending');
    expect(pendingMigrations.length).toBeGreaterThanOrEqual(1);
  });

  it('runPendingMigrations gibt leer zurück wenn alles executed', async () => {
    // Mock: ensureMigrationsTable
    queryMock.mockResolvedValueOnce({ data: null, error: null });
    
    // Mock: getExecutedMigrations – alle Migrationen als "executed" markieren
    const dir = path.join(process.cwd(), 'backend', 'migrations');
    const migrationFiles = (await fs.readdir(dir))
      .filter(f => f.endsWith('.sql') && !f.includes('.down.') && !f.startsWith('.'))
      .map(f => ({ name: f.replace('.sql', '') }));
    
    queryMock.mockResolvedValueOnce({
      data: migrationFiles,
      error: null,
    });

    const { runPendingMigrations } = await import('@/lib/migrations');
    const { results, success } = await runPendingMigrations({ dryRun: true });
    
    expect(success).toBe(true);
    expect(results.length).toBe(0); // Nichts ausstehend
  });

  it('runPendingMigrations im Dry-Run listet ausstehende Migrationen', async () => {
    // Mock: ensureMigrationsTable
    queryMock.mockResolvedValueOnce({ data: null, error: null });
    
    // Mock: getExecutedMigrations (nur 000 ausgeführt)
    queryMock.mockResolvedValueOnce({
      data: [
        { name: '000_migration_system' },
      ],
      error: null,
    });

    const { runPendingMigrations } = await import('@/lib/migrations');
    const { results, success } = await runPendingMigrations({ dryRun: true });
    
    expect(success).toBe(true);
    expect(results.length).toBeGreaterThanOrEqual(2); // Mindestens 001 + 002 ausstehend
    results.forEach(r => {
      expect(r.message).toContain('DRY RUN');
    });
  });
});
