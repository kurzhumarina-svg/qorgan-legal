import { company } from '@/lib/content';

const links = [
  { href: '#directions', label: 'Направления' },
  { href: '#process', label: 'Как работаем' },
  { href: '#team', label: 'Команда' },
  { href: '#faq', label: 'Вопросы' },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/60 bg-paper/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5">
        <a href="#top" className="flex items-center gap-2.5">
          <span className="dialog-mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span className="font-display text-[15px] font-bold tracking-tight text-ink">
            QORGAN <span className="text-shield">Legal</span>
          </span>
        </a>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-ink-soft transition-colors hover:text-shield"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={`tel:${company.phoneHref}`}
            className="hidden text-sm font-medium text-ink transition-colors hover:text-shield sm:block"
          >
            {company.phone}
          </a>
          <a
            href="#form"
            className="rounded-full bg-shield px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-shield-dark"
          >
            Описать ситуацию
          </a>
        </div>
      </div>
    </header>
  );
}
