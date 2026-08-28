import { createLead } from '@/lib/leads';
import { leadInputSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, message: 'Некорректный запрос' }, { status: 400 });
  }

  // Та же схема, что и в форме на клиенте: проверка на клиенте — про удобство,
  // проверка здесь — про безопасность, запросу из браузера доверять нельзя.
  const parsed = leadInputSchema.safeParse(body);

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0] ?? 'form');
      errors[field] ??= issue.message;
    }
    return Response.json({ ok: false, errors }, { status: 400 });
  }

  try {
    const lead = await createLead({ ...parsed.data, source: 'site' });
    return Response.json({ ok: true, id: lead.id });
  } catch (error) {
    console.error('[api/leads] не удалось сохранить заявку:', error);
    return Response.json(
      { ok: false, message: 'Не удалось отправить заявку. Попробуйте ещё раз или позвоните нам.' },
      { status: 500 },
    );
  }
}
