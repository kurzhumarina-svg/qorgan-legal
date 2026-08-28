import type { Metadata } from 'next';
import Link from 'next/link';

import { AdminShell, SourceBadge, UrgencyBadge, formatDate } from '@/components/admin/ui';
import { requireAdmin } from '@/lib/admin-guard';
import { services, topicLabels } from '@/lib/content';
import { listLeads } from '@/lib/leads';
import { clientTypeLabels, sourceLabels } from '@/lib/validation';

export const metadata: Metadata = {
  title: 'Заявки — админка QORGAN Legal',
  robots: { index: false },
};

// Заявки приходят постоянно, кэшировать список нельзя.
export const dynamic = 'force-dynamic';

type Search = { source?: string; topic?: string };

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  await requireAdmin();

  const filters = await searchParams;
  const all = await listLeads();

  const leads = all.filter((lead) => {
    if (filters.source && lead.source !== filters.source) return false;
    if (filters.topic && lead.topic !== filters.topic) return false;
    return true;
  });

  const subtitle =
    all.length === 0
      ? 'Пока пусто. Заявки появятся здесь автоматически.'
      : `Всего ${all.length}, показано ${leads.length}. Сайт и Telegram — в одном списке.`;

  return (
    <AdminShell title="Заявки" subtitle={subtitle}>
      <div className="flex flex-col gap-3">
        <FilterRow
          label="Источник"
          current={filters.source}
          param="source"
          other={filters.topic ? { topic: filters.topic } : {}}
          options={Object.entries(sourceLabels)}
        />
        <FilterRow
          label="Тема"
          current={filters.topic}
          param="topic"
          other={filters.source ? { source: filters.source } : {}}
          options={services.map((s) => [s.slug, s.title] as [string, string])}
        />
      </div>

      {leads.length === 0 ? (
        <p className="mt-10 rounded-card border border-dashed border-line p-10 text-center text-sm text-ink-soft">
          Заявок по этим условиям нет.
        </p>
      ) : (
        <>
          {/* Таблица — для экрана пошире. */}
          <div className="mt-6 hidden overflow-x-auto rounded-card border border-line bg-card md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs text-ink-faint">
                  <th className="px-4 py-3 font-medium">Время</th>
                  <th className="px-4 py-3 font-medium">Имя</th>
                  <th className="px-4 py-3 font-medium">Телефон</th>
                  <th className="px-4 py-3 font-medium">Клиент</th>
                  <th className="px-4 py-3 font-medium">Тема</th>
                  <th className="px-4 py-3 font-medium">Срочность</th>
                  <th className="px-4 py-3 font-medium">Источник</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-b border-line/60 last:border-0 hover:bg-paper/60">
                    <td className="px-4 py-3 whitespace-nowrap text-ink-soft">
                      {formatDate(lead.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/${lead.id}`} className="font-medium hover:text-shield">
                        {lead.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-ink-soft">{lead.phone}</td>
                    <td className="px-4 py-3 text-ink-soft">{clientTypeLabels[lead.clientType]}</td>
                    <td className="px-4 py-3">{topicLabels[lead.topic]}</td>
                    <td className="px-4 py-3">
                      <UrgencyBadge urgency={lead.urgency} />
                    </td>
                    <td className="px-4 py-3">
                      <SourceBadge source={lead.source} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Карточки — для телефона: таблица на маленьком экране нечитаема. */}
          <ul className="mt-6 space-y-3 md:hidden">
            {leads.map((lead) => (
              <li key={lead.id}>
                <Link
                  href={`/admin/${lead.id}`}
                  className="block rounded-card border border-line bg-card p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-medium">{lead.name}</span>
                    <SourceBadge source={lead.source} />
                  </div>
                  <p className="mt-1 text-sm text-ink-soft">{lead.phone}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-ink-soft">
                    <span>{topicLabels[lead.topic]}</span>
                    <span aria-hidden="true">·</span>
                    <UrgencyBadge urgency={lead.urgency} />
                    <span aria-hidden="true">·</span>
                    <span>{formatDate(lead.createdAt)}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </AdminShell>
  );
}

function FilterRow({
  label,
  param,
  current,
  other,
  options,
}: {
  label: string;
  param: string;
  current?: string;
  other: Record<string, string>;
  options: [string, string][];
}) {
  const link = (value?: string) => {
    const query = new URLSearchParams(other);
    if (value) query.set(param, value);
    const qs = query.toString();
    return qs ? `/admin?${qs}` : '/admin';
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-xs text-ink-faint">{label}:</span>
      <FilterChip href={link()} active={!current}>
        Все
      </FilterChip>
      {options.map(([value, title]) => (
        <FilterChip key={value} href={link(value)} active={current === value}>
          {title}
        </FilterChip>
      ))}
    </div>
  );
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={[
        'rounded-full border px-3 py-1 text-[13px] transition-colors',
        active
          ? 'border-shield bg-shield text-white'
          : 'border-line bg-card text-ink-soft hover:border-shield hover:text-shield',
      ].join(' ')}
    >
      {children}
    </Link>
  );
}
