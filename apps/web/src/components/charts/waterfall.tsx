import Link from 'next/link';

import { DataTable } from '@/components/charts/chart-parts';
import { formatTick } from '@/lib/chart-scale';

export type WaterfallStep = {
  key: string;
  label: string;
  icon: string;
  /** + money in, − money out; ignored for the closing `total` step. */
  value: number;
  total?: boolean;
  href?: string;
};

const signed = (value: number) => `${value >= 0 ? '+' : '−'}${formatTick(Math.abs(value))}`;

type Bar = WaterfallStep & { from: number; to: number; amount: number };

/** Each step starts where the previous ended; a `total` step spans 0 → the running sum. */
function toBars(steps: WaterfallStep[]): Bar[] {
  return steps.reduce<{ bars: Bar[]; running: number }>(
    ({ bars, running }, step) => {
      const from = step.total ? 0 : running;
      const to = step.total ? running : running + step.value;
      return {
        bars: [...bars, { ...step, from, to, amount: step.total ? to : step.value }],
        running: step.total ? running : to,
      };
    },
    { bars: [], running: 0 },
  ).bars;
}

/**
 * Money in, then each slice of money out, ending at what's left: every bar starts where the
 * previous one ended, so you can follow the money from left to right.
 */
export function Waterfall({ steps, label }: { steps: WaterfallStep[]; label: string }) {
  const bars = toBars(steps);
  const high = Math.max(1, ...bars.flatMap((bar) => [bar.from, bar.to]));
  const low = Math.min(0, ...bars.flatMap((bar) => [bar.from, bar.to]));
  const y = (value: number) => ((value - low) / (high - low)) * 100;

  return (
    <figure className="flex flex-col gap-2">
      <div aria-hidden className="relative h-44">
        <span className="absolute inset-x-0 h-px bg-border" style={{ bottom: `${y(0)}%` }} />
        <div className="absolute inset-0 flex gap-2 sm:gap-3">
          {bars.map((bar) => {
            const bottom = y(Math.min(bar.from, bar.to));
            const height = Math.max(1.5, y(Math.max(bar.from, bar.to)) - bottom);
            const color = bar.total ? (bar.to >= 0 ? 'bg-ink' : 'bg-expense') : bar.value >= 0 ? 'bg-chart-income' : 'bg-chart-expense';
            const tone = bar.total ? 'bg-ink text-on-ink' : bar.value >= 0 ? 'bg-income-soft text-income' : 'bg-expense-soft text-expense';
            const column = (
              <>
                <span className={`absolute inset-x-1 rounded-lg ${color}`} style={{ bottom: `${bottom}%`, height: `${height}%` }} />
                <span
                  className={`absolute left-1/2 -translate-x-1/2 rounded-full px-1.5 py-0.5 text-[10px] font-semibold whitespace-nowrap tabular-nums ${tone}`}
                  style={{ bottom: `calc(${bottom + height}% + 4px)` }}
                >
                  {signed(bar.amount)}
                </span>
              </>
            );
            const box = 'relative min-w-0 flex-1';
            return bar.href ? (
              <Link key={bar.key} href={bar.href} scroll={false} tabIndex={-1} className={`${box} rounded-lg hover:bg-surface-2/70`}>
                {column}
              </Link>
            ) : (
              <div key={bar.key} className={box}>
                {column}
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex gap-2 sm:gap-3">
        {bars.map((bar) => {
          const text = (
            <>
              <span aria-hidden className="block text-sm">{bar.icon}</span>
              <span className="block truncate text-[10px] text-muted">{bar.label}</span>
            </>
          );
          const box = 'min-w-0 flex-1 rounded-lg py-0.5 text-center';
          return bar.href ? (
            <Link key={bar.key} href={bar.href} scroll={false} className={`${box} hover:bg-surface-2`} title={`${bar.label}: дэлгэрэнгүй`}>
              {text}
            </Link>
          ) : (
            <span key={bar.key} className={box}>
              {text}
            </span>
          );
        })}
      </div>
      <DataTable caption={label} head={['Алхам', 'Дүн, ₮']} rows={bars.map((bar) => [bar.label, signed(bar.amount)])} />
    </figure>
  );
}
