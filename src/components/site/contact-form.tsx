'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { company, services } from '@/lib/content';
import {
  clientTypeLabels,
  contactMethodLabels,
  documentsLabels,
  leadInputSchema,
  urgencyLabels,
} from '@/lib/validation';

import { useLeadForm } from './lead-form-context';

type FormValues = {
  name: string;
  phone: string;
  clientType: string;
  topic: string;
  description: string;
  urgency: string;
  hasDocuments: string;
  contactMethod: string;
};

/** Значения по умолчанию выбраны так, чтобы форма заполнялась за минуту. */
const initialValues: FormValues = {
  name: '',
  phone: '',
  clientType: 'individual',
  topic: '',
  description: '',
  urgency: 'days',
  hasDocuments: 'unknown',
  contactMethod: 'telegram',
};

export function ContactForm() {
  const router = useRouter();
  const { prefill } = useLeadForm();

  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Данные, выбранные на первом экране или в карточке услуги.
  useEffect(() => {
    if (prefill.nonce === 0) return;
    setValues((current) => ({
      ...current,
      topic: prefill.topic ?? current.topic,
      description: prefill.description ?? current.description,
    }));
  }, [prefill]);

  function update<K extends keyof FormValues>(field: K, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    // Та же схема, что и на сервере: сообщения об ошибках совпадают.
    const parsed = leadInputSchema.safeParse(values);

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const field = String(issue.path[0] ?? 'form');
        fieldErrors[field] ??= issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors(data.errors ?? {});
        setFormError(data.message ?? 'Проверьте заполненные поля.');
        setSubmitting(false);
        return;
      }

      router.push('/thanks');
    } catch {
      setFormError('Нет связи с сервером. Проверьте интернет или позвоните нам.');
      setSubmitting(false);
    }
  }

  return (
    <section id="form" className="scroll-mt-20 bg-ink text-paper">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 lg:grid-cols-[minmax(0,340px)_1fr] lg:gap-16">
        <div>
          <p className="eyebrow !text-shield-soft">Контакты</p>
          <h2 className="mt-4 text-3xl leading-tight font-semibold sm:text-4xl">
            Опишите ситуацию
          </h2>
          <p className="mt-4 text-paper/70">
            Заполнение займёт около минуты. На первом шаге не нужны ИИН, документы и сканы —
            только суть вопроса и контакт для связи.
          </p>

          {/* Крупные кликабельные контакты: с телефона по ним звонят и пишут в один тап. */}
          <div className="mt-8 flex flex-col gap-2.5">
            <a
              href={`tel:${company.phoneHref}`}
              className="flex items-center justify-between rounded-[10px] border border-paper/20 px-4 py-3 text-sm transition-colors hover:border-shield-soft hover:bg-white/5"
            >
              <span>Позвонить</span>
              <span className="text-paper/60">{company.phone}</span>
            </a>
            <a
              href={company.whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between rounded-[10px] border border-paper/20 px-4 py-3 text-sm transition-colors hover:border-shield-soft hover:bg-white/5"
            >
              <span>Написать в WhatsApp</span>
              <span className="text-paper/60">{company.whatsappPhone}</span>
            </a>
            <a
              href={company.telegramHref}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between rounded-[10px] border border-paper/20 px-4 py-3 text-sm transition-colors hover:border-shield-soft hover:bg-white/5"
            >
              <span>Telegram-помощник</span>
              <span className="text-paper/60">@{company.telegramBot}</span>
            </a>
          </div>

          <dl className="mt-8 space-y-5 text-sm">
            <div>
              <dt className="text-paper/50">Адрес</dt>
              <dd className="mt-1">
                {company.city}, {company.address}
              </dd>
            </div>
            <div>
              <dt className="text-paper/50">Email</dt>
              <dd className="mt-1">
                <a href={`mailto:${company.email}`} className="hover:text-shield-soft">
                  {company.email}
                </a>
              </dd>
            </div>
          </dl>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-[18px] bg-card p-6 text-ink sm:p-8"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Как к вам обращаться" error={errors.name} htmlFor="name">
              <input
                id="name"
                value={values.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="Азамат"
                autoComplete="name"
                className={inputClass(errors.name)}
              />
            </Field>

            <Field label="Телефон" error={errors.phone} htmlFor="phone">
              <input
                id="phone"
                value={values.phone}
                onChange={(e) => update('phone', e.target.value)}
                placeholder="+7 700 000 00 00"
                inputMode="tel"
                autoComplete="tel"
                className={inputClass(errors.phone)}
              />
            </Field>
          </div>

          <div className="mt-6">
            <Choice
              label="Вы обращаетесь как"
              name="clientType"
              value={values.clientType}
              options={clientTypeLabels}
              onChange={(v) => update('clientType', v)}
              error={errors.clientType}
            />
          </div>

          <div className="mt-6">
            <Field label="Тема" error={errors.topic} htmlFor="topic">
              <select
                id="topic"
                value={values.topic}
                onChange={(e) => update('topic', e.target.value)}
                className={inputClass(errors.topic)}
              >
                <option value="">Выберите тему</option>
                {services.map((service) => (
                  <option key={service.slug} value={service.slug}>
                    {service.title}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="mt-6">
            <Field label="Кратко опишите ситуацию" error={errors.description} htmlFor="description">
              <textarea
                id="description"
                value={values.description}
                onChange={(e) => update('description', e.target.value)}
                rows={5}
                placeholder="Несколько предложений своими словами: что произошло, когда и чего хотите добиться."
                className={`${inputClass(errors.description)} resize-y leading-relaxed`}
              />
            </Field>
          </div>

          <div className="mt-6 grid gap-6">
            <Choice
              label="Насколько срочно"
              name="urgency"
              value={values.urgency}
              options={urgencyLabels}
              onChange={(v) => update('urgency', v)}
              error={errors.urgency}
            />
            <Choice
              label="Есть ли документы"
              name="hasDocuments"
              value={values.hasDocuments}
              options={documentsLabels}
              onChange={(v) => update('hasDocuments', v)}
              error={errors.hasDocuments}
            />
            <Choice
              label="Как удобно связаться"
              name="contactMethod"
              value={values.contactMethod}
              options={contactMethodLabels}
              onChange={(v) => update('contactMethod', v)}
              error={errors.contactMethod}
            />
          </div>

          {formError && (
            <p role="alert" className="mt-6 rounded-[10px] bg-signal-soft px-4 py-3 text-sm text-signal">
              {formError}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-7 w-full rounded-full bg-shield px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-shield-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Отправляем…' : 'Отправить обращение'}
          </button>

          <p className="mt-4 text-center text-xs leading-relaxed text-ink-faint">
            Отправляя форму, вы соглашаетесь на обработку указанных данных для связи с вами.
          </p>
        </form>
      </div>
    </section>
  );
}

function inputClass(error?: string): string {
  return [
    'w-full rounded-[10px] border bg-paper/40 px-3.5 py-2.5 text-[15px] text-ink outline-none',
    'placeholder:text-ink-faint focus:bg-white',
    error ? 'border-signal focus:border-signal' : 'border-line focus:border-shield',
  ].join(' ');
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium">
        {label}
      </label>
      <div className="mt-2">{children}</div>
      {error && <p className="mt-1.5 text-xs text-signal">{error}</p>}
    </div>
  );
}

/** Переключатель-таблетки вместо выпадающего списка: быстрее на телефоне. */
function Choice({
  label,
  name,
  value,
  options,
  onChange,
  error,
}: {
  label: string;
  name: string;
  value: string;
  options: Record<string, string>;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-medium">{label}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {Object.entries(options).map(([key, title]) => {
          const active = value === key;
          return (
            <label
              key={key}
              className={[
                'cursor-pointer rounded-full border px-3.5 py-1.5 text-[13px] transition-colors',
                active
                  ? 'border-shield bg-shield text-white'
                  : 'border-line text-ink-soft hover:border-shield hover:text-shield',
              ].join(' ')}
            >
              <input
                type="radio"
                name={name}
                value={key}
                checked={active}
                onChange={() => onChange(key)}
                className="sr-only"
              />
              {title}
            </label>
          );
        })}
      </div>
      {error && <p className="mt-1.5 text-xs text-signal">{error}</p>}
    </fieldset>
  );
}
