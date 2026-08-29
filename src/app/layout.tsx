import type { Metadata, Viewport } from 'next';
import { Golos_Text, Literata } from 'next/font/google';

import { company } from '@/lib/content';

import './globals.css';

/*
  Две гарнитуры — два голоса в разговоре, и это не украшение, а способ различать,
  кто говорит. Golos Text — голос клиента и интерфейса: сухой, привычный по
  государственным сервисам. Literata — голос компании: серифная, книжная, спокойная;
  ею набраны заголовки и ответные реплики. Обе выбраны с кириллицей как основным
  алфавитом, а не «латиница плюс как-нибудь».
*/
const golos = Golos_Text({
  variable: '--font-golos',
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600'],
  display: 'swap',
});

const literata = Literata({
  variable: '--font-literata',
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
  themeColor: '#1c1a17',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${golos.variable} ${literata.variable} h-full`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
