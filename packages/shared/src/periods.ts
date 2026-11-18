import {
  addDays,
  formatDayLabel,
  formatMonthLabel,
  formatShortDate,
  fromISODate,
  toISODate,
  type DateRange,
} from './dates';

/** The overview's time windows. Weeks run Monday–Sunday, like Mongolian calendars. */
export type Period = 'day' | 'week' | 'month' | 'year';

export const PERIODS = ['day', 'week', 'month', 'year'] as const satisfies readonly Period[];

export const PERIOD_LABELS: Record<Period, string> = {
  day: 'Өдөр',
  week: '7 хоног',
  month: 'Сар',
  year: 'Жил',
};

/** The half-open day range of the period that contains `anchor` (a `YYYY-MM-DD` day). */
export function periodRange(period: Period, anchor: string): DateRange {
  const date = fromISODate(anchor);
  switch (period) {
    case 'day':
      return { from: anchor, to: addDays(anchor, 1) };
    case 'week': {
      const monday = addDays(anchor, -((date.getDay() + 6) % 7));
      return { from: monday, to: addDays(monday, 7) };
    }
    case 'month':
      return {
        from: toISODate(new Date(date.getFullYear(), date.getMonth(), 1)),
        to: toISODate(new Date(date.getFullYear(), date.getMonth() + 1, 1)),
      };
    case 'year':
      return {
        from: toISODate(new Date(date.getFullYear(), 0, 1)),
        to: toISODate(new Date(date.getFullYear() + 1, 0, 1)),
      };
  }
}

/** The anchor day `delta` periods before/after `anchor`. */
export function shiftPeriod(period: Period, anchor: string, delta: number): string {
  if (period === 'day') return addDays(anchor, delta);
  if (period === 'week') return addDays(anchor, delta * 7);
  const date = fromISODate(anchor);
  return period === 'month'
    ? toISODate(new Date(date.getFullYear(), date.getMonth() + delta, 1))
    : toISODate(new Date(date.getFullYear() + delta, 0, 1));
}

/** True when the period containing `anchor` also contains today (so "next" would be the future). */
export function isCurrentPeriod(period: Period, anchor: string, today: Date = new Date()): boolean {
  const { from, to } = periodRange(period, anchor);
  const todayIso = toISODate(today);
  return todayIso >= from && todayIso < to;
}

/** "Өнөөдөр", "Энэ 7 хоног", "11-р сарын 3–9", "Энэ сар", "2026 оны 10-р сар", "2026 он". */
export function formatPeriodLabel(period: Period, anchor: string, today: Date = new Date()): string {
  const current = isCurrentPeriod(period, anchor, today);
  const { from, to } = periodRange(period, anchor);
  switch (period) {
    case 'day':
      return formatDayLabel(anchor, today);
    case 'week': {
      if (current) return 'Энэ 7 хоног';
      const last = addDays(to, -1);
      const sameMonth = from.slice(0, 7) === last.slice(0, 7);
      return sameMonth
        ? `${formatShortDate(from)}–${fromISODate(last).getDate()}`
        : `${formatShortDate(from)} – ${formatShortDate(last)}`;
    }
    case 'month': {
      const date = fromISODate(anchor);
      return current ? 'Энэ сар' : formatMonthLabel({ year: date.getFullYear(), month: date.getMonth() });
    }
    case 'year':
      return current ? 'Энэ жил' : `${fromISODate(anchor).getFullYear()} он`;
  }
}
