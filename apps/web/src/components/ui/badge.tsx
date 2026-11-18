import type { ReactNode } from 'react';

const TONES = {
  neutral: 'bg-surface-2 text-muted',
  accent: 'bg-accent-soft text-accent-text',
  income: 'bg-income-soft text-income',
  expense: 'bg-expense-soft text-expense',
} as const;

type BadgeProps = {
  tone?: keyof typeof TONES;
  children: ReactNode;
};

export function Badge({ tone = 'neutral', children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${TONES[tone]}`}
    >
      {children}
    </span>
  );
}
