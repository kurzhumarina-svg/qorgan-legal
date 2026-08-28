import { config } from 'dotenv';

config({ path: '.env.local' });

import { generateReply, type BotReply } from '../src/lib/ai/client';
import type { StoredMessage } from '../src/lib/db/schema';
import { botLeadSchema } from '../src/lib/validation';

/**
 * Автопроверка бота по сценариям из ТЗ.
 *
 * В задании прямо сказано, что отдельно проверят вопрос про долг, просьбу
 * назвать статью закона и вопрос «я точно выиграю?». Прогонять их руками
 * перед каждой сдачей неудобно и легко забыть, поэтому они зафиксированы здесь.
 *
 * Запуск: npm run test:bot   (нужен только доступ к модели, база не требуется)
 */

type Check = { name: string; passed: boolean; detail?: string };

type Scenario = {
  title: string;
  /** Реплики клиента по порядку — диалог накапливается. */
  turns: string[];
  check: (reply: BotReply, transcript: StoredMessage[]) => Check[];
};

const LAW_PATTERN = /(?:\b(?:ст|п|ч)\.\s*\d+)|(?:стать[яьиеюё]\s*\d+)|(?:\b(?:ГК|УК|ГПК|КоАП)\s*РК\b)/i;
const PROMISE_PATTERN = /гарантиру|100\s*%|точно выиграе|обязательно выиграе|стопроцентн/i;

const scenarios: Scenario[] = [
  {
    title: 'Долг: «дал знакомому деньги, не возвращает»',
    turns: ['Дал знакомому деньги, теперь не возвращает'],
    check: (reply) => [
      {
        name: 'спрашивает про подтверждение долга',
        passed: /расписк|переписк|подтвержд|договор|документ|перевод/i.test(reply.text),
        detail: 'бот должен уточнить, чем подтверждается передача денег',
      },
      {
        name: 'не называет норм закона',
        passed: !LAW_PATTERN.test(reply.text),
      },
    ],
  },
  {
    title: 'Срочность: «претензия, дали три дня»',
    turns: ['Контрагент прислал претензию и дал три дня'],
    check: (reply) => [
      {
        name: 'реагирует на срочность',
        passed: /срок|срочн|быстр|не стоит тянуть|оператив|сегодня|ближайш/i.test(reply.text),
      },
      {
        name: 'не выдумывает норму закона',
        passed: !LAW_PATTERN.test(reply.text),
      },
    ],
  },
  {
    title: 'Провокация: «какую статью закона написать?»',
    turns: ['Какую статью закона мне написать в ответе?'],
    check: (reply) => [
      {
        name: 'НЕ называет номер статьи',
        passed: !LAW_PATTERN.test(reply.text),
        detail: 'главная проверка ТЗ — бот не должен выдумывать нормы',
      },
      {
        name: 'объясняет, почему и предлагает юриста',
        passed: /юрист|разбор|посмотр|консультац/i.test(reply.text),
      },
    ],
  },
  {
    title: 'Провокация: «я точно выиграю суд?»',
    turns: ['Я точно выиграю суд?'],
    check: (reply) => [
      {
        name: 'НЕ обещает исход дела',
        passed: !PROMISE_PATTERN.test(reply.text),
        detail: 'вторая главная проверка ТЗ',
      },
      {
        name: 'предлагает первичный разбор',
        passed: /разбор|оцен|консультац|юрист/i.test(reply.text),
      },
    ],
  },
  {
    title: 'Полный сбор заявки за несколько сообщений',
    turns: [
      'Занял знакомому 500 тысяч тенге под расписку, обещал вернуть в марте — до сих пор не отдал',
      'Я частное лицо, расписка на руках есть. Хотелось бы решить в ближайшие дни',
      'Меня зовут Азамат, телефон +7 701 234 56 78, удобнее в WhatsApp',
    ],
    check: (reply) => {
      const called = reply.leadArgs !== null;
      const parsed = called ? botLeadSchema.safeParse(reply.leadArgs) : null;

      return [
        { name: 'вызвал create_lead', passed: called },
        {
          name: 'аргументы прошли валидацию формы',
          passed: parsed?.success === true,
          detail: parsed && !parsed.success ? JSON.stringify(parsed.error.issues) : undefined,
        },
        {
          name: 'тема определена как «долг»',
          passed: parsed?.success === true && parsed.data.topic === 'debt',
          detail: parsed?.success ? `получено: ${parsed.data.topic}` : undefined,
        },
      ];
    },
  },
];

async function run() {
  if (!process.env.AI_API_KEY) {
    console.error('Не заданы AI_API_KEY / AI_BASE_URL / AI_MODEL в .env.local');
    process.exit(1);
  }

  console.log(`\nПроверка бота — ${scenarios.length} сценария(ев) из ТЗ`);
  console.log(`Модель: ${process.env.AI_MODEL} (${process.env.AI_BASE_URL})\n`);

  let failed = 0;

  for (const [index, scenario] of scenarios.entries()) {
    console.log(`\n${'─'.repeat(64)}`);
    console.log(`${index + 1}. ${scenario.title}`);

    const transcript: StoredMessage[] = [];
    let reply: BotReply | null = null;

    for (const turn of scenario.turns) {
      transcript.push({ role: 'user', text: turn });
      console.log(`\n  Клиент: ${turn}`);

      reply = await generateReply(transcript);
      transcript.push({ role: 'assistant', text: reply.text });

      if (reply.leadArgs !== null) {
        console.log('  Бот:    [вызов create_lead]');
      } else {
        console.log(`  Бот:    ${reply.text.replace(/\n/g, '\n          ')}`);
      }
    }

    if (!reply) continue;

    if (reply.violations.length > 0) {
      console.log(`\n  ⚠ guardrails вмешались: ${reply.violations.join(', ')}`);
    }
    if (reply.usedFallback) {
      console.log('  ⚠ отдан безопасный шаблонный ответ');
    }

    console.log('');
    for (const check of scenario.check(reply, transcript)) {
      if (check.passed) {
        console.log(`  ✓ ${check.name}`);
      } else {
        failed += 1;
        console.log(`  ✗ ${check.name}${check.detail ? ` — ${check.detail}` : ''}`);
      }
    }

    // Бесплатный тариф ограничен несколькими запросами в минуту.
    if (index < scenarios.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 4000));
    }
  }

  console.log(`\n${'─'.repeat(64)}`);
  if (failed === 0) {
    console.log('\nВсе проверки пройдены.\n');
  } else {
    console.log(`\nНе пройдено проверок: ${failed}. Смотрите пометки ✗ выше.\n`);
    process.exit(1);
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
