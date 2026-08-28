/** Тонкая обёртка над Bot API. Никакой библиотеки — нужно всего несколько методов. */

const API_ROOT = 'https://api.telegram.org';

function botToken(): string {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new Error(
      'Не задан TELEGRAM_BOT_TOKEN. Получите токен у @BotFather и впишите его в .env.local',
    );
  }
  return token;
}

type TelegramResponse<T> = { ok: true; result: T } | { ok: false; description: string };

export async function callTelegram<T>(
  method: string,
  payload: Record<string, unknown>,
): Promise<T> {
  const res = await fetch(`${API_ROOT}/bot${botToken()}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = (await res.json()) as TelegramResponse<T>;
  if (!data.ok) {
    throw new Error(`Telegram ${method}: ${data.description}`);
  }
  return data.result;
}

/** Экранирование для parse_mode: 'HTML' — текст приходит от клиента, доверять ему нельзя. */
export function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export async function sendMessage(
  chatId: number | string,
  text: string,
  options: Record<string, unknown> = {},
): Promise<void> {
  await callTelegram('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    link_preview_options: { is_disabled: true },
    ...options,
  });
}

export async function sendChatAction(chatId: number | string, action = 'typing'): Promise<void> {
  // Ошибка «печатает…» не должна ломать ответ — она косметическая.
  try {
    await callTelegram('sendChatAction', { chat_id: chatId, action });
  } catch {
    /* игнорируем */
  }
}
