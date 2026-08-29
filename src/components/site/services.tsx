'use client';

import { visibleServices } from '@/lib/content';

import { useLeadForm } from './lead-form-context';
import { Reveal } from './reveal';

/**
 * Направления. Карточка не просто рассказывает про услугу — по клику она
 * подставляет тему в форму, поэтому человек не выбирает её повторно вручную.
 */
export function Services() {
  const { prefillForm } = useLeadForm();

  return (
    <section id="directions" className="mx-auto max-w-6xl px-5 py-20">
      <Reveal>
        <p className="eyebrow">Направления</p>
        <h2 className="mt-4 max-w-2xl text-3xl leading-tight font-semibold sm:text-4xl">
          С чем к нам приходят чаще всего
        </h2>
        <p className="mt-4 max-w-xl text-ink-soft">
          Если не уверены, куда относится ваш вопрос, — просто опишите ситуацию, направление
          определим сами.
        </p>
      </Reveal>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleServices.map((service, index) => (
          <Reveal key={service.slug}>
            <article
              className="flex h-full flex-col rounded-card border border-line bg-card p-6 transition-colors hover:border-shield"
              style={{ transitionDelay: `${index * 30}ms` }}
            >
              <h3 className="text-lg leading-snug font-semibold">{service.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-ink-soft">{service.summary}</p>

              {/* Примеры — это дословные фразы клиентов, поэтому и выглядят как реплики. */}
              <ul className="mt-5 flex-1 space-y-2 border-t border-line pt-5">
                {service.examples.map((example) => (
                  <li key={example} className="bubble-client text-[13px] leading-relaxed">
                    {example}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => prefillForm({ topic: service.slug })}
                className="mt-6 self-start text-sm font-medium text-shield transition-colors hover:text-shield-dark"
              >
                Обсудить этот вопрос →
              </button>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
