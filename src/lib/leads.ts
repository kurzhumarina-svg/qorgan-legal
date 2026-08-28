import { desc, eq } from 'drizzle-orm';

import { getDb } from '@/lib/db';
import { leads, type Lead } from '@/lib/db/schema';
import { notifyAdmin } from '@/lib/telegram/notify';
import { normalizePhone, type LeadInput } from '@/lib/validation';

export type CreateLeadArgs = LeadInput & {
  source: 'site' | 'telegram';
  aiSummary?: string | null;
  tgChatId?: number | null;
  tgUsername?: string | null;
};

/**
 * ЕДИНСТВЕННАЯ точка создания заявки в проекте.
 *
 * Сюда приходят и форма с сайта, и Telegram-бот. За счёт этого запись в базе,
 * нормализация телефона и уведомление администратору гарантированно одинаковы
 * независимо от источника — то самое «работают как один продукт» из ТЗ.
 */
export async function createLead(input: CreateLeadArgs): Promise<Lead> {
  const [lead] = await getDb()
    .insert(leads)
    .values({
      source: input.source,
      name: input.name,
      phone: normalizePhone(input.phone),
      clientType: input.clientType,
      topic: input.topic,
      description: input.description,
      urgency: input.urgency,
      hasDocuments: input.hasDocuments,
      contactMethod: input.contactMethod,
      aiSummary: input.aiSummary ?? null,
      tgChatId: input.tgChatId ?? null,
      tgUsername: input.tgUsername ?? null,
    })
    .returning();

  // Заявка уже сохранена. Если Telegram недоступен или админ не нажал Start —
  // это не повод терять обращение клиента, поэтому ошибку только логируем.
  try {
    await notifyAdmin(lead);
  } catch (error) {
    console.error('[createLead] не удалось отправить уведомление администратору:', error);
  }

  return lead;
}

export async function listLeads(): Promise<Lead[]> {
  return getDb().select().from(leads).orderBy(desc(leads.createdAt));
}

export async function getLead(id: number): Promise<Lead | undefined> {
  const [lead] = await getDb().select().from(leads).where(eq(leads.id, id)).limit(1);
  return lead;
}
