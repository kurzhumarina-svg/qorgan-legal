import { topicLabels } from '@/lib/content';
import type { Lead } from '@/lib/db/schema';
import { sourceLabels, urgencyLabels } from '@/lib/validation';

import { escapeHtml, sendMessage } from './api';

/**
 * Уведомление администратору о новой заявке.
 *
 * Вызывается из одного места — createLead() — поэтому приходит одинаково
 * и для формы с сайта, и для обращения из Telegram. Источник виден в тексте.
 */
export async function notifyAdmin(lead: Lead): Promise<void> {
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!adminChatId) {
    console.warn('[notifyAdmin] TELEGRAM_ADMIN_CHAT_ID не задан — уведомление пропущено');
    return;
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

  const lines = [
    '<b>Новое обращение QORGAN Legal</b>',
    '',
    `${escapeHtml(lead.name)} • ${escapeHtml(lead.phone)}`,
    `Тема: ${escapeHtml(topicLabels[lead.topic])}`,
    `Срочность: ${escapeHtml(urgencyLabels[lead.urgency])}`,
    `Источник: ${escapeHtml(sourceLabels[lead.source])}`,
    '',
    escapeHtml(truncate(lead.aiSummary ?? lead.description, 400)),
    '',
    `<a href="${siteUrl}/admin/${lead.id}">Открыть в админке</a>`,
  ];

  await sendMessage(adminChatId, lines.join('\n'));
}

function truncate(text: string, limit: number): string {
  const clean = text.trim();
  return clean.length <= limit ? clean : `${clean.slice(0, limit - 1)}…`;
}
