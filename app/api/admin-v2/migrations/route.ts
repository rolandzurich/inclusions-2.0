/**
 * GET  /api/admin-v2/migrations           → Status aller Migrationen + Backups
 * POST /api/admin-v2/migrations           → Ausstehende Migrationen ausführen
 * POST /api/admin-v2/migrations?action=rollback → Letzte Migration rückgängig machen
 * POST /api/admin-v2/migrations?action=backup   → Manuelles Backup erstellen
 * 
 * Query-Params:
 *   - dry_run=true     → Simuliert nur, führt nichts aus
 *   - action=rollback  → Rollback der letzten Migration
 *   - action=backup    → Manuelles DB-Backup erstellen
 */
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { 
  getMigrationStatus, 
  runPendingMigrations, 
  rollbackLastMigration,
  createBackup,
  getBackups 
} from '@/lib/migrations';

export async function GET() {
  try {
    const status = await getMigrationStatus();
    const pending = status.filter(m => m.status === 'pending').length;
    const executed = status.filter(m => m.status === 'executed').length;
    const errors = status.filter(m => m.status === 'error').length;
    const backups = await getBackups();
    
    return NextResponse.json({
      summary: { total: status.length, executed, pending, errors },
      migrations: status,
      backups: backups.map(b => ({
        name: b.name,
        created_at: b.created_at,
        size_kb: Math.round(b.size_bytes / 1024),
        trigger: b.trigger,
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const dryRun = searchParams.get('dry_run') === 'true';
    
    // ROLLBACK
    if (action === 'rollback') {
      const result = await rollbackLastMigration();
      return NextResponse.json({
        success: result.success,
        message: result.message,
        migration: result.migration,
        backup: result.backup ? {
          name: result.backup.name,
          size_kb: Math.round(result.backup.size_bytes / 1024),
        } : null,
      });
    }
    
    // MANUELLES BACKUP
    if (action === 'backup') {
      const result = await createBackup('manual');
      return NextResponse.json({
        success: result.success,
        message: result.success 
          ? `Backup erstellt: ${result.backup?.name}` 
          : `Backup fehlgeschlagen: ${result.error}`,
        backup: result.backup ? {
          name: result.backup.name,
          size_kb: Math.round(result.backup.size_bytes / 1024),
        } : null,
      });
    }
    
    // MIGRATIONEN AUSFÜHREN (Standard)
    const { results, success } = await runPendingMigrations({ dryRun });
    
    return NextResponse.json({
      success,
      dry_run: dryRun,
      message: results.length === 0 
        ? 'Keine ausstehenden Migrationen' 
        : `${results.filter(r => r.success).length}/${results.length} Migrationen ${dryRun ? 'simuliert' : 'ausgeführt'}`,
      results,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
