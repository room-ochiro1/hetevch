import { fromISODate } from '@hetevch/shared';

import { WEEKDAY_LABELS } from '@/lib/age-bands';

const hourFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Ulaanbaatar',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

/** The current Ulaanbaatar time as { hour, minute, text: "08:30" }. */
export function ulaanbaatarClock(now = new Date()): { hour: number; minute: number; text: string } {
  const text = hourFormat.format(now);
  const [hour = 0, minute = 0] = text.split(':').map(Number);
  return { hour, minute, text };
}

/** "Өглөөний мэнд" before noon, "Өдрийн мэнд" until 18:00, then "Оройн мэнд". */
export function greetingFor(hour: number): string {
  if (hour >= 5 && hour < 12) return 'Өглөөний мэнд';
  if (hour >= 12 && hour < 18) return 'Өдрийн мэнд';
  return 'Оройн мэнд';
}

/** Weekday name of a `YYYY-MM-DD` day ("Пүрэв"). */
export function weekdayName(day: string): string {
  return WEEKDAY_LABELS[(fromISODate(day).getDay() + 6) % 7] ?? '';
}
