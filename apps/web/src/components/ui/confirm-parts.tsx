import type { ReactNode } from 'react';

import { CheckIcon, InfoIcon } from '@/components/ui/icons-more';

const BUTTONS = {
  primary: 'bg-ink text-on-ink hover:opacity-90',
  secondary: 'bg-surface text-foreground ring-1 ring-border hover:bg-surface-2',
  danger: 'bg-surface text-expense ring-1 ring-border hover:bg-expense-soft',
  success: 'bg-income-soft text-income ring-1 ring-income/20',
} as const;

export type ButtonVariant = keyof typeof BUTTONS;

/** Shared button look for dialogs and task cards. */
export function buttonClass(variant: ButtonVariant, size: 'sm' | 'md' = 'md'): string {
  const box = size === 'sm' ? 'rounded-xl px-3.5 py-2 text-xs' : 'rounded-xl px-4 py-2.5 text-sm';
  return `inline-flex items-center justify-center gap-1.5 font-semibold whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${box} ${BUTTONS[variant]}`;
}

function StepDot({ state, number }: { state: 'done' | 'current' | 'next'; number: number }) {
  if (state === 'done') {
    return (
      <span className="grid size-6 place-items-center rounded-full bg-income text-on-ink">
        <CheckIcon className="size-3.5" />
      </span>
    );
  }
  return (
    <span
      className={`grid size-6 place-items-center rounded-full text-xs font-semibold ${
        state === 'current' ? 'bg-ink text-on-ink' : 'bg-surface-2 text-muted'
      }`}
    >
      {number}
    </span>
  );
}

/** "① Шалгах —— ② Баталгаажуулах" with the finished steps ticked. */
export function Stepper({ step, done }: { step: 1 | 2; done: boolean }) {
  return (
    <ol aria-label="Алхам" className="flex items-center gap-3 text-sm font-medium">
      <li className="flex items-center gap-2" aria-current={step === 1 ? 'step' : undefined}>
        <StepDot state={step > 1 || done ? 'done' : 'current'} number={1} />
        Шалгах
      </li>
      <li aria-hidden className={`h-0.5 w-10 rounded ${step > 1 ? 'bg-income' : 'bg-border'}`} />
      <li className={`flex items-center gap-2 ${step === 1 ? 'text-muted' : ''}`} aria-current={step === 2 ? 'step' : undefined}>
        <StepDot state={done ? 'done' : step === 2 ? 'current' : 'next'} number={2} />
        Баталгаажуулах
      </li>
    </ol>
  );
}

/** A full-width checkbox row the admin must tick before confirming. */
export function CheckRow({ checked, onChange, children }: { checked: boolean; onChange: (value: boolean) => void; children: ReactNode }) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-3 rounded-2xl px-4 py-3.5 text-sm ring-1 transition-colors ${
        checked ? 'bg-surface-2/60 ring-ink/20' : 'ring-border hover:bg-surface-2/50'
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-[18px] shrink-0 accent-ink"
      />
      {children}
    </label>
  );
}

/** Grey info row with an icon (what happens next, who can see it). */
export function Notice({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-start gap-3 rounded-2xl bg-surface-2/70 px-4 py-3 text-xs leading-relaxed text-muted">
      <InfoIcon className="mt-px size-4 shrink-0" />
      {children}
    </p>
  );
}

/** A label/value pair in the review step ("Одоогийн эрх · Хэрэглэгч"). */
export function ReviewRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-2.5 text-sm last:border-0">
      <span className="text-muted">{label}</span>
      <span className="min-w-0 text-right font-medium">{children}</span>
    </div>
  );
}
