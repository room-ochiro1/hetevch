import { formatLongDate, formatShortDate } from '@hetevch/shared';

/*
 * Deterministic formatters. Browsers ship without Mongolian (mn-MN) Intl data and fall back
 * to English, while Node has it, so Intl 'mn-MN' output differs between server and client
 * and breaks hydration. Dates use the shared Mongolian helpers (same wording as the mobile
 * app); only locale-neutral Intl formats (en-CA, en-GB, en-US) are used here.
 */

const TIME_ZONE = 'Asia/Ulaanbaatar';
const localDay = new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE });
const localTime = new Intl.DateTimeFormat('en-GB', {
  timeZone: TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
});
const numberFormat = new Intl.NumberFormat('en-US');

/** A Postgres `date` ("2026-11-17") → "2026 оны 11-р сарын 17". */
export function formatDay(iso: string): string {
  return formatLongDate(iso);
}

/** Short axis label for a Postgres `date` → "11-р сарын 17". */
export function formatShortDay(iso: string): string {
  return formatShortDate(iso);
}

/** A `timestamptz` in Ulaanbaatar time → "2026 оны 11-р сарын 17, 14:05". */
export function formatDateTime(timestamp: string): string {
  const date = new Date(timestamp);
  return `${formatLongDate(localDay.format(date))}, ${localTime.format(date)}`;
}

/** "08:18" for a timestamp on `today` (Ulaanbaatar), otherwise "11-р сарын 17". */
export function formatWhen(timestamp: string, today: string): string {
  const date = new Date(timestamp);
  const day = localDay.format(date);
  return day === today ? localTime.format(date) : formatShortDate(day);
}

export function formatCount(value: number): string {
  return numberFormat.format(value);
}
