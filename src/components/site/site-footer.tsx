import { company } from '@/lib/content';

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line bg-paper">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="font-display text-sm font-bold tracking-tight">
            QORGAN <span className="text-shield">Legal</span>
          </span>
          <p className="mt-2 text-sm text-ink-soft">
            {company.city}, {company.address}
          </p>
        </div>

        <div className="text-sm text-ink-soft">
          <a href={`tel:${company.phoneHref}`} className="block hover:text-shield">
            {company.phone}
          </a>
          <a href={`mailto:${company.email}`} className="block hover:text-shield">
            {company.email}
          </a>
          <div className="mt-2 flex gap-4">
            <a
              href={company.whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="hover:text-shield"
            >
              WhatsApp
            </a>
            <a
              href={company.telegramHref}
              target="_blank"
              rel="noreferrer"
              className="hover:text-shield"
            >
              Telegram
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-line/70">
        <p className="mx-auto max-w-6xl px-5 py-5 text-xs leading-relaxed text-ink-faint">
          Материалы сайта носят информационный характер и не являются юридической консультацией.
          Оценка перспектив и порядок действий определяются юристом после разбора конкретной
          ситуации. Учебный проект.
        </p>
      </div>
    </footer>
  );
}
