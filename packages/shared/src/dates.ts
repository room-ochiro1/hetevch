/**
 * Calendar-day helpers. Days are local `YYYY-MM-DD` strings, matching Postgres `date`,
 * so a transaction made late in the evening never slips into the next UTC day.
 */

const WEEKDAYS = ['Ням', 'Даваа', 'Мягмар', 'Лхагва', 'Пүрэв', 'Баасан', 'Бямба'] as const;

/** A calendar month; `month` is 0-based like `Date#getMonth()`. */
export type MonthKey = { year: number; month: number };

/** Half-open day range: `from` inclusive, `to` exclusive. */
export type DateRange = { from: string; to: string };

export function toISODate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Parses `YYYY-MM-DD` as a local date (`new Date(iso)` would parse it as UTC). */
export function fromISODate(iso: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) {
    throw new Error(`Invalid date: ${iso}`);
  }
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

export function addDays(iso: string, days: number): string {
  const date = fromISODate(iso);
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

export function monthOf(date: Date): MonthKey {
  return { year: date.getFullYear(), month: date.getMonth() };
}

export function shiftMonth({ year, month }: MonthKey, delta: number): MonthKey {
  return monthOf(new Date(year, month + delta, 1));
}

export function isSameMonth(a: MonthKey, b: MonthKey): boolean {
  return a.year === b.year && a.month === b.month;
}

export function monthRange({ year, month }: MonthKey): DateRange {
  return {
    from: toISODate(new Date(year, month, 1)),
    to: toISODate(new Date(year, month + 1, 1)),
  };
}

/** "2026 оны 11-р сар" */
export function formatMonthLabel({ year, month }: MonthKey): string {
  return `${year} оны ${month + 1}-р сар`;
}

/*
 * Mongolian dates are built by hand on purpose. Browsers ship no Mongolian Intl data, so
 * `Intl.DateTimeFormat('mn-MN')` gives "Oct 19" in the browser but "10-р сарын 19" in Node:
 * a hydration mismatch on the web and English text in the app. These output the same everywhere.
 */

/** "10-р сарын 19" */
export function formatShortDate(iso: string): string {
  const date = fromISODate(iso);
  return `${date.getMonth() + 1}-р сарын ${date.getDate()}`;
}

/** "2026 оны 10-р сарын 19" */
export function formatLongDate(iso: string): string {
  return `${fromISODate(iso).getFullYear()} оны ${formatShortDate(iso)}`;
}

/** "Өнөөдөр", "Өчигдөр", or "11-р сарын 15, Мягмар" (year added when not the current one). */
export function formatDayLabel(iso: string, today: Date = new Date()): string {
  const todayIso = toISODate(today);
  if (iso === todayIso) return 'Өнөөдөр';
  if (iso === addDays(todayIso, -1)) return 'Өчигдөр';

  const date = fromISODate(iso);
  const label = date.getFullYear() === today.getFullYear() ? formatShortDate(iso) : formatLongDate(iso);
  return `${label}, ${WEEKDAYS[date.getDay()]}`;
}
