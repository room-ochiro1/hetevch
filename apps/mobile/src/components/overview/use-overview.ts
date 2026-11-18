import {
  breakdownByCategory,
  formatPeriodLabel,
  isCurrentPeriod,
  periodRange,
  shiftPeriod,
  toISODate,
  type DateRange,
  type Period,
  type TransactionKind,
} from '@hetevch/shared';
import { useMemo, useState } from 'react';

import { buildCalendar } from '@/components/overview/calendar-data';
import type { DonutSegment } from '@/components/overview/donut-chart';
import { savingsByCard } from '@/components/overview/savings-by-card';
import { useBalance, useTransactions } from '@/hooks/use-finance';
import { useCategoryColor } from '@/hooks/use-category-color';
import { useSavingsMoves } from '@/hooks/use-savings';

/** Segments the ring shows by name; the rest folds into one neutral "other" slice. */
const MAX_RING_SEGMENTS = 5;

const inRange = (day: string, { from, to }: DateRange) => day >= from && day < to;

/**
 * State and data for the home overview: kind, period, the anchor day and the breakdown. On the
 * expense side, each savings card that gained money gets its own slice in the card's colour:
 * it is not spending, but it is where the money went, so shares are of spending + savings.
 */
export function useOverview() {
  const { colorOf, other } = useCategoryColor();
  const [kind, setKind] = useState<TransactionKind>('expense');
  const [period, setPeriodState] = useState<Period>('month');
  const [anchor, setAnchor] = useState(() => toISODate(new Date()));
  const range = useMemo(() => periodRange(period, anchor), [period, anchor]);
  // The calendar under the ring shows the whole week for a single day, so load that window.
  const loadRange = useMemo(
    () => (period === 'day' ? periodRange('week', anchor) : range),
    [period, anchor, range],
  );
  const transactions = useTransactions({ range: loadRange });
  const moves = useSavingsMoves(loadRange);
  const periodTx = useMemo(
    () => transactions.data?.filter((tx) => inRange(tx.occurred_on, range)) ?? null,
    [transactions.data, range],
  );
  const periodMoves = useMemo(
    () => (moves.data ?? []).filter((move) => inRange(move.occurred_on, range)),
    [moves.data, range],
  );
  // Income − expense − money put into savings cards.
  const balance = useBalance();

  // Net tögrög put into each card in the period; a card that lost money has no slice.
  const cards = useMemo(
    () => (kind === 'expense' ? savingsByCard(periodMoves) : []),
    [kind, periodMoves],
  );
  const saved = cards.reduce((sum, card) => sum + card.total, 0);

  const spent = useMemo(
    () => (periodTx ? breakdownByCategory(periodTx, kind) : []),
    [periodTx, kind],
  );
  const total = spent.reduce((sum, share) => sum + share.total, 0) + saved;
  const shares = useMemo(
    () => spent.map((s) => ({ ...s, share: total > 0 ? s.total / total : 0 })),
    [spent, total],
  );

  const segments = useMemo<DonutSegment[]>(() => {
    const named = shares.filter((s) => colorOf(s.category.color) !== other).slice(0, MAX_RING_SEGMENTS);
    const rest = shares.filter((s) => !named.includes(s)).reduce((sum, s) => sum + s.total, 0);
    const ring = named.map((s) => ({ key: s.category.id, value: s.total, color: colorOf(s.category.color) }));
    if (rest > 0) ring.push({ key: 'other', value: rest, color: other });
    for (const card of cards) ring.push({ key: `savings:${card.cardId}`, value: card.total, color: card.color });
    return ring;
  }, [shares, colorOf, other, cards]);

  const calendar = useMemo(
    () =>
      buildCalendar({
        period,
        anchor,
        kind,
        transactions: transactions.data ?? [],
        moves: moves.data ?? [],
        today: toISODate(new Date()),
      }),
    [period, anchor, kind, transactions.data, moves.data],
  );

  const canGoNext = !isCurrentPeriod(period, anchor);
  /** Drill down from the calendar: a tapped day or month becomes the period shown. */
  const open = (next: Period, date: string) => {
    setPeriodState(next);
    setAnchor(date);
  };

  return {
    kind,
    setKind,
    period,
    anchor,
    /** Switching period jumps back to the one containing today. */
    setPeriod: (next: Period) => {
      setPeriodState(next);
      setAnchor(toISODate(new Date()));
    },
    label: formatPeriodLabel(period, anchor),
    previous: () => setAnchor(shiftPeriod(period, anchor, -1)),
    next: () => {
      if (canGoNext) setAnchor(shiftPeriod(period, anchor, 1));
    },
    canGoNext,
    calendar,
    openDay: (date: string) => open('day', date),
    openMonth: (date: string) => open('month', date),
    loading: transactions.data === null || moves.data === null,
    error: transactions.error ?? moves.error ?? balance.error,
    balance: balance.data,
    shares,
    /** Savings cards that gained money in the period (expense side only), with ring shares. */
    savings: cards.map((card) => ({ ...card, share: total > 0 ? card.total / total : 0 })),
    segments,
    total,
  };
}

export type Overview = ReturnType<typeof useOverview>;
