import { z } from 'zod';

/**
 * Одна схема заявки на три потребителя:
 *   1) форма на сайте (проверка до отправки),
 *   2) POST /api/leads (проверка на сервере — клиенту доверять нельзя),
 *   3) аргументы функции create_lead, которую вызывает Telegram-бот.
 *
 * Благодаря этому бот физически не может создать заявку, которая не прошла бы
 * валидацию формы: правило описано один раз.
 */

export const TOPICS = [
  'contract',
  'debt',
  'pretrial',
  'litigation',
  'family',
  'business',
  'other',
] as const;

export const CLIENT_TYPES = ['individual', 'business'] as const;
export const URGENCIES = ['today', 'days', 'not_urgent'] as const;
export const DOCUMENT_STATES = ['yes', 'partial', 'no', 'unknown'] as const;
export const CONTACT_METHODS = ['telegram', 'whatsapp', 'call'] as const;

/** Телефон в свободной форме: +7, 8, пробелы, скобки и дефисы. Нормализуем позже. */
const phoneRegex = /^[+]?[\d\s()-]{7,20}$/;

export const leadInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Укажите, как к вам обращаться')
    .max(80, 'Слишком длинное имя'),
  phone: z
    .string()
    .trim()
    .regex(phoneRegex, 'Проверьте номер телефона'),
  clientType: z.enum(CLIENT_TYPES, { message: 'Выберите, кто обращается' }),
  topic: z.enum(TOPICS, { message: 'Выберите тему обращения' }),
  description: z
    .string()
    .trim()
    .min(10, 'Опишите ситуацию хотя бы парой предложений')
    .max(4000, 'Слишком длинное описание — оставьте главное'),
  urgency: z.enum(URGENCIES, { message: 'Укажите срочность' }),
  hasDocuments: z.enum(DOCUMENT_STATES, { message: 'Укажите, есть ли документы' }),
  contactMethod: z.enum(CONTACT_METHODS, { message: 'Выберите удобный способ связи' }),
});

export type LeadInput = z.infer<typeof leadInputSchema>;

/** То же самое плюс резюме диалога — это отдаёт бот. */
export const botLeadSchema = leadInputSchema.extend({
  summary: z
    .string()
    .trim()
    .min(10, 'Нужно короткое резюме для юриста')
    .max(1000),
});

export type BotLeadInput = z.infer<typeof botLeadSchema>;

/** Приводим телефон к виду, по которому можно звонить и открывать WhatsApp. */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('8')) return `+7${digits.slice(1)}`;
  if (digits.length === 11 && digits.startsWith('7')) return `+${digits}`;
  if (digits.length === 10) return `+7${digits}`;
  return raw.trim().startsWith('+') ? `+${digits}` : digits;
}

/** Человеческие подписи — используются и на сайте, и в админке, и в уведомлении. */
export const urgencyLabels: Record<(typeof URGENCIES)[number], string> = {
  today: 'Сегодня',
  days: 'В ближайшие дни',
  not_urgent: 'Не срочно',
};

export const documentsLabels: Record<(typeof DOCUMENT_STATES)[number], string> = {
  yes: 'Да',
  partial: 'Частично',
  no: 'Нет',
  unknown: 'Не знаю',
};

export const clientTypeLabels: Record<(typeof CLIENT_TYPES)[number], string> = {
  individual: 'Частное лицо',
  business: 'Бизнес',
};

export const contactMethodLabels: Record<(typeof CONTACT_METHODS)[number], string> = {
  telegram: 'Telegram',
  whatsapp: 'WhatsApp',
  call: 'Звонок',
};

export const sourceLabels = {
  site: 'Сайт',
  telegram: 'Telegram',
} as const;
