import OpenAI, { APIError } from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

import type { StoredMessage } from '@/lib/db/schema';

import { checkAnswer, type Violation } from './guardrails';
import { CORRECTION_SUFFIX, SAFE_FALLBACK, SYSTEM_PROMPT } from './prompt';
import { createLeadTool } from './tools';

/**
 * Провайдер модели не зашит в код.
 *
 * Groq, OpenRouter, Mistral, DeepSeek, локальная Ollama и даже Gemini отдают
 * один и тот же OpenAI-совместимый интерфейс, поэтому весь код общения с моделью
 * один, а выбор провайдера — это три переменные в .env.local. Если конкретный
 * сервис окажется недоступен из вашей страны, переключение занимает минуту.
 */

/** Сколько последних реплик отправляем модели: контекст сохраняется, токены не растут. */
const HISTORY_LIMIT = 20;

/** Паузы между повторами, мс. Бесплатные пулы моделей отдают 429 регулярно. */
const RETRY_DELAYS_MS = [1500, 5000, 12000];

let cached: OpenAI | null = null;

function client(): OpenAI {
  if (!cached) {
    const apiKey = process.env.AI_API_KEY;
    const baseURL = process.env.AI_BASE_URL;

    if (!apiKey || !baseURL) {
      throw new Error(
        'Не заданы AI_API_KEY и AI_BASE_URL. Скопируйте .env.example в .env.local и выберите провайдера из списка в комментариях.',
      );
    }

    // Свои повторы с длинными паузами вместо встроенных коротких:
    // общий пул бесплатных моделей за 200 мс освободиться не успевает.
    cached = new OpenAI({ apiKey, baseURL, maxRetries: 0, timeout: 45_000 });
  }
  return cached;
}

/** Основная модель и, через запятую, запасные — на случай перегрузки основной. */
function models(): string[] {
  const primary = process.env.AI_MODEL;
  if (!primary) {
    throw new Error('Не задана AI_MODEL. Список доступных моделей: npm run ai:models');
  }

  const fallbacks = (process.env.AI_MODEL_FALLBACK ?? '')
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean);

  return [primary, ...fallbacks];
}

export type BotReply = {
  /** Текст для клиента. Пустой, если модель только вызвала функцию. */
  text: string;
  /** Разобранные аргументы create_lead, если модель решила оформить обращение. */
  leadArgs: unknown | null;
  /** Что именно поймали guardrails — для логов и объяснения на защите. */
  violations: Violation[];
  /** true, если пришлось отдать безопасную заглушку. */
  usedFallback: boolean;
};

/**
 * Один ход диалога.
 *
 * Двойная защита: сначала просим модель вести себя правильно промптом, затем
 * проверяем результат кодом. Не прошло — одна повторная попытка с корректирующей
 * инструкцией, и только потом безопасная заглушка.
 */
export async function generateReply(history: StoredMessage[]): Promise<BotReply> {
  const messages = toMessages(history);

  const first = await callModel(messages, SYSTEM_PROMPT);

  // Аргументы функции — структурированные поля, а не свободный текст;
  // их проверяет zod, регулярки здесь не нужны.
  if (first.leadArgs !== null) {
    return { text: first.text, leadArgs: first.leadArgs, violations: [], usedFallback: false };
  }

  const verdict = checkAnswer(first.text);
  if (verdict.ok) {
    return { text: first.text, leadArgs: null, violations: [], usedFallback: false };
  }

  console.warn('[guardrails] ответ отклонён:', verdict.labels.join(', '));

  const retry = await callModel(messages, SYSTEM_PROMPT + CORRECTION_SUFFIX);
  const retryVerdict = checkAnswer(retry.text);

  if (retryVerdict.ok && retry.text.trim()) {
    return {
      text: retry.text,
      leadArgs: retry.leadArgs,
      violations: verdict.violations,
      usedFallback: false,
    };
  }

  console.warn('[guardrails] повторная попытка тоже отклонена — отдаём безопасный ответ');
  return {
    text: SAFE_FALLBACK,
    leadArgs: null,
    violations: [...new Set([...verdict.violations, ...retryVerdict.violations])],
    usedFallback: true,
  };
}

function toMessages(history: StoredMessage[]): ChatCompletionMessageParam[] {
  return history.slice(-HISTORY_LIMIT).map((message) => ({
    role: message.role,
    content: message.text,
  }));
}

async function callModel(
  history: ChatCompletionMessageParam[],
  systemInstruction: string,
): Promise<{ text: string; leadArgs: unknown | null }> {
  const messages: ChatCompletionMessageParam[] = [
    { role: 'system', content: systemInstruction },
    ...history,
  ];

  let lastError: unknown;

  // Сначала перебираем модели, внутри каждой — повторы с нарастающей паузой.
  for (const model of models()) {
    for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
      try {
        return await requestCompletion(model, messages);
      } catch (error) {
        lastError = error;

        if (!isTransient(error) || attempt === RETRY_DELAYS_MS.length) break;

        const wait = retryAfterMs(error) ?? RETRY_DELAYS_MS[attempt];
        console.warn(`[ai] ${model}: временная ошибка, повтор через ${wait} мс`);
        await sleep(wait);
      }
    }

    console.warn(`[ai] модель ${model} недоступна, пробуем следующую`);
  }

  throw lastError;
}

async function requestCompletion(
  model: string,
  messages: ChatCompletionMessageParam[],
): Promise<{ text: string; leadArgs: unknown | null }> {
  const completion = await client().chat.completions.create({
    model,
    // Низкая температура: тон ровный, инструкции соблюдаются охотнее.
    temperature: 0.3,
    max_tokens: 800,
    messages,
    tools: [createLeadTool],
  });

  const message = completion.choices[0]?.message;
  const text = (message?.content ?? '').trim();

  const call = message?.tool_calls?.find(
    (item) => item.type === 'function' && item.function.name === 'create_lead',
  );

  if (!call || call.type !== 'function') {
    return { text, leadArgs: null };
  }

  try {
    return { text, leadArgs: JSON.parse(call.function.arguments) };
  } catch {
    // Модель вернула поломанный JSON — считаем, что заявки нет, диалог продолжится.
    console.warn('[ai] не удалось разобрать аргументы create_lead');
    return { text, leadArgs: null };
  }
}

/** 429 — перегрузка, 5xx — сбой на стороне провайдера. И то и другое проходит само. */
function isTransient(error: unknown): boolean {
  if (!(error instanceof APIError)) return false;
  const status = error.status;
  return status === 429 || status === 408 || (typeof status === 'number' && status >= 500);
}

/** Провайдер часто сам сообщает, через сколько повторять, — уважаем это. */
function retryAfterMs(error: unknown): number | null {
  if (!(error instanceof APIError)) return null;

  const header = error.headers?.get?.('retry-after');
  const seconds = Number(header);

  if (!Number.isFinite(seconds) || seconds <= 0) return null;
  return Math.min(seconds * 1000, 20_000);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
