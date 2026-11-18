import type { SavingsAccount } from '@hetevch/shared';

import { useSupabaseQuery, type QueryResult } from '@/hooks/use-supabase-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/auth-provider';

/** The signed-in user's savings, oldest first (filtered by user: RLS lets admins read all). */
export function useSavingsAccounts(): QueryResult<SavingsAccount[]> {
  const userId = useAuth().session?.user.id ?? null;

  return useSupabaseQuery<SavingsAccount[]>(userId && `savings:${userId}`, async () =>
    supabase
      .from('savings_accounts')
      .select('*')
      .eq('user_id', userId ?? '')
      .order('created_at'),
  );
}

/** One of the user's savings accounts, for the edit form; `id` undefined skips the query. */
export function useSavingsAccount(id: string | undefined): QueryResult<SavingsAccount> {
  const userId = useAuth().session?.user.id ?? null;

  return useSupabaseQuery<SavingsAccount>(userId && id ? `savings:${userId}:${id}` : null, async () =>
    supabase
      .from('savings_accounts')
      .select('*')
      .eq('user_id', userId ?? '')
      .eq('id', id ?? '')
      .single(),
  );
}
