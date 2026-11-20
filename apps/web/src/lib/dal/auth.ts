import 'server-only';

import { redirect } from 'next/navigation';
import { cache } from 'react';

import { createClient } from '@/lib/supabase/server';

export type AdminUser = {
  id: string;
  email: string | null;
  fullName: string | null;
};

/**
 * Verifies the session and that the profile's role is 'admin'. Redirects otherwise.
 * Deduplicated per request with React `cache`. Call it first in every DAL function and Server
 * Action.
 *
 * The JWT is checked with `getClaims()`: the project signs with asymmetric (ES256) keys, so the
 * signature is verified locally against the cached JWKS instead of a round trip to Supabase
 * Auth on every page. The role still comes from the database on every call (through RLS, as
 * this user), so taking admin away or deleting the account takes effect at once.
 */
export const requireAdmin = cache(async (): Promise<AdminUser> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims.sub;

  if (!userId) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, role')
    .eq('id', userId)
    .single();

  if (profile?.role !== 'admin') {
    redirect('/forbidden');
  }

  return { id: userId, email: profile.email, fullName: profile.full_name };
});
