'use client';

import { useState } from 'react';

import { company, type TopicSlug } from '@/lib/content';

import { useLeadForm } from './lead-form-context';

/**
 * Первый экран.
 *
 * Обычно здесь ставят лозунг и две кнопки. Но единственная задача этой страницы —
 * помочь человеку описать ситуацию, поэтому главный элемент экрана и есть само
 * поле ввода. Примеры рядом — не украшение: они подставляют и текст, и тему,
 * то есть делают ровно то, что требует ТЗ от кнопок услуг.
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
    <section id="top" className="bg-ink text-paper">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 md:py-24 lg:grid-cols-[1fr_minmax(0,520px)] lg:gap-16">
        <div className="max-w-xl">
          <p className="eyebrow !text-shield-soft">Юридическая помощь · Алматы</p>

          <h1 className="mt-5 text-4xl leading-[1.08] font-semibold sm:text-5xl">
            Опишите ситуацию своими словами
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-paper/75">
            Без юридических формулировок и без полного пакета документов. Мы определим
            направление, зададим пару уточняющих вопросов и передадим вопрос юристу.
          </p>

          <p className="mt-8 max-w-md border-l-2 border-shield pl-4 text-sm leading-relaxed text-paper/60">
            Мы не обещаем исход дела и не называем статьи закона наугад. Стоимость и порядок
            работы обсуждаем после первичного разбора ситуации.
          </p>
        </div>

        <div className="rounded-[18px] bg-card p-6 text-ink shadow-[0_24px_60px_-30px_rgba(0,0,0,0.6)] sm:p-7">
          <label htmlFor="hero-situation" className="block text-sm font-medium text-ink">
            Что произошло?
          </label>

          <textarea
            id="hero-situation"
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={5}
            placeholder="Например: занял знакомому деньги под расписку, обещал вернуть в марте — до сих пор не отдал и не отвечает на сообщения."
            className="mt-3 w-full resize-y rounded-[10px] border border-line bg-paper/40 p-3.5 text-[15px] leading-relaxed text-ink outline-none placeholder:text-ink-faint focus:border-shield focus:bg-white"
          />

          <p className="mt-5 text-xs text-ink-faint">Или начните с похожей ситуации:</p>

          <div className="mt-2.5 flex flex-wrap gap-2">
            {examples.map((example) => (
              <button
                key={example.topic}
                type="button"
                onClick={() => prefillForm({ topic: example.topic, description: example.text })}
                className="rounded-full border border-line bg-white px-3.5 py-1.5 text-[13px] text-ink-soft transition-colors hover:border-shield hover:bg-shield-soft hover:text-shield"
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
              className="flex-1 rounded-full border border-line px-5 py-3 text-center text-sm font-medium text-ink transition-colors hover:border-shield hover:text-shield"
            >
              Записаться на консультацию
            </a>
          </div>

          {/* Второй канал: тот же приём, но в мессенджере. Заявка попадёт в тот же список. */}
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
    </section>
  );
}
