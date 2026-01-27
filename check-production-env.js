#!/usr/bin/env node

/**
 * Prüft alle Environment-Variablen für Production-Launch
 */

const fs = require('fs');
const path = require('path');

// Erwartete Werte vom Benutzer
const EXPECTED_VALUES = {
  RESEND_API_KEY: 're_an8y4Hrw_J5bcb33jndu9cb2avtyd87vB',
  RESEND_FROM_EMAIL: 'noreply@inclusions.zone',
  RESEND_ADMIN_EMAIL: 'info@inclusions.zone',
  GEMINI_API_KEY: 'AIzaSyBzJoEimC2cpaNIibF103zrZaPSFWZWdWg',
  NEXT_PUBLIC_SITE_URL: 'http://10.55.55.155' // Aktuelle Server-URL (später auf https://inclusions.zone ändern)
};

// Dateien zum Prüfen
const ENV_FILES = [
  '.env.production',
  '.env.server'
];

console.log('🔍 Prüfe Environment-Variablen für Production-Launch...\n');

let allValid = true;
const results = {};

// Lade Environment-Dateien
for (const envFile of ENV_FILES) {
  const filePath = path.join(process.cwd(), envFile);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  ${envFile} nicht gefunden`);
    continue;
  }

  console.log(`\n📄 Prüfe ${envFile}:`);
  console.log('─'.repeat(60));
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const envVars = {};
  
  // Parse Environment-Variablen
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const match = trimmed.match(/^([A-Z_]+)=(.*)$/);
      if (match) {
        const [, key, value] = match;
        envVars[key] = value;
      }
    }
  }
  
  results[envFile] = {};
  
  // Prüfe jede Variable
  for (const [key, expectedValue] of Object.entries(EXPECTED_VALUES)) {
    const actualValue = envVars[key];
    const exists = actualValue !== undefined;
    const matches = actualValue === expectedValue;
    
    results[envFile][key] = { exists, matches, actualValue, expectedValue };
    
    if (!exists) {
      console.log(`❌ ${key}: NICHT GEFUNDEN`);
      allValid = false;
    } else if (!matches) {
      console.log(`⚠️  ${key}: WERT STIMMT NICHT ÜBEREIN`);
      console.log(`   Erwartet: ${expectedValue}`);
      console.log(`   Gefunden: ${actualValue}`);
      allValid = false;
    } else {
      // Zeige nur ersten Teil des Keys für Sicherheit
      const displayValue = key.includes('KEY') 
        ? `${actualValue.substring(0, 15)}...` 
        : actualValue;
      console.log(`✅ ${key}: ${displayValue}`);
    }
  }
  
  // Prüfe NEXT_PUBLIC_SITE_URL Format
  const siteUrl = envVars.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) {
    if (siteUrl.includes('10.55.55.155')) {
      console.log(`\nℹ️  INFO: NEXT_PUBLIC_SITE_URL verwendet Server-IP (aktueller Zustand)`);
      console.log(`   Aktuell: ${siteUrl}`);
      console.log(`   Für öffentlichen Launch später auf: https://inclusions.zone ändern`);
    } else if (siteUrl.startsWith('http://') && !siteUrl.includes('localhost')) {
      console.log(`\n⚠️  WARNUNG: NEXT_PUBLIC_SITE_URL verwendet HTTP statt HTTPS`);
      console.log(`   Aktuell: ${siteUrl}`);
      console.log(`   Empfohlen: HTTPS für Production`);
    }
  }
}

// Zusammenfassung
console.log('\n' + '='.repeat(60));
console.log('📊 ZUSAMMENFASSUNG');
console.log('='.repeat(60));

if (allValid) {
  console.log('✅ Alle Environment-Variablen sind korrekt gesetzt!');
} else {
  console.log('❌ Einige Environment-Variablen müssen korrigiert werden.');
}

// Prüfe Format der Keys
console.log('\n🔐 Format-Prüfung:');
console.log('─'.repeat(60));

const resendKey = results['.env.production']?.RESEND_API_KEY?.actualValue || 
                  results['.env.server']?.RESEND_API_KEY?.actualValue;
if (resendKey) {
  if (resendKey.startsWith('re_') && resendKey.length > 20) {
    console.log('✅ RESEND_API_KEY: Format sieht korrekt aus');
  } else {
    console.log('⚠️  RESEND_API_KEY: Format könnte falsch sein (sollte mit "re_" beginnen)');
  }
}

const geminiKey = results['.env.production']?.GEMINI_API_KEY?.actualValue || 
                  results['.env.server']?.GEMINI_API_KEY?.actualValue;
if (geminiKey) {
  if (geminiKey.startsWith('AIzaSy') && geminiKey.length > 30) {
    console.log('✅ GEMINI_API_KEY: Format sieht korrekt aus');
  } else {
    console.log('⚠️  GEMINI_API_KEY: Format könnte falsch sein (sollte mit "AIzaSy" beginnen)');
  }
}

// E-Mail-Format-Prüfung
const fromEmail = results['.env.production']?.RESEND_FROM_EMAIL?.actualValue || 
                  results['.env.server']?.RESEND_FROM_EMAIL?.actualValue;
if (fromEmail) {
  if (fromEmail.includes('@inclusions.zone')) {
    console.log('✅ RESEND_FROM_EMAIL: Domain korrekt');
  } else {
    console.log('⚠️  RESEND_FROM_EMAIL: Domain könnte falsch sein');
  }
}

const adminEmail = results['.env.production']?.RESEND_ADMIN_EMAIL?.actualValue || 
                   results['.env.server']?.RESEND_ADMIN_EMAIL?.actualValue;
if (adminEmail) {
  if (adminEmail.includes('@inclusions.zone')) {
    console.log('✅ RESEND_ADMIN_EMAIL: Domain korrekt');
  } else {
    console.log('⚠️  RESEND_ADMIN_EMAIL: Domain könnte falsch sein');
  }
}

console.log('\n' + '='.repeat(60));
console.log('📝 NÄCHSTE SCHRITTE:');
console.log('='.repeat(60));
console.log('1. Stelle sicher, dass alle Variablen auch in Netlify gesetzt sind');
console.log('2. Prüfe die Test-Endpunkte:');
console.log('   - /api/test-email?email=deine@email.com');
console.log('   - /api/test-gemini-key');
console.log('3. Teste die E-Mail-Funktionalität mit einem echten Formular');
console.log('4. Teste den Voice Agent (INCLUSI) auf der Hauptseite');
console.log('5. Aktuell läuft die Seite auf: http://10.55.55.155');
console.log('6. Für öffentlichen Launch: NEXT_PUBLIC_SITE_URL auf https://inclusions.zone ändern');

if (!allValid) {
  process.exit(1);
}
