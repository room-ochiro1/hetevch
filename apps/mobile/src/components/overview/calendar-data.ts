import {
  addDays,
  fromISODate,
  periodRange,
  toISODate,
  type Period,
  type SavingsMove,
  type TransactionKind,
  type TransactionListItem,
} from '@hetevch/shared';

import { cardColor } from '@/constants/savings-appearance';

/** Monday first, like Mongolian calendars (and `periodRange`). */
export const WEEKDAY_SHORT = ['Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя', 'Ня'] as const;

export type CalendarCell = {
  /** The day, or the month's first day in the year view (`YYYY-MM-DD`). */
  date: string;
  label: string;
  /** The chosen kind's tögrög total for the cell. */
  total: number;
  /** 0–1 against the busiest cell, square-root scaled so small days still show. */
  intensity: number;
  /** Colour of the card that gained most that day or month (expense side only), else null. */
  savedColor: string | null;
  isToday: boolean;
  isFuture: boolean;
  /** The day the overview is showing (day period only). */
  isSelected: boolean;
};

export type CalendarView =
  | { view: 'month'; weeks: (CalendarCell | null)[][] }
  | { view: 'week'; days: CalendarCell[] }
  | { view: 'year'; months: CalendarCell[] };

type CalendarInput = {
  period: Period;
  anchor: string;
  kind: TransactionKind;
  transactions: readonly TransactionListItem[];
  moves: readonly SavingsMove[];
  today: string;
};

/**
 * Cells for the calendar under the ring: a month grid for a month, the week's seven days for
 * a week or a day, twelve months for a year. Data must cover that whole window.
 */
export function buildCalendar(input: CalendarInput): CalendarView {
  const { period, anchor, kind, today } = input;
  const byMonth = period === 'year';
  const keyOf = (date: string) => (byMonth ? date.slice(0, 7) : date);

  const totals = new Map<string, number>();
  for (const tx of input.transactions) {
    if (tx.kind !== kind) continue;
    const key = keyOf(tx.occurred_on);
    totals.set(key, (totals.get(key) ?? 0) + tx.amount);
  }
  const savedNet = new Map<string, number>();
  const topCard = new Map<string, { color: string; amount: number }>();
  if (kind === 'expense') {
    for (const move of input.moves) {
      const key = keyOf(move.occurred_on);
      const amount = move.base_amount ?? 0;
      savedNet.set(key, (savedNet.get(key) ?? 0) + amount);
      const top = topCard.get(key);
      if (move.card && amount > 0 && (!top || amount > top.amount)) {
        topCard.set(key, { color: cardColor(move.card.color), amount });
      }
    }
  }
  const max = Math.max(0, ...totals.values());
  const todayKey = keyOf(today);

  const cell = (date: string, label: string): CalendarCell => {
    const key = keyOf(date);
    const total = totals.get(key) ?? 0;
    return {
      date,
      label,
      total,
      intensity: max > 0 && total > 0 ? Math.sqrt(total / max) : 0,
      savedColor: (savedNet.get(key) ?? 0) > 0 ? (topCard.get(key)?.color ?? null) : null,
      isToday: key === todayKey,
      isFuture: key > todayKey,
      isSelected: period === 'day' && date === anchor,
    };
  };

  if (period === 'year') {
    const year = fromISODate(anchor).getFullYear();
    const months = Array.from({ length: 12 }, (_, month) =>
      cell(toISODate(new Date(year, month, 1)), `${month + 1}-р сар`),
    );
    return { view: 'year', months };
  }

  if (period === 'month') {
    const { from, to } = periodRange('month', anchor);
    const lead = (fromISODate(from).getDay() + 6) % 7;
    const slots: (CalendarCell | null)[] = Array.from({ length: lead }, () => null);
    for (let day = from; day < to; day = addDays(day, 1)) {
      slots.push(cell(day, String(fromISODate(day).getDate())));
    }
    while (slots.length % 7 !== 0) slots.push(null);
    const weeks = Array.from({ length: slots.length / 7 }, (_, i) => slots.slice(i * 7, i * 7 + 7));
    return { view: 'month', weeks };
  }

  const { from } = periodRange('week', anchor);
  const days = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(from, i);
    return cell(day, String(fromISODate(day).getDate()));
  });
  return { view: 'week', days };
}
