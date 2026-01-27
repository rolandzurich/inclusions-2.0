#!/usr/bin/env node

/**
 * Debug-Skript für Newsletter-E-Mail-Versand
 * Prüft Resend-Konfiguration und testet E-Mail-Versand
 */

const https = require('https');
const http = require('http');

const SERVER_URL = process.env.SERVER_URL || 'http://10.55.55.155';
const TEST_EMAIL = process.argv[2] || 'test@example.com';

console.log('🔍 Newsletter E-Mail-Versand Debug\n');
console.log('='.repeat(60));

// 1. Prüfe Environment-Variablen
console.log('\n1️⃣ Prüfe Environment-Variablen auf Server...\n');

const checkEnv = () => {
  return new Promise((resolve, reject) => {
    const url = new URL(`${SERVER_URL}/api/test-gemini-key`);
    const protocol = url.protocol === 'https:' ? https : http;
    
    protocol.get(url.toString(), (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('✅ Server erreichbar');
          resolve(result);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
};

// 2. Teste Newsletter-Anmeldung
const testNewsletter = () => {
  return new Promise((resolve, reject) => {
    const url = new URL(`${SERVER_URL}/api/newsletter`);
    const protocol = url.protocol === 'https:' ? https : http;
    
    const postData = JSON.stringify({
      email: TEST_EMAIL,
      first_name: 'Test',
      last_name: 'User',
      has_disability: false,
      interests: ['Events'],
      honeypot: ''
    });
    
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = protocol.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve({ status: res.statusCode, data: result });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
};

// 3. Prüfe Resend-Konfiguration direkt
const checkResendConfig = async () => {
  console.log('\n2️⃣ Prüfe Resend-Konfiguration...\n');
  
  // Lese .env.production
  const fs = require('fs');
  const path = require('path');
  
  const envFile = path.join(__dirname, '.env.production');
  if (fs.existsSync(envFile)) {
    const content = fs.readFileSync(envFile, 'utf-8');
    const lines = content.split('\n');
    
    let resendKey = null;
    let fromEmail = null;
    let adminEmail = null;
    
    for (const line of lines) {
      if (line.startsWith('RESEND_API_KEY=')) {
        resendKey = line.split('=')[1];
      } else if (line.startsWith('RESEND_FROM_EMAIL=')) {
        fromEmail = line.split('=')[1];
      } else if (line.startsWith('RESEND_ADMIN_EMAIL=')) {
        adminEmail = line.split('=')[1];
      }
    }
    
    console.log(`RESEND_API_KEY: ${resendKey ? `${resendKey.substring(0, 15)}...` : '❌ NICHT GEFUNDEN'}`);
    console.log(`RESEND_FROM_EMAIL: ${fromEmail || '❌ NICHT GEFUNDEN'}`);
    console.log(`RESEND_ADMIN_EMAIL: ${adminEmail || '❌ NICHT GEFUNDEN'}`);
    
    if (!resendKey || resendKey === 're_your-resend-api-key-here') {
      console.log('\n⚠️  WARNUNG: RESEND_API_KEY ist nicht gesetzt oder ist ein Platzhalter!');
      return false;
    }
    
    return true;
  } else {
    console.log('⚠️  .env.production nicht gefunden');
    return false;
  }
};

// Hauptfunktion
(async () => {
  try {
    // Prüfe lokale Konfiguration
    const configOk = await checkResendConfig();
    
    if (!configOk) {
      console.log('\n❌ Resend-Konfiguration ist nicht korrekt!');
      console.log('\n📝 Nächste Schritte:');
      console.log('1. Prüfe .env.production Datei');
      console.log('2. Stelle sicher, dass RESEND_API_KEY gesetzt ist');
      console.log('3. Prüfe ob die Variablen auch auf dem Server gesetzt sind');
      process.exit(1);
    }
    
    // Teste Server-Verbindung
    console.log('\n3️⃣ Teste Server-Verbindung...\n');
    await checkEnv();
    
    // Teste Newsletter-Anmeldung
    console.log('\n4️⃣ Teste Newsletter-Anmeldung...\n');
    console.log(`Sende Test-Anmeldung an: ${TEST_EMAIL}`);
    
    const result = await testNewsletter();
    
    console.log(`\nStatus Code: ${result.status}`);
    console.log('Response:', JSON.stringify(result.data, null, 2));
    
    if (result.status === 200 && result.data.success) {
      console.log('\n✅ Newsletter-Anmeldung erfolgreich!');
      console.log('\n📧 Prüfe jetzt:');
      console.log(`1. E-Mail-Postfach von ${TEST_EMAIL} (Bestätigungsmail)`);
      console.log('2. E-Mail-Postfach von info@inclusions.zone (Notification)');
      console.log('3. Server-Logs für Fehler');
      console.log('\n💡 Falls keine E-Mails ankommen:');
      console.log('   - Prüfe Spam-Ordner');
      console.log('   - Prüfe Resend-Dashboard: https://resend.com/emails');
      console.log('   - Prüfe Server-Logs: ssh incluzone@10.55.55.155 "tail -f /tmp/next.log"');
    } else {
      console.log('\n❌ Newsletter-Anmeldung fehlgeschlagen!');
      console.log('Fehler:', result.data.message || result.data);
    }
    
  } catch (error) {
    console.error('\n❌ Fehler:', error.message);
    console.error('\n📝 Mögliche Ursachen:');
    console.error('1. Server ist nicht erreichbar');
    console.error('2. API-Endpunkt existiert nicht');
    console.error('3. Netzwerk-Problem');
    process.exit(1);
  }
})();
