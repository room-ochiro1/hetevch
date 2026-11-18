import {
  SAVINGS_CARD_SELECT,
  SAVINGS_MOVE_SELECT,
  type DateRange,
  type SavingsCard,
  type SavingsMove,
} from '@hetevch/shared';

import { useSupabaseQuery, type QueryResult } from '@/hooks/use-supabase-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/auth-provider';

/** Newest movement first, so histories read top-down. */
function sortEntries(card: SavingsCard): SavingsCard {
  const entries = [...card.entries].sort(
    (a, b) => b.occurred_on.localeCompare(a.occurred_on) || b.created_at.localeCompare(a.created_at),
  );
  return { ...card, entries };
}

/** The user's savings cards with their movements, oldest card first (RLS lets admins read all). */
export function useSavingsCards(): QueryResult<SavingsCard[]> {
  const userId = useAuth().session?.user.id ?? null;

  return useSupabaseQuery<SavingsCard[]>(userId && `savings:${userId}`, async () => {
    const { data, error } = await supabase
      .from('savings_accounts')
      .select(SAVINGS_CARD_SELECT)
      .eq('user_id', userId ?? '')
      .order('created_at');
    return { data: data ? data.map(sortEntries) : null, error };
  });
}

/** One card with its history; `id` undefined skips the query (a new card). */
export function useSavingsCard(id: string | undefined): QueryResult<SavingsCard> {
  const userId = useAuth().session?.user.id ?? null;

  return useSupabaseQuery<SavingsCard>(userId && id ? `savings:${userId}:${id}` : null, async () => {
    const { data, error } = await supabase
      .from('savings_accounts')
      .select(SAVINGS_CARD_SELECT)
      .eq('user_id', userId ?? '')
      .eq('id', id ?? '')
      .single();
    return { data: data ? sortEntries(data) : null, error };
  });
}

/**
 * Money the user moved into or out of savings cards in a date range, newest first. Only rows
 * with a tögrög value: those are the ones that move the balance.
 */
export function useSavingsMoves(range: DateRange): QueryResult<SavingsMove[]> {
  const userId = useAuth().session?.user.id ?? null;
  const key = userId && `savings-moves:${userId}:${range.from}:${range.to}`;

  return useSupabaseQuery<SavingsMove[]>(key, () =>
    supabase
      .from('savings_entries')
      .select(SAVINGS_MOVE_SELECT)
      .eq('user_id', userId ?? '')
      .not('base_amount', 'is', null)
      .gte('occurred_on', range.from)
      .lt('occurred_on', range.to)
      .order('occurred_on', { ascending: false })
      .order('created_at', { ascending: false }),
  );
}
