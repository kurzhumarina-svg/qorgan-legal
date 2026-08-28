import { faq } from '@/lib/content';

import { Reveal } from './reveal';

/** Нативный <details>: работает без JavaScript и доступен с клавиатуры по умолчанию. */
export function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-5 py-20">
      <Reveal>
        <p className="eyebrow">Частые вопросы</p>
        <h2 className="mt-4 text-3xl leading-tight font-semibold sm:text-4xl">
          О стоимости, документах и гарантиях
        </h2>
      </Reveal>

      <div className="mt-10 divide-y divide-line border-y border-line">
        {faq.map((item) => (
          <details key={item.q} className="group py-5">
            <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-left text-base font-medium marker:content-['']">
              <span>{item.q}</span>
              <span
                aria-hidden="true"
                className="mt-1 shrink-0 text-shield transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="mt-3 pr-8 text-sm leading-relaxed text-ink-soft">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
