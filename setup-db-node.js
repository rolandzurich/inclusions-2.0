#!/usr/bin/env node
/**
 * PostgreSQL Setup via Node.js SSH
 * Keine Terminal-Interaktion nötig!
 */

const { exec } = require('child_process');
const { readFileSync } = require('fs');
const { join } = require('path');

const SERVER = '10.55.55.155';
const USER = 'incluzone';
const PASS = '13vor12!Asdf';

console.log('🚀 PostgreSQL Setup startet...\n');

// Setup-Skript lesen
const setupScript = readFileSync(join(__dirname, 'postgresql-setup-server.sh'), 'utf-8');

// Kommando für direkte SSH-Ausführung
const sshCmd = `ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ${USER}@${SERVER} 'bash -s' << 'ENDSSH'\n${setupScript}\nENDSSH`;

console.log(`📡 Verbinde zu ${SERVER}...\n`);

const child = exec(sshCmd, { maxBuffer: 10 * 1024 * 1024 });

let output = '';

child.stdout.on('data', (data) => {
  output += data;
  process.stdout.write(data);
});

child.stderr.on('data', (data) => {
  output += data;
  process.stderr.write(data);
});

// Passwort automatisch eingeben
child.stdin.write(`${PASS}\n`);

child.on('close', (code) => {
  console.log('\n');
  
  if (code === 0 || output.includes('PostgreSQL vollständige Einrichtung')) {
    console.log('✅ PostgreSQL erfolgreich eingerichtet!\n');
    console.log('📊 Verbindungs-Details:');
    console.log(`   Host: ${SERVER}`);
    console.log('   Port: 5432');
    console.log('   Datenbank: inclusions_db');
    console.log('   User: inclusions_user\n');
    console.log('🌐 Starte jetzt den Dev-Server:');
    console.log('   npm run dev\n');
    console.log('   Dann öffne: http://localhost:3000/admin-v2/init-db\n');
  } else {
    console.log(`❌ Fehler beim Setup (Exit Code: ${code})\n`);
    console.log('Versuche manuell:');
    console.log(`   ssh ${USER}@${SERVER}`);
    console.log('   bash /tmp/postgresql-setup-server.sh\n');
  }
});

child.on('error', (error) => {
  console.error('❌ Fehler:', error.message);
  console.log('\n📝 Alternative: Manuelles Setup');
  console.log(`1. ssh ${USER}@${SERVER}`);
  console.log('2. Führe die Befehle aus postgresql-setup-server.sh aus');
});
