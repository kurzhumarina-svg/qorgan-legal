import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { ADMIN_COOKIE, verifySessionToken } from './auth';

/**
 * Проверка доступа к админке.
 *
 * Вызывается в начале каждой защищённой страницы. Сознательно не вынесено
 * в proxy.ts: в Next 16 proxy может выполняться на CDN отдельно от приложения,
 * а подпись куки удобнее проверять там же, где читаются данные.
 */
export async function requireAdmin(): Promise<void> {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;

  if (!verifySessionToken(token)) {
    redirect('/admin/login');
  }
}
