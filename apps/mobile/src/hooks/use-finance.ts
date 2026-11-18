import {
  TRANSACTION_LIST_SELECT,
  toTotals,
  type Category,
  type DateRange,
  type Totals,
  type TransactionListItem,
} from '@hetevch/shared';

import { useSupabaseQuery, type QueryResult } from '@/hooks/use-supabase-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/auth-provider';

/*
 * Every query filters by the signed-in user's id on purpose: RLS lets an admin read all
 * users' rows, but in the app even the owner should only see their own money.
 */

function useUserId(): string | null {
  const { session } = useAuth();
  return session?.user.id ?? null;
}

/** All categories, in display order. They rarely change, so the key ignores the user. */
export function useCategories(): QueryResult<Category[]> {
  return useSupabaseQuery('categories', () =>
    supabase.from('categories').select('*').order('sort_order'),
  );
}

type TransactionsOptions = { range?: DateRange; limit?: number };

/** The user's transactions, newest first, optionally limited to a date range or a count. */
export function useTransactions({ range, limit }: TransactionsOptions = {}) {
  const userId = useUserId();
  const key = userId && `tx:${userId}:${range?.from ?? ''}:${range?.to ?? ''}:${limit ?? ''}`;

  return useSupabaseQuery<TransactionListItem[]>(key, () => {
    let query = supabase
      .from('transactions')
      .select(TRANSACTION_LIST_SELECT)
      .eq('user_id', userId ?? '')
      .order('occurred_on', { ascending: false })
      .order('created_at', { ascending: false });
    if (range) query = query.gte('occurred_on', range.from).lt('occurred_on', range.to);
    if (limit) query = query.limit(limit);
    return query;
  });
}

/** One of the user's transactions, for the edit form. Skipped when `id` is undefined. */
export function useTransaction(id: string | undefined) {
  const userId = useUserId();
  const key = userId && id ? `tx-one:${id}` : null;

  return useSupabaseQuery<TransactionListItem>(key, () =>
    supabase
      .from('transactions')
      .select(TRANSACTION_LIST_SELECT)
      .eq('id', id ?? '')
      .eq('user_id', userId ?? '')
      .single(),
  );
}

/** Income, expense and net for a date range, or all time (the balance) without one. */
export function useTotals(range?: DateRange): QueryResult<Totals> {
  const userId = useUserId();
  const key = userId && `totals:${userId}:${range?.from ?? ''}:${range?.to ?? ''}`;

  return useSupabaseQuery<Totals>(key, async () => {
    const args = range ? { p_from: range.from, p_to: range.to } : {};
    const { data, error } = await supabase.rpc('my_finance_totals', args).single();
    return {
      data: data ? toTotals(Number(data.income), Number(data.expense)) : null,
      error,
    };
  });
}
