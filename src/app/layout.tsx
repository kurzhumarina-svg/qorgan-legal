import type { Metadata, Viewport } from 'next';
import { Commissioner, Literata } from 'next/font/google';

import { company } from '@/lib/content';

import './globals.css';

/*
  Две гарнитуры — два голоса в разговоре, и это не украшение, а способ различать,
  кто говорит. Commissioner — голос клиента и интерфейса: гуманистический гротеск,
  спокойный и негромкий. Literata — голос компании: серифная, книжная; ею набраны
  заголовки, ответные реплики и ответы в FAQ.

  Обе выбраны с кириллицей как основным алфавитом, а не «латиница плюс как-нибудь».
*/
const ui = Commissioner({
  variable: '--font-ui',
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600'],
  display: 'swap',
});

const voice = Literata({
  variable: '--font-voice',
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: `${company.name} — юридическая помощь в Алматы`,
  description:
    'Опишите ситуацию своими словами — разберём вопрос и передадим юристу. Договоры, долги, досудебное урегулирование, суды, семейные вопросы, сопровождение бизнеса.',
};

export const viewport: Viewport = {
  themeColor: '#241c1a',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${ui.variable} ${voice.variable} h-full`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
