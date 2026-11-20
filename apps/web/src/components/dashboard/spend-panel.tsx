import Link from 'next/link';

import { Pill } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { ChevronRightIcon } from '@/components/ui/icons';
import { Panel } from '@/components/ui/panel';
import { formatCompactMoney } from '@/lib/chart-scale';
import { getDashboard } from '@/lib/dal/analytics';
import { getTopCategories } from '@/lib/dal/overview';
import { formatCount } from '@/lib/format';
import { filterHref, type Filters } from '@/lib/filters';

/** Where the money goes: the biggest expense categories, each as a share of all spending. */
export async function SpendPanel({ filters }: { filters: Filters }) {
  const { days, band, sex } = filters;
  const [{ current }, categories] = await Promise.all([
    getDashboard(days, band, sex),
    getTopCategories('expense', days, band, sex),
  ]);
  const shown = categories.slice(0, 5);
  const base = Math.max(current.expense, 1);

  return (
    <Panel
      title="Хаана зарцуулж байна"
      description="Хамгийн их зарлагатай ангиллууд · бар урт = зарлагын хувь"
      action={<Pill>Зарлага</Pill>}
      className="h-full"
    >
      {shown.length === 0 ? (
        <EmptyState title="Зарлага бүртгэгдээгүй байна" />
      ) : (
        <div className="flex h-full flex-col gap-1">
          <ol className="flex flex-col gap-1">
            {shown.map((category) => {
              const share = category.total / base;
              return (
                <li key={category.categoryId}>
                  <Link
                    href={filterHref('/', filters, { type: 'category', id: category.categoryId, band: null })}
                    scroll={false}
                    className="-mx-2 flex items-center gap-3 rounded-2xl px-2 py-2 hover:bg-surface-2"
                  >
                    <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-full bg-surface-2 text-base">
                      {category.icon}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                      <span className="flex items-baseline justify-between gap-2 text-sm">
                        <span className="truncate font-medium">{category.name}</span>
                        <span className="shrink-0 text-xs text-muted tabular-nums">
                          <span className="font-semibold text-foreground">{Math.round(share * 100)}%</span> ·{' '}
                          {formatCompactMoney(category.total)}
                        </span>
                      </span>
                      <span className="block h-2 rounded-full bg-surface-2">
                        <span
                          className="block h-full rounded-full bg-gradient-to-r from-chart-expense/55 to-chart-expense"
                          style={{ width: `${Math.max(3, share * 100)}%` }}
                        />
                      </span>
                      <span className="sr-only">{formatCount(category.txCount)} гүйлгээ</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
          <Link
            href={filterHref('/', filters, { type: 'kind', kind: 'expense' })}
            scroll={false}
            className="mt-auto flex items-center justify-end gap-0.5 border-t border-border pt-3 text-xs font-semibold hover:underline"
          >
            Бүх зарлагыг задлах <ChevronRightIcon className="size-3.5" />
          </Link>
        </div>
      )}
    </Panel>
  );
}
