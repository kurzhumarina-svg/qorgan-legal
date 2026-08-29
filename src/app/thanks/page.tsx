import type { Metadata } from 'next';
import Link from 'next/link';

import { SiteFooter } from '@/components/site/site-footer';
import { company } from '@/lib/content';

export const metadata: Metadata = {
  title: `Обращение получено — ${company.name}`,
  robots: { index: false },
};

export default function ThanksPage() {
  return (
    <>
      <main className="flex flex-1 items-center justify-center px-5 py-24">
        <div className="w-full max-w-lg rounded-card border border-line bg-card p-8 text-center sm:p-10">
          <span className="dialog-mark mx-auto w-fit items-center" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>

          <h1 className="mt-6 text-3xl leading-tight font-semibold">Спасибо! Обращение получено</h1>

          <p className="mt-4 leading-relaxed text-ink-soft">
            Сотрудник {company.name} свяжется с вами, уточнит формат консультации и при
            необходимости попросит дополнительные материалы.
          </p>

          <div className="mt-8 rounded-[10px] bg-paper p-4 text-sm text-ink-soft">
            Если вопрос срочный, можно позвонить:{' '}
            <a
              href={`tel:${company.phoneHref}`}
              className="font-medium text-shield hover:text-shield-dark"
            >
              {company.phone}
            </a>
          </div>

          <Link
            href="/"
            className="mt-8 inline-block rounded-full bg-shield px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-shield-dark"
          >
            Вернуться на главную
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
