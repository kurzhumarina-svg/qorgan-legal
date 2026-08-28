import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Простая сессия для админки: подписанная кука со сроком жизни.
 *
 * Уровень учебного проекта и этого достаточно для одного администратора.
 * Для реального продакшена сюда нужна полноценная аутентификация с учётными
 * записями — об этом отдельно сказано в README.
 */

export const ADMIN_COOKIE = 'qorgan_admin';
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 часов

function secret(): string {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 16) {
    throw new Error(
      'Не задан AUTH_SECRET (нужна длинная случайная строка). Проверьте .env.local',
    );
  }
  return value;
}

function sign(payload: string): string {
  return createHmac('sha256', secret()).update(payload).digest('hex');
}

export function checkPassword(candidate: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    throw new Error('Не задан ADMIN_PASSWORD. Проверьте .env.local');
  }
  const a = Buffer.from(candidate);
  const b = Buffer.from(expected);
  // Разная длина — сравнивать нечего, но выходим не раньше, чем при равной.
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function createSessionToken(now = Date.now()): string {
  const expiresAt = now + SESSION_TTL_MS;
  return `${expiresAt}.${sign(String(expiresAt))}`;
}

export function verifySessionToken(token: string | undefined, now = Date.now()): boolean {
  if (!token) return false;

  const [expiresAtRaw, signature] = token.split('.');
  if (!expiresAtRaw || !signature) return false;

  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt) || expiresAt < now) return false;

  const expected = sign(expiresAtRaw);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  path: '/',
  secure: process.env.NODE_ENV === 'production',
  maxAge: SESSION_TTL_MS / 1000,
} as const;
