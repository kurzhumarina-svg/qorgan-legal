import { advantages } from '@/lib/content';

import { Reveal } from './reveal';

export function WhyUs() {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-20">
      <Reveal>
        <div className="rounded-card border border-line bg-card p-8 sm:p-10">
          <p className="eyebrow">Почему мы</p>
          <h2 className="mt-4 max-w-2xl text-3xl leading-tight font-semibold sm:text-4xl">
            Спокойно, честно и по делу
          </h2>

          <div className="mt-10 grid gap-8 sm:grid-cols-2">
            {advantages.map((item) => (
              <div key={item.title}>
                <span className="strata mb-4" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </span>
                <h3 className="text-base font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
