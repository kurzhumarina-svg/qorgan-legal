import { config } from 'dotenv';

config({ path: '.env.local', quiet: true });

/**
 * Показывает модели, доступные вашему ключу, и подсказывает, что вписать в AI_MODEL.
 *
 * Важная деталь: боту нужен вызов функций (create_lead). Модель без его поддержки
 * будет вежливо разговаривать, но никогда не создаст заявку — и это трудно
 * заметить. Поэтому там, где провайдер сообщает список возможностей (OpenRouter
 * это делает), модели без tools отсеиваются сразу.
 */

type Model = {
  id: string;
  supported_parameters?: string[];
  pricing?: { prompt?: string; completion?: string };
};

function isFree(model: Model): boolean {
  if (model.id.endsWith(':free')) return true;
  const prompt = Number(model.pricing?.prompt ?? '1');
  const completion = Number(model.pricing?.completion ?? '1');
  return prompt === 0 && completion === 0;
}

function supportsTools(model: Model): boolean | null {
  if (!model.supported_parameters) return null; // провайдер не сообщает — не знаем
  return model.supported_parameters.includes('tools');
}

async function main() {
  const baseUrl = process.env.AI_BASE_URL?.replace(/\/$/, '');
  const apiKey = process.env.AI_API_KEY;

  if (!baseUrl || !apiKey) {
    console.error(
      'Не заданы AI_BASE_URL и AI_API_KEY в .env.local.\n' +
        'Откройте .env.example — там список провайдеров с готовыми настройками.',
    );
    process.exit(1);
  }

  const response = await fetch(`${baseUrl}/models`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (!response.ok) {
    console.error(`Ошибка ${response.status}: ${await response.text()}`);
    console.error('\nПроверьте AI_BASE_URL и ключ. Возможно, провайдер недоступен из вашей сети.');
    process.exit(1);
  }

  const data = (await response.json()) as { data?: Model[] };
  const models = data.data ?? [];

  if (models.length === 0) {
    console.log('Провайдер не вернул список моделей — посмотрите документацию в его консоли.');
    return;
  }

  const withTools = models.filter((m) => supportsTools(m) !== false);
  const known = models.some((m) => m.supported_parameters);

  console.log(`\nВсего моделей: ${models.length}`);
  if (known) {
    console.log(`С поддержкой вызова функций: ${withTools.length} (остальные боту не подойдут)`);
  }

  // Ранжируем по тому, что важно этой задаче: разговорный русский и вызов функций.
  const rank = (id: string): number => {
    if (/gemini.*flash/i.test(id)) return 0;
    if (/gpt-4o-mini|gpt-4\.1-mini/i.test(id)) return 1;
    if (/llama-3\.3-70b/i.test(id)) return 2;
    if (/qwen.*(72|32)b|kimi/i.test(id)) return 3;
    if (/mistral-small|deepseek-chat/i.test(id)) return 4;
    return 9;
  };

  const shortlist = [...withTools].sort((a, b) => rank(a.id) - rank(b.id)).slice(0, 12);

  console.log('\nПодходят для бота (сначала — лучшие для русского языка):\n');
  for (const model of shortlist) {
    const tags = [isFree(model) ? 'бесплатно' : null].filter(Boolean).join(', ');
    console.log(`   ${model.id}${tags ? `   [${tags}]` : ''}`);
  }

  const free = shortlist.filter(isFree);
  if (free.length > 0) {
    console.log('\nБесплатные варианты с вызовом функций:\n');
    for (const model of free) console.log(`   ${model.id}`);
  }

  const recommended = shortlist[0];
  if (recommended) {
    console.log(`\nРекомендую вписать в .env.local:\n\n  AI_MODEL=${recommended.id}\n`);
    console.log('Затем проверить качество ответов: npm run test:bot\n');
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
