import { PERIODS, toISODate, type Period, type TransactionKind } from '@hetevch/shared';
import { router } from 'expo-router';

/** What a statement is about: one category, or money moved into and out of savings (one card or all). */
export type StatementTarget = { type: 'category'; id: string } | { type: 'savings'; cardId?: string };

export type StatementWindow = { kind: TransactionKind; period: Period; anchor: string };

/** Opens the bank-statement view of a category (or savings) for the period on screen. */
export function openStatement(target: StatementTarget, { kind, period, anchor }: StatementWindow) {
  router.push({
    pathname: '/statement',
    params: {
      ...(target.type === 'category' ? { category: target.id } : { savings: target.cardId ?? '1' }),
      kind,
      period,
      anchor,
    },
  });
}

type RawParams = { category?: string; savings?: string; kind?: string; period?: string; anchor?: string };

/** Route params → a target and window, with safe defaults for anything missing or malformed. */
export function parseStatementParams(params: RawParams): {
  target: StatementTarget | null;
  window: StatementWindow;
} {
  const target: StatementTarget | null = params.category
    ? { type: 'category', id: params.category }
    : params.savings
      ? { type: 'savings', ...(params.savings !== '1' ? { cardId: params.savings } : {}) }
      : null;
  const period = PERIODS.find((value) => value === params.period) ?? 'month';
  const anchor =
    params.anchor && /^\d{4}-\d{2}-\d{2}$/.test(params.anchor) ? params.anchor : toISODate(new Date());
  const kind = params.kind === 'income' ? 'income' : 'expense';
  return { target, window: { kind, period, anchor } };
}
