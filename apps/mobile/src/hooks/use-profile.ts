import type { Profile } from '@hetevch/shared';

import { useSupabaseQuery, type QueryResult } from '@/hooks/use-supabase-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/auth-provider';

/**
 * The signed-in user's own profile row. Filtered by id because RLS lets an admin read every
 * profile; reloads after `invalidate()` (e.g. once the name is edited).
 */
export function useProfile(): QueryResult<Profile> {
  const { session } = useAuth();
  const userId = session?.user.id ?? null;

  return useSupabaseQuery<Profile>(userId && `profile:${userId}`, async () =>
    supabase
      .from('profiles')
      .select('*')
      .eq('id', userId ?? '')
      .single(),
  );
}
