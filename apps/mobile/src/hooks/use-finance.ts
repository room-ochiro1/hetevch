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

export function useUserId(): string | null {
  const { session } = useAuth();
  return session?.user.id ?? null;
}

/**
 * The built-in categories (no owner) plus the user's own, in display order: built-ins first,
 * then the user's in the order they were added. Keyed by user, since each sees different ones.
 */
export function useCategories(): QueryResult<Category[]> {
  const userId = useUserId();
  return useSupabaseQuery(userId && `categories:${userId}`, () =>
    supabase
      .from('categories')
      .select('*')
      .or(`owner_id.is.null,owner_id.eq.${userId ?? ''}`)
      .order('sort_order')
      .order('created_at'),
  );
}

type TransactionsOptions = { range?: DateRange; limit?: number; categoryId?: string };

/**
 * The user's transactions, newest first, optionally limited to a date range, a category or
 * a count.
 */
export function useTransactions({ range, limit, categoryId }: TransactionsOptions = {}) {
  const userId = useUserId();
  const key =
    userId &&
    `tx:${userId}:${range?.from ?? ''}:${range?.to ?? ''}:${limit ?? ''}:${categoryId ?? ''}`;

  return useSupabaseQuery<TransactionListItem[]>(key, () => {
    let query = supabase
      .from('transactions')
      .select(TRANSACTION_LIST_SELECT)
      .eq('user_id', userId ?? '')
      .order('occurred_on', { ascending: false })
      .order('created_at', { ascending: false });
    if (range) query = query.gte('occurred_on', range.from).lt('occurred_on', range.to);
    if (categoryId) query = query.eq('category_id', categoryId);
    if (limit) query = query.limit(limit);
    return query;
  });
}

/** Income and expense totals (transactions only) for a date range. */
export function useTotals(range: DateRange): QueryResult<Totals> {
  const userId = useUserId();
  const key = userId && `totals:${userId}:${range.from}:${range.to}`;

  return useSupabaseQuery<Totals>(key, async () => {
    const { data, error } = await supabase
      .rpc('my_finance_totals', { p_from: range.from, p_to: range.to })
      .single();
    return { data: data ? toTotals(Number(data.income), Number(data.expense)) : null, error };
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

/**
 * The user's balance in tögrög: all income − all expense − money moved into savings cards
 * (taking money out of a card adds it back). A card's opening balance does not count.
 */
export function useBalance(): QueryResult<number> {
  const userId = useUserId();

  return useSupabaseQuery<number>(userId && `balance:${userId}`, async () => {
    const { data, error } = await supabase.rpc('my_balance');
    return { data: data === null ? null : Number(data), error };
  });
}
