import { eq } from 'drizzle-orm';

import { generateReply } from '@/lib/ai/client';
import { company, topicLabels } from '@/lib/content';
import { getDb } from '@/lib/db';
import { tgConversations, tgUpdates, type StoredMessage } from '@/lib/db/schema';
import { createLead } from '@/lib/leads';
import { botLeadSchema } from '@/lib/validation';

import { escapeHtml, sendChatAction, sendMessage } from './api';

/** Минимальная форма апдейта — берём только то, что реально используем. */
export type TelegramUpdate = {
  update_id: number;
  message?: {
    chat: { id: number };
    from?: { username?: string; first_name?: string };
    text?: string;
  };
};

const GREETING = `Здравствуйте! Это помощник юридической компании «${company.name}».

Опишите своими словами, что случилось, — я разберусь, к какому направлению относится ваш вопрос, задам пару уточнений и передам обращение юристу.

Сразу оговорюсь: я не заменяю консультацию юриста, не называю конкретные статьи закона и не обещаю исход дела.`;

const NON_TEXT_REPLY =
  'Пока я понимаю только текст. Опишите ситуацию сообщением — этого достаточно, документы прикладывать не нужно.';

/**
 * Обработка одного апдейта.
 *
 * Всё делается синхронно в рамках запроса: на Vercel функция живёт только пока
 * идёт обработка, поэтому «ответить 200 и доделать потом» здесь не сработает.
 */
export async function handleUpdate(update: TelegramUpdate): Promise<void> {
  if (await alreadyProcessed(update.update_id)) {
    console.info(`[telegram] апдейт ${update.update_id} уже обработан — пропускаем`);
    return;
  }

  const message = update.message;
  if (!message) return;

  const chatId = message.chat.id;

  if (!message.text) {
    await sendMessage(chatId, NON_TEXT_REPLY);
    return;
  }

  const text = message.text.trim();

  if (text === '/start') {
    await resetConversation(chatId);
    await sendMessage(chatId, GREETING);
    return;
  }

  await sendChatAction(chatId);

  const conversation = await loadConversation(chatId);
  const history: StoredMessage[] = [...conversation.messages, { role: 'user', text }];

  const reply = await generateReply(history);

  // Модель решила оформить обращение.
  if (reply.leadArgs !== null && conversation.leadId === null) {
    const created = await tryCreateLead(reply.leadArgs, chatId, message.from?.username);

    if (created) {
      const confirmation = leadConfirmation(created.name, created.topicLabel);
      await sendMessage(chatId, confirmation);
      await saveConversation(chatId, [...history, { role: 'assistant', text: confirmation }], created.id);
      return;
    }

    // Данных не хватило — просим недостающее, диалог продолжается.
    const ask = 'Почти готово. Подскажите, пожалуйста, как к вам обращаться и на какой номер телефона удобно ответить?';
    await sendMessage(chatId, ask);
    await saveConversation(chatId, [...history, { role: 'assistant', text: ask }], null);
    return;
  }

  // Обращение уже передано — второй раз не заводим.
  if (reply.leadArgs !== null && conversation.leadId !== null) {
    const already =
      'Ваше обращение уже передано юристу — он свяжется с вами. Если появились новые детали, напишите их здесь, я добавлю к обращению.';
    await sendMessage(chatId, already);
    await saveConversation(chatId, [...history, { role: 'assistant', text: already }], conversation.leadId);
    return;
  }

  const answer = reply.text || NON_TEXT_REPLY;
  await sendMessage(chatId, escapeHtml(answer));
  await saveConversation(chatId, [...history, { role: 'assistant', text: answer }], conversation.leadId);
}

function leadConfirmation(name: string, topic: string): string {
  return `Спасибо, ${escapeHtml(name)}! Обращение передано юристу ${escapeHtml(company.name)}.

Тема: ${escapeHtml(topic)}

Сотрудник свяжется с вами, уточнит формат консультации и при необходимости попросит дополнительные материалы. Стоимость обсуждается после первичного разбора ситуации.`;
}

/** Аргументы модели проходят ту же валидацию, что и форма на сайте. */
async function tryCreateLead(
  args: unknown,
  chatId: number,
  username: string | undefined,
): Promise<{ id: number; name: string; topicLabel: string } | null> {
  const parsed = botLeadSchema.safeParse(args);

  if (!parsed.success) {
    console.warn('[telegram] create_lead не прошёл валидацию:', parsed.error.issues);
    return null;
  }

  const { summary, ...leadInput } = parsed.data;

  const lead = await createLead({
    ...leadInput,
    source: 'telegram',
    aiSummary: summary,
    tgChatId: chatId,
    tgUsername: username ?? null,
  });

  return { id: lead.id, name: lead.name, topicLabel: topicLabels[lead.topic] };
}

/**
 * Дедупликация: Telegram повторяет доставку, если не получил 200 вовремя.
 * Первая вставка проходит, повторная упирается в первичный ключ и возвращает пусто.
 */
async function alreadyProcessed(updateId: number): Promise<boolean> {
  const inserted = await getDb()
    .insert(tgUpdates)
    .values({ updateId })
    .onConflictDoNothing()
    .returning({ updateId: tgUpdates.updateId });

  return inserted.length === 0;
}

async function loadConversation(
  chatId: number,
): Promise<{ messages: StoredMessage[]; leadId: number | null }> {
  const [row] = await getDb()
    .select()
    .from(tgConversations)
    .where(eq(tgConversations.chatId, chatId))
    .limit(1);

  return { messages: row?.messages ?? [], leadId: row?.leadId ?? null };
}

async function saveConversation(
  chatId: number,
  messages: StoredMessage[],
  leadId: number | null,
): Promise<void> {
  await getDb()
    .insert(tgConversations)
    .values({ chatId, messages, leadId })
    .onConflictDoUpdate({
      target: tgConversations.chatId,
      set: { messages, leadId, updatedAt: new Date() },
    });
}

async function resetConversation(chatId: number): Promise<void> {
  await saveConversation(chatId, [], null);
}
