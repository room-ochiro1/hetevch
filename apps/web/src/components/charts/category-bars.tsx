import { formatMoney } from '@hetevch/shared';

import { EmptyState } from '@/components/ui/empty-state';
import type { CategoryTotal } from '@/lib/dal/overview';
import { formatCount } from '@/lib/format';

type CategoryBarsProps = {
  categories: CategoryTotal[];
  /** The kind's total for the period; shares are of this, so a cut-off tail still counts. */
  total: number;
  /** Bar color class: one hue for all bars, since identity comes from the labels. */
  barClass: string;
  emptyTitle: string;
};

/** Ranked horizontal bars, largest first: amount at the end, share and count underneath. */
export function CategoryBars({ categories, total, barClass, emptyTitle }: CategoryBarsProps) {
  if (categories.length === 0) {
    return <EmptyState title={emptyTitle} hint="Хэрэглэгчид гүйлгээ бүртгэхээр энд харагдана." />;
  }
  const max = Math.max(1, ...categories.map((c) => c.total));
  const base = Math.max(total, categories.reduce((sum, c) => sum + c.total, 0));

  return (
    <ol className="flex flex-col gap-4">
      {categories.map((category) => {
        const share = base > 0 ? Math.round((category.total / base) * 100) : 0;
        return (
          <li key={category.categoryId} className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2">
                <span aria-hidden className="text-base">
                  {category.icon}
                </span>
                <span className="truncate font-medium">{category.name}</span>
              </span>
              <span className="shrink-0 font-semibold tabular-nums">{formatMoney(category.total)}</span>
            </div>
            <div className="h-2 rounded-full bg-surface-2">
              <div
                className={`h-full rounded-full ${barClass}`}
                style={{ width: `${Math.max(2, (category.total / max) * 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted tabular-nums">
              {share}% · {formatCount(category.txCount)} гүйлгээ
            </p>
          </li>
        );
      })}
    </ol>
  );
}
