import Link from 'next/link';

import { RANGES, RANGE_LABELS, type RangeDays } from '@/lib/range';

/** A page's one filter row: the period every section below uses (`basePath` = that page). */
export function RangeTabs({ active, basePath = '/' }: { active: RangeDays; basePath?: string }) {
  return (
    <nav aria-label="Хугацаа" className="flex gap-1 rounded-xl bg-surface-2 p-1">
      {RANGES.map((days) => {
        const selected = days === active;
        return (
          <Link
            key={days}
            href={`${basePath}?range=${days}`}
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
