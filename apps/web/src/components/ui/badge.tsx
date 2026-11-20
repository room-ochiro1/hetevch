import type { ReactNode } from 'react';

const TONES = {
  neutral: 'bg-surface-2 text-muted',
  accent: 'bg-accent-soft text-accent-text',
  income: 'bg-income-soft text-income',
  expense: 'bg-expense-soft text-expense',
  warn: 'bg-warn-soft text-warn',
  ink: 'bg-ink text-on-ink',
} as const;

export type BadgeTone = keyof typeof TONES;

type BadgeProps = {
  tone?: BadgeTone;
  children: ReactNode;
};

/** Status pill: "Шинэ", "Орлого", "Анхаар". */
export function Badge({ tone = 'neutral', children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${TONES[tone]}`}
    >
      {children}
    </span>
  );
}

/** The quiet top-right pill of a card: "30 хоног", "4 нээлттэй", "Шууд". */
export function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1 text-xs font-medium whitespace-nowrap text-muted">
      {children}
    </span>
  );
}
