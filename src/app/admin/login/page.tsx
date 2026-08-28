import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Вход — админка QORGAN Legal',
  robots: { index: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex flex-1 items-center justify-center px-5 py-24">
      <div className="w-full max-w-sm">
        <span className="strata" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>

        <h1 className="mt-6 text-2xl font-semibold">Админка QORGAN Legal</h1>
        <p className="mt-2 text-sm text-ink-soft">Заявки с сайта и из Telegram в одном списке.</p>

        <form method="POST" action="/api/admin/login" className="mt-8">
          <label htmlFor="password" className="block text-sm font-medium">
            Пароль
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="mt-2 w-full rounded-[10px] border border-line bg-card px-3.5 py-2.5 outline-none focus:border-shield"
          />

          {error && (
            <p role="alert" className="mt-3 text-sm text-signal">
              Неверный пароль. Попробуйте ещё раз.
            </p>
          )}

          <button
            type="submit"
            className="mt-5 w-full rounded-full bg-shield px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-shield-dark"
          >
            Войти
          </button>
        </form>
      </div>
    </main>
  );
}
