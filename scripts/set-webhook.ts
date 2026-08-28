import { randomBytes } from 'node:crypto';

import { config } from 'dotenv';

config({ path: '.env.local' });

/**
 * Регистрирует вебхук бота.
 *
 * Запускать после деплоя (адрес должен быть публичным и по https):
 *   npm run tg:webhook
 *   npm run tg:webhook -- https://ваш-проект.vercel.app
 */
async function main() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.error('Не задан TELEGRAM_BOT_TOKEN в .env.local (получите его у @BotFather)');
    process.exit(1);
  }

  const baseUrl = (process.argv[2] ?? process.env.NEXT_PUBLIC_SITE_URL ?? '').replace(/\/$/, '');

  if (!baseUrl.startsWith('https://')) {
    console.error(
      [
        'Нужен публичный адрес по https.',
        'Telegram не умеет отправлять вебхуки на localhost.',
        '',
        'Сначала задеплойте проект на Vercel, затем запустите:',
        '  npm run tg:webhook -- https://ваш-проект.vercel.app',
      ].join('\n'),
    );
    process.exit(1);
  }

  let secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!secret) {
    secret = randomBytes(24).toString('hex');
    console.log('\nСекрет вебхука не задан — сгенерирован новый.');
    console.log('Впишите его в .env.local И в переменные окружения на Vercel:\n');
    console.log(`  TELEGRAM_WEBHOOK_SECRET=${secret}\n`);
  }

  const url = `${baseUrl}/api/telegram/webhook`;

  const response = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url,
      secret_token: secret,
      allowed_updates: ['message'],
      drop_pending_updates: true,
    }),
  });

  const result = (await response.json()) as { ok: boolean; description?: string };

  if (!result.ok) {
    console.error(`Не удалось зарегистрировать вебхук: ${result.description}`);
    process.exit(1);
  }

  console.log(`Вебхук зарегистрирован: ${url}`);

  const infoResponse = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
  const info = (await infoResponse.json()) as { result?: Record<string, unknown> };
  console.log('\nСостояние вебхука:');
  console.log(info.result);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
