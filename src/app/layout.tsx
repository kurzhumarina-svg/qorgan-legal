import type { Metadata, Viewport } from 'next';
import { Golos_Text, Unbounded } from 'next/font/google';

import { company } from '@/lib/content';

import './globals.css';

/*
  Оба шрифта выбраны с кириллицей на первом месте, а не «латиница плюс как-нибудь».
  Golos Text — интерфейсный шрифт, привычный по государственным сервисам:
  для человека в стрессовой ситуации он читается как «официально, но по-человечески».
  Unbounded с его широкими инженерными формами работает на смысл названия
  (қорған — крепость) и используется только в заголовках.
*/
const golos = Golos_Text({
  variable: '--font-golos',
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600'],
  display: 'swap',
});

const unbounded = Unbounded({
  variable: '--font-unbounded',
  subsets: ['latin', 'cyrillic'],
  weight: ['500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: `${company.name} — юридическая помощь в Алматы`,
  description:
    'Опишите ситуацию своими словами — разберём вопрос и передадим юристу. Договоры, долги, досудебное урегулирование, суды, семейные вопросы, сопровождение бизнеса.',
};

export const viewport: Viewport = {
  themeColor: '#0e1f1b',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${golos.variable} ${unbounded.variable} h-full`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
