import {
  summarize,
  type DateRange,
  type SavingsMove,
  type TransactionKind,
  type TransactionListItem,
} from '@hetevch/shared';
import { useMemo } from 'react';

import { useTransactions } from '@/hooks/use-finance';
import { useSavingsMoves } from '@/hooks/use-savings';
import type { QueryResult } from '@/hooks/use-supabase-query';

type Base = {
  key: string;
  /** How it moves the balance: into savings leaves it like an expense, out of savings returns. */
  kind: TransactionKind;
  /** Tögrög, always positive. */
  amount: number;
  occurred_on: string;
  created_at: string;
};

/**
 * One row of the transaction list: a transaction, or money moved into or out of a savings
 * card. Savings rows move the balance but never count as income or expense.
 */
export type MoneyMove =
  | (Base & { source: 'transaction'; transaction: TransactionListItem })
  | (Base & { source: 'savings'; move: SavingsMove });

const newestFirst = (a: MoneyMove, b: MoneyMove) =>
  b.occurred_on.localeCompare(a.occurred_on) || b.created_at.localeCompare(a.created_at);

export function mergeMoves(
  transactions: readonly TransactionListItem[],
  moves: readonly SavingsMove[],
): MoneyMove[] {
  const rows: MoneyMove[] = transactions.map((transaction) => ({
    key: `t:${transaction.id}`,
    kind: transaction.kind,
    amount: transaction.amount,
    occurred_on: transaction.occurred_on,
    created_at: transaction.created_at,
    source: 'transaction',
    transaction,
  }));
  for (const move of moves) {
    if (move.base_amount === null) continue;
    rows.push({
      key: `s:${move.id}`,
      kind: move.base_amount > 0 ? 'expense' : 'income',
      amount: Math.abs(move.base_amount),
      occurred_on: move.occurred_on,
      created_at: move.created_at,
      source: 'savings',
      move,
    });
  }
  return rows.sort(newestFirst);
}

/**
 * A period's transactions and savings movements as one list, plus its income/expense totals
 * (transactions only) and the net tögrög moved into savings (negative if more came out).
 */
export function usePeriodMoves(range: DateRange) {
  const transactions = useTransactions({ range });
  const moves = useSavingsMoves(range);
  const txData = transactions.data;
  const moveData = moves.data;

  const data = useMemo(
    () => (txData && moveData ? mergeMoves(txData, moveData) : null),
    [txData, moveData],
  );
  const totals = useMemo(() => (txData ? summarize(txData) : null), [txData]);
  const saved = useMemo(
    () => (moveData ? moveData.reduce((sum, move) => sum + (move.base_amount ?? 0), 0) : null),
    [moveData],
  );

  const result: QueryResult<MoneyMove[]> = {
    data,
    error: transactions.error ?? moves.error,
    loading: transactions.loading || moves.loading,
  };
  return { result, totals, saved };
}
