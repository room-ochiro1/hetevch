import Link from 'next/link';

import { filterHref, type Filters } from '@/lib/filters';
import { RANGES, RANGE_LABELS } from '@/lib/range';

/** The period every section below uses (`basePath` = that page). Keeps the other filters. */
export function RangeTabs({ filters, basePath = '/' }: { filters: Filters; basePath?: string }) {
  return (
    <nav aria-label="Хугацаа" className="flex gap-1 rounded-full bg-surface-2 p-1">
      {RANGES.map((days) => {
        const selected = days === filters.days;
        return (
          <Link
            key={days}
            href={filterHref(basePath, { ...filters, days })}
            scroll={false}
            aria-current={selected ? 'page' : undefined}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
              selected ? 'bg-surface text-foreground shadow-card' : 'text-muted hover:text-foreground'
            }`}
          >
            {RANGE_LABELS[days]}
          </Link>
        );
      })}
    </nav>
  );
}
