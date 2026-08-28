import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

config({ path: '.env.local', quiet: true });

/**
 * Посмотреть заявки в базе, не открывая админку:
 *   npm run db:leads
 *
 * Очистить тестовые данные перед сдачей (заявки, диалоги и историю апдейтов):
 *   npm run db:leads -- --clean
 */
async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('Не задан DATABASE_URL в .env.local');
    process.exit(1);
  }

  const sql = neon(url);

  if (process.argv.includes('--clean')) {
    // Порядок важен: tg_conversations ссылается на leads.
    await sql`delete from tg_conversations`;
    await sql`delete from tg_updates`;
    await sql`delete from leads`;
    console.log('Тестовые данные удалены.');
  }

  const rows = (await sql`
    select id, source, name, phone, topic, urgency, created_at, ai_summary
    from leads
    order by id
  `) as Record<string, unknown>[];

  console.log(`\nЗаявок в базе: ${rows.length}\n`);

  for (const row of rows) {
    console.log(`#${row.id}  [${row.source}]  ${row.name} — ${row.phone}`);
    console.log(`     тема: ${row.topic}, срочность: ${row.urgency}`);
    if (row.ai_summary) console.log(`     резюме бота: ${String(row.ai_summary).slice(0, 80)}…`);
    console.log('');
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
