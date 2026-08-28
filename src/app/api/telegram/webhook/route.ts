import { handleUpdate, type TelegramUpdate } from '@/lib/telegram/handler';
import { sendMessage } from '@/lib/telegram/api';

/** Ответ модели занимает несколько секунд — стандартных 10 с может не хватить. */
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  // Адрес вебхука публичный, поэтому проверяем секрет, который знают
  // только Telegram и мы (задаётся при регистрации вебхука).
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (secret && request.headers.get('x-telegram-bot-api-secret-token') !== secret) {
    return new Response('forbidden', { status: 403 });
  }

  let update: TelegramUpdate;
  try {
    update = (await request.json()) as TelegramUpdate;
  } catch {
    return new Response('bad request', { status: 400 });
  }

  try {
    await handleUpdate(update);
  } catch (error) {
    console.error('[webhook] ошибка обработки апдейта:', error);

    // Сообщаем клиенту, что что-то пошло не так, — молчащий бот хуже честной ошибки.
    const chatId = update.message?.chat.id;
    if (chatId) {
      try {
        await sendMessage(
          chatId,
          'Извините, произошла техническая ошибка. Попробуйте написать ещё раз или позвоните нам.',
        );
      } catch {
        /* уже ничем не поможем */
      }
    }
  }

  // Всегда 200: иначе Telegram будет повторять доставку по кругу.
  return new Response('ok');
}
