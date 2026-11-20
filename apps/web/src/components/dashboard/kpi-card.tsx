import Link from 'next/link';
import type { ReactNode } from 'react';

import type { IconComponent } from '@/components/ui/icons';
import { changeRatio } from '@/lib/chart-scale';

const TONES = {
  accent: 'bg-accent-soft text-accent-text',
  income: 'bg-income-soft text-income',
  expense: 'bg-expense-soft text-expense',
  warn: 'bg-warn-soft text-warn',
} as const;

export type Delta = {
  current: number;
  previous: number;
  /** Names the comparison, e.g. "өмнөх 30 хоногоос" (tooltip). */
  versus: string;
  /** 'up-good' colors a rise green and a fall red; 'neutral' keeps it gray. */
  polarity?: 'up-good' | 'neutral';
};

function DeltaPill({ current, previous, versus, polarity = 'up-good' }: Delta) {
  const ratio = changeRatio(current, previous);
  const direction = ratio === null || ratio > 0 ? 'up' : ratio < 0 ? 'down' : 'flat';
  const tone =
    polarity === 'neutral' || direction === 'flat'
      ? 'bg-surface-2 text-muted'
      : direction === 'up'
        ? 'bg-income-soft text-income'
        : 'bg-expense-soft text-expense';
  const text =
    ratio === null
      ? 'Шинэ'
      : `${direction === 'up' ? '▲' : direction === 'down' ? '▼' : '•'} ${Math.abs(Math.round(ratio * 100))}%`;
  return (
    <span title={versus} className={`rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap tabular-nums ${tone}`}>
      {text}
      <span className="sr-only"> {versus}</span>
    </span>
  );
}

type KpiCardProps = {
  icon: IconComponent;
  tone?: keyof typeof TONES;
  label: string;
  value: string;
  hint: string;
  delta?: Delta;
  /** Small chart to the right of the value. */
  viz?: ReactNode;
  /** Full-width row under the value (e.g. a split bar with a legend). */
  footer?: ReactNode;
  /** Opens a detail dialog with the breakdown behind this number. */
  href?: string;
};

/** Stat card: tinted icon · label · change pill / big value · hint · mini chart. */
export function KpiCard({ icon: Icon, tone = 'accent', label, value, hint, delta, viz, footer, href }: KpiCardProps) {
  const body = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-2.5 text-sm font-medium">
          <span className={`grid size-8 shrink-0 place-items-center rounded-xl ${TONES[tone]}`}>
            <Icon className="size-4" />
          </span>
          <span className="truncate">{label}</span>
        </span>
        {delta ? <DeltaPill {...delta} /> : null}
      </div>
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className={`leading-none font-semibold tracking-tight tabular-nums ${value.length > 10 ? 'text-2xl' : 'text-[28px]'}`}>
            {value}
          </p>
          <p className="mt-2 truncate text-xs text-muted">{hint}</p>
        </div>
        {viz}
      </div>
      {footer}
    </>
  );
  const box = 'flex h-full flex-col gap-4 rounded-3xl bg-surface p-5 shadow-card';
  return href ? (
    <Link
      href={href}
      scroll={false}
      title="Дэлгэрэнгүй харах"
      className={`${box} transition-shadow hover:shadow-pop focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:outline-none`}
    >
      {body}
    </Link>
  ) : (
    <div className={box}>{body}</div>
  );
}

export function KpiCardSkeleton() {
  return <div aria-hidden className="h-[150px] animate-pulse rounded-3xl bg-surface-2" />;
}
