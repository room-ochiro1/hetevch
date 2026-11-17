import type { Profile } from '@hetevch/shared';
import { useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/auth-provider';

/** Loads the signed-in user's own profile row (RLS limits it to their row). */
export function useProfile() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      return;
    }
    let cancelled = false;

    supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
      .then(({ data, error: queryError }) => {
        if (cancelled) return;
        setProfile(data);
        setError(queryError?.message ?? null);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return { profile, error };
}
