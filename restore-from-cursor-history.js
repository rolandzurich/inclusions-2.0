#!/usr/bin/env node
/**
 * Stellt Dateien aus Cursors Local History wieder her.
 * Sucht in: app/, lib/, components/, data/
 * Verwendet jeweils die neueste gespeicherte Version.
 *
 * Ausführen: node restore-from-cursor-history.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');

const DRY_RUN = process.argv.includes('--dry-run');
const HISTORY = path.join(process.env.HOME || '', 'Library/Application Support/Cursor/User/History');
const PROJECT = path.resolve(__dirname);

const ALLOWED_PREFIXES = ['app' + path.sep, 'lib' + path.sep, 'components' + path.sep, 'data' + path.sep];

function main() {
  if (!fs.existsSync(HISTORY)) {
    console.error('Cursor History-Ordner nicht gefunden:', HISTORY);
    process.exit(1);
  }

  const dirs = fs.readdirSync(HISTORY).filter((d) => {
    const p = path.join(HISTORY, d);
    try {
      return fs.statSync(p).isDirectory() && fs.existsSync(path.join(p, 'entries.json'));
    } catch {
      return false;
    }
  });

  const toRestore = [];

  for (const hash of dirs) {
    const entriesPath = path.join(HISTORY, hash, 'entries.json');
    let data;
    try {
      data = JSON.parse(fs.readFileSync(entriesPath, 'utf8'));
    } catch {
      continue;
    }

    const resource = data.resource;
    if (!resource || typeof resource !== 'string' || !resource.includes('inclusions-2.0')) continue;

    let filePath = resource.replace(/^file:\/\//, '');
    try {
      filePath = decodeURIComponent(filePath);
    } catch (_) {}
    if (!filePath.startsWith(PROJECT)) continue;

    const rel = path.relative(PROJECT, filePath);
    if (rel.startsWith('..') || path.isAbsolute(rel)) continue;

    const ok = ALLOWED_PREFIXES.some((p) => rel.startsWith(p));
    if (!ok) continue;

    const entries = data.entries;
    if (!Array.isArray(entries) || entries.length === 0) continue;

    const latest = entries.reduce((a, b) => (a.timestamp > b.timestamp ? a : b));
    const src = path.join(HISTORY, hash, latest.id);
    if (!fs.existsSync(src)) continue;

    toRestore.push({ filePath, rel, src });
  }

  // Nach Pfad sortieren für stabile Ausgabe
  toRestore.sort((a, b) => a.rel.localeCompare(b.rel));

  console.log(DRY_RUN ? '[DRY-RUN] Folgende Dateien würden wiederhergestellt:\n' : 'Stelle wieder her:\n');

  for (const { filePath, rel, src } of toRestore) {
    console.log('  ', rel);
    if (DRY_RUN) continue;

    const dir = path.dirname(filePath);
    try {
      fs.mkdirSync(dir, { recursive: true });
      fs.copyFileSync(src, filePath);
    } catch (e) {
      console.error('  Fehler:', e.message);
    }
  }

  console.log('\n' + (DRY_RUN ? 'Tipp: Ohne --dry-run ausführen zum tatsächlichen Wiederherstellen.' : 'Fertig.'));
}

main();
