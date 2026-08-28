import type { ChatCompletionFunctionTool } from 'openai/resources/chat/completions';

import {
  CLIENT_TYPES,
  CONTACT_METHODS,
  DOCUMENT_STATES,
  TOPICS,
  URGENCIES,
} from '@/lib/validation';

/**
 * Инструмент, которым бот оформляет заявку.
 *
 * Модель не «пишет заявку текстом», а вызывает функцию со строго описанными
 * полями. Аргументы затем проверяются той же zod-схемой, что и форма на сайте,
 * поэтому бот не может создать запись, которую форма отвергла бы.
 */
export const createLeadTool: ChatCompletionFunctionTool = {
  type: 'function',
  function: {
    name: 'create_lead',
    description:
      'Оформить обращение клиента и передать его юристу. Вызывать, когда известны имя, телефон и суть ситуации.',
    parameters: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Имя клиента, как он представился',
        },
        phone: {
          type: 'string',
          description: 'Телефон для обратной связи в том виде, в каком назвал клиент',
        },
        clientType: {
          type: 'string',
          enum: [...CLIENT_TYPES],
          description: 'individual — частное лицо, business — компания или ИП',
        },
        topic: {
          type: 'string',
          enum: [...TOPICS],
          description: 'Направление, к которому относится обращение',
        },
        description: {
          type: 'string',
          description:
            'Ситуация словами клиента. Не переписывай и не приукрашивай — смысл должен остаться исходным.',
        },
        urgency: {
          type: 'string',
          enum: [...URGENCIES],
          description:
            'today — вопрос горит сегодня, days — ближайшие дни, not_urgent — не срочно',
        },
        hasDocuments: {
          type: 'string',
          enum: [...DOCUMENT_STATES],
          description: 'Есть ли на руках документы по ситуации',
        },
        contactMethod: {
          type: 'string',
          enum: [...CONTACT_METHODS],
          description: 'Удобный способ связи',
        },
        summary: {
          type: 'string',
          description:
            'Краткое резюме диалога для юриста: 2–3 предложения о сути вопроса и обстоятельствах. Без правовых выводов и без ссылок на нормы.',
        },
      },
      required: [
        'name',
        'phone',
        'clientType',
        'topic',
        'description',
        'urgency',
        'hasDocuments',
        'contactMethod',
        'summary',
      ],
    },
  },
};
