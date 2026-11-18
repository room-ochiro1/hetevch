import Link from 'next/link';

import { filterHref, type Filters } from '@/lib/filters';
import { RANGES, RANGE_LABELS } from '@/lib/range';

/** The period every section below uses (`basePath` = that page). Keeps the age filter. */
export function RangeTabs({ filters, basePath = '/' }: { filters: Filters; basePath?: string }) {
  return (
    <nav aria-label="Хугацаа" className="flex gap-1 rounded-xl bg-surface-2 p-1">
      {RANGES.map((days) => {
        const selected = days === filters.days;
        return (
          <Link
            key={days}
            href={filterHref(basePath, { ...filters, days })}
            scroll={false}
            aria-current={selected ? 'page' : undefined}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap ${
              selected ? 'bg-surface text-foreground shadow-sm' : 'text-muted hover:text-foreground'
            }`}
          >
            {RANGE_LABELS[days]}
          </Link>
        );
      })}
    </nav>
  );
}
