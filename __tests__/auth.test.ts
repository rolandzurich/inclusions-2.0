/**
 * Auth-System Tests
 * 
 * Testet die Kernfunktionen des Auth-Systems:
 * - Token erstellen und verifizieren
 * - Rollen-Erkennung
 * - Passwort-Validierung
 * - E-Mail-Erlaubnis
 */

import { describe, it, expect, beforeAll } from 'vitest';

// Env-Variablen setzen BEVOR Module importiert werden
beforeAll(() => {
  process.env.ADMIN_SESSION_SECRET = 'test-secret-minimum-32-characters-long-for-testing';
  process.env.ADMIN_PASSWORD = 'TestPassword123!';
  process.env.ADMIN_EMAILS = 'admin@inclusions.zone,info@inclusions.zone';
  process.env.CREW_EMAILS = 'crew@inclusions.zone';
  process.env.PARTNER_EMAILS = 'partner@example.com';
});

describe('Auth: Token-Erstellung und Verifizierung', () => {
  it('erstellt einen gültigen JWT-Token', async () => {
    const { createToken, verifyToken } = await import('@/lib/auth');

    const token = await createToken({
      email: 'admin@inclusions.zone',
      role: 'admin',
    });

    expect(token).toBeTruthy();
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3); // JWT hat 3 Teile
  });

  it('verifiziert einen gültigen Token', async () => {
    const { createToken, verifyToken } = await import('@/lib/auth');

    const token = await createToken({
      email: 'admin@inclusions.zone',
      role: 'admin',
    });

    const payload = await verifyToken(token);
    expect(payload).not.toBeNull();
    expect(payload?.email).toBe('admin@inclusions.zone');
    expect(payload?.role).toBe('admin');
  });

  it('lehnt einen ungültigen Token ab', async () => {
    const { verifyToken } = await import('@/lib/auth');

    const result = await verifyToken('invalid.token.here');
    expect(result).toBeNull();
  });

  it('lehnt einen manipulierten Token ab', async () => {
    const { createToken, verifyToken } = await import('@/lib/auth');

    const token = await createToken({
      email: 'admin@inclusions.zone',
      role: 'admin',
    });

    // Manipuliere den Payload-Teil
    const parts = token.split('.');
    parts[1] = 'manipuliert';
    const tampered = parts.join('.');

    const result = await verifyToken(tampered);
    expect(result).toBeNull();
  });
});

describe('Auth: Rollen-Erkennung', () => {
  it('erkennt Admin-Rolle', async () => {
    const { getUserRole } = await import('@/lib/auth');
    expect(getUserRole('admin@inclusions.zone')).toBe('admin');
    expect(getUserRole('info@inclusions.zone')).toBe('admin');
  });

  it('erkennt Crew-Rolle', async () => {
    const { getUserRole } = await import('@/lib/auth');
    expect(getUserRole('crew@inclusions.zone')).toBe('crew');
  });

  it('erkennt Partner-Rolle', async () => {
    const { getUserRole } = await import('@/lib/auth');
    expect(getUserRole('partner@example.com')).toBe('partner');
  });

  it('gibt unknown für unbekannte E-Mails', async () => {
    const { getUserRole } = await import('@/lib/auth');
    expect(getUserRole('random@gmail.com')).toBe('unknown');
  });

  it('ist case-insensitive', async () => {
    const { getUserRole } = await import('@/lib/auth');
    expect(getUserRole('ADMIN@INCLUSIONS.ZONE')).toBe('admin');
  });
});

describe('Auth: Passwort-Validierung', () => {
  it('akzeptiert korrektes Passwort', async () => {
    const { validatePassword } = await import('@/lib/auth');
    expect(validatePassword('TestPassword123!')).toBe(true);
  });

  it('lehnt falsches Passwort ab', async () => {
    const { validatePassword } = await import('@/lib/auth');
    expect(validatePassword('wrong')).toBe(false);
  });
});

describe('Auth: E-Mail-Erlaubnis', () => {
  it('erlaubt Admin-E-Mails', async () => {
    const { isAllowedEmail } = await import('@/lib/auth');
    expect(isAllowedEmail('admin@inclusions.zone')).toBe(true);
  });

  it('erlaubt Crew-E-Mails', async () => {
    const { isAllowedEmail } = await import('@/lib/auth');
    expect(isAllowedEmail('crew@inclusions.zone')).toBe(true);
  });

  it('blockiert unbekannte E-Mails', async () => {
    const { isAllowedEmail } = await import('@/lib/auth');
    expect(isAllowedEmail('hacker@evil.com')).toBe(false);
  });
});
