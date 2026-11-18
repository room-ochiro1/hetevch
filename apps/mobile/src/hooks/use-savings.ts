import { SAVINGS_CARD_SELECT, type SavingsCard } from '@hetevch/shared';

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
