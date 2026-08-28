import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { AdminShell, SourceBadge, UrgencyBadge, formatDate } from '@/components/admin/ui';
import { requireAdmin } from '@/lib/admin-guard';
import { topicLabels } from '@/lib/content';
import { getLead } from '@/lib/leads';
import { clientTypeLabels, contactMethodLabels, documentsLabels } from '@/lib/validation';

export const metadata: Metadata = {
  title: 'Заявка — админка QORGAN Legal',
  robots: { index: false },
};

export const dynamic = 'force-dynamic';

export default async function LeadPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();

  const { id } = await params;
  const leadId = Number(id);

  if (!Number.isInteger(leadId)) notFound();

  const lead = await getLead(leadId);
  if (!lead) notFound();

  const digits = lead.phone.replace(/\D/g, '');

  return (
    <AdminShell title={lead.name} subtitle={`Обращение №${lead.id} от ${formatDate(lead.createdAt)}`}>
      <Link href="/admin" className="text-sm text-ink-soft hover:text-shield">
        ← Ко всем заявкам
      </Link>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <Card title="Что рассказал клиент">
            <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{lead.description}</p>
          </Card>

          {lead.aiSummary && (
            <Card title="Резюме диалога с ботом">
              <p className="text-[15px] leading-relaxed whitespace-pre-wrap text-ink-soft">
                {lead.aiSummary}
              </p>
              <p className="mt-4 border-t border-line pt-3 text-xs text-ink-faint">
                Составлено ассистентом на основе переписки. Это не правовая оценка.
              </p>
            </Card>
          )}
        </div>

        <aside className="space-y-5">
          <Card title="Обращение">
            <dl className="space-y-3 text-sm">
              <Row label="Источник">
                <SourceBadge source={lead.source} />
              </Row>
              <Row label="Тема">{topicLabels[lead.topic]}</Row>
              <Row label="Срочность">
                <UrgencyBadge urgency={lead.urgency} />
              </Row>
              <Row label="Клиент">{clientTypeLabels[lead.clientType]}</Row>
              <Row label="Документы">{documentsLabels[lead.hasDocuments]}</Row>
              <Row label="Удобная связь">{contactMethodLabels[lead.contactMethod]}</Row>
            </dl>
          </Card>

          <Card title="Связаться">
            <div className="space-y-2 text-sm">
              <a
                href={`tel:${digits}`}
                className="block rounded-[10px] bg-shield px-4 py-2.5 text-center font-medium text-white hover:bg-shield-dark"
              >
                Позвонить {lead.phone}
              </a>
              <a
                href={`https://wa.me/${digits}`}
                target="_blank"
                rel="noreferrer"
                className="block rounded-[10px] border border-line px-4 py-2.5 text-center hover:border-shield hover:text-shield"
              >
                Написать в WhatsApp
              </a>
              {lead.tgUsername && (
                <a
                  href={`https://t.me/${lead.tgUsername}`}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-[10px] border border-line px-4 py-2.5 text-center hover:border-shield hover:text-shield"
                >
                  Написать в Telegram (@{lead.tgUsername})
                </a>
              )}
            </div>
          </Card>
        </aside>
      </div>
    </AdminShell>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-card border border-line bg-card p-5">
      <h2 className="text-xs font-medium tracking-wide text-ink-faint uppercase">{title}</h2>
      <div className="mt-3.5">{children}</div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-ink-faint">{label}</dt>
      <dd className="text-right">{children}</dd>
    </div>
  );
}
