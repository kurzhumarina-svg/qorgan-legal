'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import type { TopicSlug } from '@/lib/content';

/**
 * Связка «первый экран и карточки услуг → форма».
 *
 * ТЗ требует, чтобы форма понимала, что заинтересовало человека. Поэтому клик
 * по направлению или по примеру ситуации не просто скроллит вниз, а заранее
 * заполняет тему и описание — человеку остаётся ввести имя и телефон.
 */

export type Prefill = {
  topic?: TopicSlug;
  description?: string;
  /** Меняется при каждом запросе — так форма понимает, что пришли новые данные. */
  nonce: number;
};

type LeadFormValue = {
  prefill: Prefill;
  prefillForm: (data: { topic?: TopicSlug; description?: string }) => void;
};

const LeadFormContext = createContext<LeadFormValue | null>(null);

export function LeadFormProvider({ children }: { children: React.ReactNode }) {
  const [prefill, setPrefill] = useState<Prefill>({ nonce: 0 });

  const prefillForm = useCallback((data: { topic?: TopicSlug; description?: string }) => {
    setPrefill((prev) => ({
      topic: data.topic ?? prev.topic,
      description: data.description ?? prev.description,
      nonce: prev.nonce + 1,
    }));

    document.getElementById('form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const value = useMemo(() => ({ prefill, prefillForm }), [prefill, prefillForm]);

  return <LeadFormContext.Provider value={value}>{children}</LeadFormContext.Provider>;
}

export function useLeadForm(): LeadFormValue {
  const context = useContext(LeadFormContext);
  if (!context) {
    throw new Error('useLeadForm нужно вызывать внутри LeadFormProvider');
  }
  return context;
}
