import {
  bigint,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

/**
 * Одна таблица заявок на два источника.
 *
 * Это главное архитектурное решение проекта: и форма на сайте, и Telegram-бот
 * пишут в `leads` одну и ту же структуру, отличаясь только полем `source`.
 * Поэтому в админке они естественным образом оказываются в общем списке —
 * ничего не нужно склеивать и синхронизировать.
 */

export const leadSourceEnum = pgEnum('lead_source', ['site', 'telegram']);
export const clientTypeEnum = pgEnum('client_type', ['individual', 'business']);
export const leadTopicEnum = pgEnum('lead_topic', [
  'contract',
  'debt',
  'pretrial',
  'litigation',
  'family',
  'business',
  'other',
]);
export const urgencyEnum = pgEnum('urgency', ['today', 'days', 'not_urgent']);
export const documentsEnum = pgEnum('documents_state', ['yes', 'partial', 'no', 'unknown']);
export const contactMethodEnum = pgEnum('contact_method', ['telegram', 'whatsapp', 'call']);
export const leadStatusEnum = pgEnum('lead_status', ['new', 'in_progress', 'done']);

export const leads = pgTable('leads', {
  id: serial('id').primaryKey(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  source: leadSourceEnum('source').notNull(),

  name: text('name').notNull(),
  phone: text('phone').notNull(),
  clientType: clientTypeEnum('client_type').notNull(),
  topic: leadTopicEnum('topic').notNull(),
  /** Ситуация словами клиента — не пересказ модели. */
  description: text('description').notNull(),
  urgency: urgencyEnum('urgency').notNull(),
  hasDocuments: documentsEnum('has_documents').notNull(),
  contactMethod: contactMethodEnum('contact_method').notNull(),

  /** Короткое резюме диалога с ботом. У заявок с сайта пусто. */
  aiSummary: text('ai_summary'),
  tgChatId: bigint('tg_chat_id', { mode: 'number' }),
  tgUsername: text('tg_username'),

  status: leadStatusEnum('status').default('new').notNull(),
});

export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;

/** Реплика диалога в формате, который понимает OpenAI-совместимый API. */
export type StoredMessage = {
  role: 'user' | 'assistant';
  text: string;
};

/**
 * История переписки — одна строка на чат.
 * Одно чтение и одна запись за ход: удобно для serverless, где нет памяти между вызовами.
 */
export const tgConversations = pgTable('tg_conversations', {
  chatId: bigint('chat_id', { mode: 'number' }).primaryKey(),
  messages: jsonb('messages').$type<StoredMessage[]>().default([]).notNull(),
  /** Заполняется, когда бот уже оформил обращение — чтобы не собирать его повторно. */
  leadId: integer('lead_id').references(() => leads.id),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Защита от повторной обработки.
 * Telegram повторяет доставку апдейта, если не получил 200 вовремя, — без этой
 * таблицы клиент получил бы дубль ответа, а мы завели бы вторую заявку.
 */
export const tgUpdates = pgTable('tg_updates', {
  updateId: bigint('update_id', { mode: 'number' }).primaryKey(),
  receivedAt: timestamp('received_at', { withTimezone: true }).defaultNow().notNull(),
});
