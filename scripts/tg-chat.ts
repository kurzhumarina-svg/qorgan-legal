import io from 'node:fs';

import { config } from 'dotenv';

config({ path: '.env.local', quiet: true });

/**
 * Определяет ваш личный chat_id для уведомлений администратору.
 *
 * Надёжнее, чем сторонний бот: id берётся из реальных сообщений вашему боту,
 * а заодно подтверждается, что вы нажали Start — без этого Telegram не даст
 * боту написать вам первым, и уведомления молча не дойдут.
 *
 *   npm run tg:chat            — показать, кто писал боту
 *   npm run tg:chat -- --save  — записать найденный id в .env.local
 */
async function main() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.error('Не задан TELEGRAM_BOT_TOKEN в .env.local');
    process.exit(1);
  }

  const api = (method: string) => `https://api.telegram.org/bot${token}/${method}`;

  const me = await (await fetch(api('getMe'))).json();
  if (!me.ok) {
    console.error(`Токен не принят: ${me.description}`);
    process.exit(1);
  }
  console.log(`Бот: @${me.result.username} (id ${me.result.id})\n`);

  const hook = await (await fetch(api('getWebhookInfo'))).json();
  if (hook.ok && hook.result?.url) {
    console.log(
      `Внимание: зарегистрирован вебхук ${hook.result.url}\n` +
        'Пока он активен, Telegram отдаёт сообщения только туда, и этот скрипт их не увидит.\n' +
        'Это нормально после деплоя — id к тому моменту уже должен быть в .env.local.\n',
    );
    return;
  }

  const updates = await (await fetch(api('getUpdates?limit=100'))).json();
  if (!updates.ok) {
    console.error(`Ошибка getUpdates: ${updates.description}`);
    process.exit(1);
  }

  type Chat = { id: number; first_name?: string; username?: string };
  const found = new Map<number, Chat>();

  for (const update of updates.result as { message?: { chat: Chat } }[]) {
    const chat = update.message?.chat;
    if (chat && chat.id !== me.result.id) found.set(chat.id, chat);
  }

  if (found.size === 0) {
    console.log('Боту ещё никто не писал.\n');
    console.log(`Откройте https://t.me/${me.result.username}, нажмите Start`);
    console.log('и напишите любое сообщение. Затем запустите команду ещё раз.\n');
    return;
  }

  console.log('Боту писали:\n');
  for (const chat of found.values()) {
    const name = [chat.first_name, chat.username && `@${chat.username}`].filter(Boolean).join(' ');
    console.log(`   ${chat.id}   ${name}`);
  }

  const first = [...found.values()][0];

  if (process.argv.includes('--save') && found.size === 1) {
    const path = '.env.local';
    const text = io
      .readFileSync(path, 'utf8')
      .replace(/^TELEGRAM_ADMIN_CHAT_ID=.*$/m, `TELEGRAM_ADMIN_CHAT_ID=${first.id}`);
    io.writeFileSync(path, text);
    console.log(`\nЗаписано в .env.local: TELEGRAM_ADMIN_CHAT_ID=${first.id}\n`);
    return;
  }

  console.log(`\nВпишите в .env.local:\n\n  TELEGRAM_ADMIN_CHAT_ID=${first.id}\n`);
  if (found.size === 1) console.log('Или запустите: npm run tg:chat -- --save\n');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
