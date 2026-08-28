import Link from 'next/link';

import type { Lead } from '@/lib/db/schema';
import { sourceLabels, urgencyLabels } from '@/lib/validation';

/** Время показываем в часовом поясе компании, а не сервера в другой стране. */
const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Asia/Almaty',
});

export function formatDate(date: Date): string {
  return dateFormatter.format(date);
}

export function SourceBadge({ source }: { source: Lead['source'] }) {
  const isTelegram = source === 'telegram';
  return (
    <span
      className={[
        'inline-block rounded-full px-2.5 py-1 text-xs whitespace-nowrap',
        isTelegram ? 'bg-shield-soft text-shield' : 'bg-paper text-ink-soft',
      ].join(' ')}
    >
      {sourceLabels[source]}
    </span>
  );
}

/** Срочность — единственное место, где используется тревожный цвет. */
export function UrgencyBadge({ urgency }: { urgency: Lead['urgency'] }) {
  const urgent = urgency === 'today';
  return (
    <span
      className={[
        'inline-block rounded-full px-2.5 py-1 text-xs whitespace-nowrap',
        urgent ? 'bg-signal-soft font-medium text-signal' : 'text-ink-soft',
      ].join(' ')}
    >
      {urgencyLabels[urgency]}
    </span>
  );
}

export function AdminShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-line bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <Link href="/admin" className="flex items-center gap-2.5">
            <span className="strata" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <span className="font-display text-sm font-bold tracking-tight">
              QORGAN <span className="text-shield">Admin</span>
            </span>
          </Link>

          <Link href="/api/admin/logout" className="text-sm text-ink-soft hover:text-shield">
            Выйти
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8">
        <h1 className="text-2xl font-semibold">{title}</h1>
        {subtitle && <p className="mt-1.5 text-sm text-ink-soft">{subtitle}</p>}
        <div className="mt-7">{children}</div>
      </main>
    </div>
  );
}
