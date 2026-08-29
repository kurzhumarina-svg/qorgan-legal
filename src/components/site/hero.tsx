'use client';

import { useState } from 'react';

import { company, type TopicSlug } from '@/lib/content';

import { useLeadForm } from './lead-form-context';

/**
 * Первый экран как начало разговора.
 *
 * Обычный лендинг открывается лозунгом и кнопкой. Здесь единственная задача
 * страницы — разговорить человека, поэтому экран показывает сам приём:
 * реальная реплика клиента, спокойный ответ компании и следующая очередь —
 * поле, в котором продолжает уже посетитель.
 */

const examples: { label: string; topic: TopicSlug; text: string }[] = [
  {
    label: 'Не возвращают долг',
    topic: 'debt',
    text: 'Занял деньги знакомому, срок возврата прошёл, деньги не отдаёт и перестал отвечать.',
  },
  {
    label: 'Пришла претензия',
    topic: 'pretrial',
    text: 'Контрагент прислал претензию и дал короткий срок на ответ. Не понимаю, что отвечать.',
  },
  {
    label: 'Проверить договор',
    topic: 'contract',
    text: 'Прислали договор на подписание. Хочу понять, нет ли в нём условий не в мою пользу.',
  },
  {
    label: 'Развод и раздел',
    topic: 'family',
    text: 'Планирую развод, нужно разобраться с разделом имущества.',
  },
];

export function Hero() {
  const { prefillForm } = useLeadForm();
  const [text, setText] = useState('');

  return (
    <section id="top" className="mx-auto max-w-6xl px-5 py-14 md:py-20">
      <div className="grid gap-12 lg:grid-cols-[1fr_minmax(0,540px)] lg:gap-16">
        <div className="max-w-xl lg:pt-6">
          <p className="eyebrow">Юридическая помощь · {company.city}</p>

          <h1 className="mt-5 text-4xl leading-[1.12] font-medium sm:text-[3.25rem]">
            Расскажите, как есть
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-ink-soft">
            Без юридических формулировок и без папки документов. Поймём, к какому юристу вы
            относитесь, зададим пару уточнений и передадим вопрос — вы получите понятный
            первый шаг.
          </p>

          <p className="mt-8 max-w-md border-l-2 border-line pl-4 text-sm leading-relaxed text-ink-faint">
            Мы не обещаем исход дела и не называем статьи закона наугад. Стоимость и порядок
            работы обсуждаем после первичного разбора.
          </p>
        </div>

        {/* Разговор: как это обычно начинается и чем отвечают. */}
        <div className="rounded-[18px] border border-line bg-card p-5 sm:p-6">
          <div className="flex flex-col gap-3">
            <div className="bubble-client max-w-[85%] text-[15px] leading-relaxed">
              Дал знакомому деньги под расписку, обещал вернуть в марте. Не отдаёт и перестал
              отвечать на сообщения.
            </div>

            <div className="bubble-firm ml-auto max-w-[90%] text-[15px] leading-relaxed">
              Это вопрос по взысканию задолженности. Сейчас важнее всего расписка и переписка —
              они подтверждают передачу денег. Уточню пару деталей и передам юристу.
            </div>
          </div>

          <div className="mt-6 border-t border-line pt-5">
            <label htmlFor="hero-situation" className="block text-sm font-medium">
              Теперь ваша очередь
            </label>

            <textarea
              id="hero-situation"
              value={text}
              onChange={(event) => setText(event.target.value)}
              rows={4}
              placeholder="Опишите, что произошло, своими словами."
              className="mt-3 w-full resize-y rounded-[12px] border border-line bg-paper/50 p-3.5 text-[15px] leading-relaxed text-ink outline-none placeholder:text-ink-faint focus:border-shield focus:bg-white"
            />

            <p className="mt-4 text-xs text-ink-faint">Или начните с похожей ситуации:</p>

            <div className="mt-2.5 flex flex-wrap gap-2">
              {examples.map((example) => (
                <button
                  key={example.topic}
                  type="button"
                  onClick={() => prefillForm({ topic: example.topic, description: example.text })}
                  className="rounded-full border border-line bg-paper/60 px-3.5 py-1.5 text-[13px] text-ink-soft transition-colors hover:border-shield hover:bg-shield-soft hover:text-shield"
                >
                  {example.label}
                </button>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
              <button
                type="button"
                onClick={() => prefillForm({ description: text.trim() || undefined })}
                className="flex-1 rounded-full bg-shield px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-shield-dark"
              >
                Описать ситуацию
              </button>
              <a
                href="#form"
                className="flex-1 rounded-full border border-line px-5 py-3 text-center text-sm font-medium transition-colors hover:border-shield hover:text-shield"
              >
                Записаться на консультацию
              </a>
            </div>

            <p className="mt-4 text-center text-[13px] text-ink-faint">
              Удобнее в мессенджере?{' '}
              <a
                href={company.telegramHref}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-shield underline-offset-4 hover:underline"
              >
                Напишите помощнику в Telegram
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
