import { process } from '@/lib/content';

import { Reveal } from './reveal';

/**
 * Порядок работы. Нумерация здесь оправдана: это реальная последовательность
 * шагов, и очерёдность несёт смысл — человеку важно знать, что будет дальше.
 */
export function Process() {
  return (
    <section id="process" className="bg-ink text-paper">
      <div className="mx-auto max-w-6xl px-5 py-20">
        <Reveal>
          <p className="eyebrow !text-shield-soft">Как проходит работа</p>
          <h2 className="mt-4 max-w-2xl text-3xl leading-tight font-semibold sm:text-4xl">
            Три шага от вашего сообщения до работы юриста
          </h2>
        </Reveal>

        <ol className="mt-12 grid gap-px overflow-hidden rounded-card bg-paper/15 md:grid-cols-3">
          {process.map((item) => (
            <li key={item.step} className="bg-ink p-7">
              <span className="font-display text-sm font-semibold tracking-widest text-shield-soft">
                {item.step}
              </span>
              <h3 className="mt-4 text-xl leading-snug font-semibold">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-paper/70">{item.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
