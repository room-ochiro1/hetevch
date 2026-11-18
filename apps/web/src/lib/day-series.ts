import { addDays } from '@hetevch/shared';

import { todayInUlaanbaatar } from '@/lib/range';

/**
 * The last `days` days (oldest first) with a value for every day, so a chart's gaps read as
 * zero instead of disappearing. `rows` may be sparse (only days that had something).
 */
export function fillDays(rows: { day: string; amount: number }[], days: number): { day: string; value: number }[] {
  const byDay = new Map(rows.map((row) => [row.day, row.amount]));
  const today = todayInUlaanbaatar();
  return Array.from({ length: days }, (_, i) => {
    const day = addDays(today, i - days + 1);
    return { day, value: byDay.get(day) ?? 0 };
  });
}

/** `part` of `whole` as a whole percent, or "—" when there is no whole. */
export function percent(part: number, whole: number): string {
  return whole > 0 ? `${Math.round((part / whole) * 100)}%` : '—';
}

/** How many times each ISO weekday (index 0 = Monday) occurs in the last `days` days. */
export function weekdayOccurrences(days: number): number[] {
  const counts = [0, 0, 0, 0, 0, 0, 0];
  for (const { day } of fillDays([], days)) {
    const index = (new Date(`${day}T12:00:00Z`).getUTCDay() + 6) % 7;
    counts[index] = (counts[index] ?? 0) + 1;
  }
  return counts;
}
