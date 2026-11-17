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
 * Verifies the session with Supabase Auth and that the profile's role is
 * 'admin'. Redirects otherwise. Deduplicated per request with React `cache`.
 * Call it first in every DAL function and Server Action.
 */
export const requireAdmin = cache(async (): Promise<AdminUser> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    redirect('/forbidden');
  }

  return { id: user.id, email: user.email ?? null, fullName: profile.full_name };
});
