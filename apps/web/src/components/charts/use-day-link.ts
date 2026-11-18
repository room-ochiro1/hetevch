'use client';

import { useRouter } from 'next/navigation';

import { filterHref, type Filters } from '@/lib/filters';

/** Where a chart's day should open its detail dialog: the page and its current filters. */
export type DayLink = { basePath: string; filters: Filters };

/** `open(day)` opens that day's detail dialog, or null when the chart isn't linked. */
export function useDayLink(link: DayLink | undefined): ((day: string) => void) | null {
  const router = useRouter();
  if (!link) return null;
  return (day) => router.push(filterHref(link.basePath, link.filters, { type: 'day', day }), { scroll: false });
}
