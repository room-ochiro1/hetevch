import {
  breakdownByCategory,
  formatPeriodLabel,
  isCurrentPeriod,
  periodRange,
  shiftPeriod,
  toISODate,
  type Period,
  type TransactionKind,
} from '@hetevch/shared';
import { useMemo, useState } from 'react';

import type { DonutSegment } from '@/components/overview/donut-chart';
import { useTotals, useTransactions } from '@/hooks/use-finance';
import { useCategoryColor } from '@/hooks/use-category-color';

/** Segments the ring shows by name; the rest folds into one neutral "other" slice. */
const MAX_RING_SEGMENTS = 5;

/** State and data for the home overview: kind, period, the anchor day and the breakdown. */
export function useOverview() {
  const { colorOf, other } = useCategoryColor();
  const [kind, setKind] = useState<TransactionKind>('expense');
  const [period, setPeriodState] = useState<Period>('month');
  const [anchor, setAnchor] = useState(() => toISODate(new Date()));
  const range = useMemo(() => periodRange(period, anchor), [period, anchor]);
  const transactions = useTransactions({ range });
  const balance = useTotals();

  const shares = useMemo(
    () => (transactions.data ? breakdownByCategory(transactions.data, kind) : []),
    [transactions.data, kind],
  );
  const total = shares.reduce((sum, share) => sum + share.total, 0);

  const segments = useMemo<DonutSegment[]>(() => {
    const named = shares.filter((s) => colorOf(s.category.color) !== other).slice(0, MAX_RING_SEGMENTS);
    const rest = shares.filter((s) => !named.includes(s)).reduce((sum, s) => sum + s.total, 0);
    const ring = named.map((s) => ({ key: s.category.id, value: s.total, color: colorOf(s.category.color) }));
    return rest > 0 ? [...ring, { key: 'other', value: rest, color: other }] : ring;
  }, [shares, colorOf, other]);

  const canGoNext = !isCurrentPeriod(period, anchor);

  return {
    kind,
    setKind,
    period,
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
    loading: transactions.data === null,
    error: transactions.error ?? balance.error,
    balance: balance.data?.net ?? null,
    shares,
    segments,
    total,
  };
}

export type Overview = ReturnType<typeof useOverview>;
