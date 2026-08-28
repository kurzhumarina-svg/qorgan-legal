import { team } from '@/lib/content';

import { Reveal } from './reveal';

export function Team() {
  return (
    <section id="team" className="mx-auto max-w-6xl px-5 py-20">
      <Reveal>
        <p className="eyebrow">Команда</p>
        <h2 className="mt-4 max-w-2xl text-3xl leading-tight font-semibold sm:text-4xl">
          Кто будет работать с вашим вопросом
        </h2>
      </Reveal>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {team.map((person) => (
          <Reveal key={person.name}>
            <article className="flex h-full flex-col rounded-card border border-line bg-card p-6">
              <span
                aria-hidden="true"
                className="font-display flex h-14 w-14 items-center justify-center rounded-full bg-shield-soft text-base font-semibold text-shield"
              >
                {person.initials}
              </span>

              <h3 className="mt-5 text-lg font-semibold">{person.name}</h3>
              <p className="mt-1.5 text-sm text-ink-soft">{person.role}</p>

              <ul className="mt-5 flex flex-wrap gap-2 border-t border-line pt-5">
                {person.areas.map((area) => (
                  <li
                    key={area}
                    className="rounded-full bg-paper px-3 py-1 text-xs text-ink-soft"
                  >
                    {area}
                  </li>
                ))}
              </ul>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
