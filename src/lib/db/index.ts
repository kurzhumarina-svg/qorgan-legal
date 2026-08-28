import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

import * as schema from './schema';

type Database = ReturnType<typeof createDb>;

let instance: Database | null = null;

function createDb() {
  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error(
      'Не задана переменная DATABASE_URL. Скопируйте .env.example в .env.local и вставьте строку подключения из Neon.',
    );
  }

  // HTTP-драйвер Neon: каждый запрос отдельный, без долгоживущего соединения.
  // Именно это нужно на Vercel, где функция живёт только на время запроса.
  return drizzle(neon(url), { schema });
}

/**
 * Подключение создаётся при первом обращении, а не при импорте модуля.
 *
 * Иначе сборка проекта требовала бы боевых секретов: Next импортирует модули
 * страниц на этапе сборки, и отсутствие DATABASE_URL роняло бы `next build`.
 */
export function getDb(): Database {
  if (!instance) {
    instance = createDb();
  }
  return instance;
}

export { schema };
