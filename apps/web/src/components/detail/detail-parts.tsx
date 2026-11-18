import Link from 'next/link';
import type { ReactNode } from 'react';

import { filterHref, type Detail, type Filters } from '@/lib/filters';

/** Where a dialog lives: the page and its filters, so links inside keep both. */
export type DetailCtx = { basePath: string; filters: Filters };

export const detailHref = (ctx: DetailCtx, detail: Detail, filters: Partial<Filters> = {}) =>
  filterHref(ctx.basePath, { ...ctx.filters, ...filters }, detail);

export function DetailHeader({ icon, title, subtitle, children }: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  children?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-3 pr-12">
      <div className="flex items-center gap-3">
        <span aria-hidden className="grid size-11 shrink-0 place-items-center rounded-xl bg-surface-2 text-2xl">
          {icon}
        </span>
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold">{title}</h2>
          <p className="text-xs text-muted">{subtitle}</p>
        </div>
      </div>
      {children}
    </header>
  );
}

export type Stat = { label: string; value: string; hint?: string; tone?: 'income' | 'expense' };

/** The headline numbers of a dialog, each with a one-line hint that makes it readable. */
export function Stats({ items }: { items: Stat[] }) {
  return (
    <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-xl border border-border bg-surface px-3.5 py-3">
          <dt className="text-xs text-muted">{item.label}</dt>
          <dd
            className={`mt-0.5 truncate text-lg font-semibold tabular-nums ${
              item.tone === 'income' ? 'text-income' : item.tone === 'expense' ? 'text-expense' : ''
            }`}
          >
            {item.value}
          </dd>
          {item.hint ? <p className="mt-0.5 text-[11px] leading-snug text-muted">{item.hint}</p> : null}
        </div>
      ))}
    </dl>
  );
}

export function Section({ title, hint, children, action }: {
  title: string;
  hint?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          {hint ? <p className="text-xs text-muted">{hint}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export type BarRow = {
  key: string;
  label: string;
  icon?: string;
  value: number;
  text: string;
  note?: string;
  href?: string;
  dim?: boolean;
};

/** Ranked bars; rows with `href` open another dialog in place. */
export function BarList({ rows, barClass = 'bg-chart-1', empty }: { rows: BarRow[]; barClass?: string; empty: string }) {
  if (rows.length === 0) return <p className="py-4 text-center text-sm text-muted">{empty}</p>;
  const max = Math.max(1, ...rows.map((row) => row.value));
  return (
    <ol className="flex flex-col gap-1">
      {rows.map((row) => {
        const body = (
          <>
            <span className="flex items-baseline justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2">
                {row.icon ? <span aria-hidden>{row.icon}</span> : null}
                <span className="truncate font-medium">{row.label}</span>
              </span>
              <span className="shrink-0 font-semibold tabular-nums">{row.text}</span>
            </span>
            <span className="block h-1.5 rounded-full bg-surface-2">
              <span
                className={`block h-full rounded-full ${barClass}`}
                style={{ width: `${row.value > 0 ? Math.max(2, (row.value / max) * 100) : 0}%` }}
              />
            </span>
            {row.note ? <span className="text-[11px] text-muted tabular-nums">{row.note}</span> : null}
          </>
        );
        const box = `-mx-2 flex flex-col gap-1 rounded-lg px-2 py-1.5 ${row.dim ? 'opacity-50' : ''}`;
        return (
          <li key={row.key}>
            {row.href ? (
              <Link href={row.href} scroll={false} className={`${box} hover:bg-surface-2`}>
                {body}
              </Link>
            ) : (
              <div className={box}>{body}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function DetailSkeleton() {
  return (
    <div aria-busy className="flex flex-col gap-4" aria-label="Ачаалж байна">
      <div className="h-11 w-64 animate-pulse rounded-xl bg-surface-2" />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-surface-2" />
        ))}
      </div>
      <div className="h-56 animate-pulse rounded-2xl bg-surface-2" />
      <div className="h-40 animate-pulse rounded-2xl bg-surface-2" />
    </div>
  );
}
