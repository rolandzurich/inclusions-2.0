/**
 * Auth-System für Inclusions Admin & Crew
 * 
 * Verwendet:
 * - jose (Web Crypto API) für JWT-Tokens
 * - bcryptjs für Passwort-Hashing
 * - PostgreSQL users-Tabelle für User-Verwaltung
 * 
 * Rollen:
 * - admin: Volles Backend (/admin-v2/*)
 * - crew:  Kalender & Events (/crew/*)
 * 
 * Tokens werden als httpOnly-Cookie gespeichert.
 */

import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from './db-postgres';

// ============================================
// Typen
// ============================================

export type UserRole = 'admin' | 'crew';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
}

export interface AuthPayload extends JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  name?: string;
}

// ============================================
// Konstanten
// ============================================

const COOKIE_NAME = 'inclusions_admin_token';
const TOKEN_EXPIRY = '24h';
const BCRYPT_ROUNDS = 12;

// ============================================
// Hilfsfunktionen
// ============================================

function getSigningKey(): Uint8Array {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      'ADMIN_SESSION_SECRET nicht konfiguriert oder zu kurz (mind. 32 Zeichen). ' +
      'Setze ADMIN_SESSION_SECRET in .env.local'
    );
  }
  return new TextEncoder().encode(secret);
}

// ============================================
// Passwort-Funktionen (bcrypt)
// ============================================

/**
 * Hasht ein Passwort mit bcrypt (12 Runden).
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

/**
 * Vergleicht ein Klartext-Passwort mit einem bcrypt-Hash.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ============================================
// User-DB-Funktionen
// ============================================

/**
 * Sucht einen User in der DB anhand der E-Mail.
 * Gibt null zurück wenn nicht gefunden.
 */
export async function getUserByEmail(email: string): Promise<AuthUser & { password_hash: string; status: string } | null> {
  const result = await query(
    `SELECT id, email, name, password_hash, role, status 
     FROM users 
     WHERE email = $1`,
    [email.toLowerCase().trim()]
  );

  if (result.error || !result.data || result.data.length === 0) {
    return null;
  }

  const user = result.data[0];
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    password_hash: user.password_hash,
    role: user.role as UserRole,
    status: user.status,
  };
}

/**
 * Aktualisiert den letzten Login-Zeitpunkt.
 */
export async function updateLastLogin(userId: string): Promise<void> {
  await query(
    `UPDATE users SET last_login_at = NOW() WHERE id = $1`,
    [userId]
  );
}

/**
 * Bestimmt die Rolle eines Users.
 * Prüft zuerst die DB, dann Fallback auf .env (Abwärtskompatibilität).
 */
export function getUserRole(email: string): UserRole {
  // Fallback für env-basierte Rollen (Abwärtskompatibilität)
  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);

  const normalizedEmail = email.toLowerCase().trim();

  if (adminEmails.includes(normalizedEmail)) return 'admin';
  return 'crew';
}

// ============================================
// JWT-Token Funktionen
// ============================================

/**
 * Erstellt einen signierten JWT-Token mit User-ID und Rolle.
 */
export async function createToken(user: AuthUser): Promise<string> {
  const key = getSigningKey();

  return new SignJWT({
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  } as AuthPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .setIssuer('inclusions-admin')
    .sign(key);
}

/**
 * Verifiziert einen JWT-Token und gibt die Payload zurück.
 */
export async function verifyToken(token: string): Promise<AuthPayload | null> {
  try {
    const key = getSigningKey();
    const { payload } = await jwtVerify(token, key, {
      issuer: 'inclusions-admin',
    });
    return payload as AuthPayload;
  } catch {
    return null;
  }
}

// ============================================
// Cookie-Funktionen
// ============================================

export function setAuthCookie(response: NextResponse, token: string): void {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 Stunden
  });
}

export function clearAuthCookie(response: NextResponse): void {
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

export function getTokenFromRequest(request: NextRequest): string | null {
  return request.cookies.get(COOKIE_NAME)?.value || null;
}

export async function getTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value || null;
}

// ============================================
// Auth-Prüfung
// ============================================

export async function authenticateRequest(
  request: NextRequest
): Promise<AuthPayload | null> {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  return verifyToken(token);
}

export async function getCurrentUser(): Promise<AuthPayload | null> {
  const token = await getTokenFromCookies();
  if (!token) return null;
  return verifyToken(token);
}

// ============================================
// Legacy-Kompatibilität
// ============================================

/**
 * Validiert ein Passwort gegen die .env-Variable.
 * Wird als Fallback genutzt wenn die users-Tabelle noch nicht existiert.
 */
export function validatePassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;
  return password === adminPassword;
}

/**
 * Prüft ob eine E-Mail erlaubt ist (DB oder .env Fallback).
 */
export function isAllowedEmail(email: string): boolean {
  return getUserRole(email) !== 'crew' || true; // Jetzt sind alle Rollen erlaubt
}

// ============================================
// Export
// ============================================
export { COOKIE_NAME };
