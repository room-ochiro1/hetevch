import 'server-only';

import { createServerClient } from '@supabase/ssr';
import { io } from 'next/cache';
import { cookies } from 'next/headers';

import { supabaseEnv } from '@/lib/env';
import type { AdminDatabase } from '@/lib/supabase/types';

/**
 * Supabase client for Server Components, Server Actions and Route Handlers.
 * Create a new one per request; it acts as the signed-in user, so RLS applies.
 */
export async function createClient() {
  const cookieStore = await cookies();
  // Supabase Auth reads the clock (Date.now()) to check the session's expiry. A prefetch
  // prerender resolves cookies() but must not read the clock, so keep everything after
  // this out of every prerender; during a real request io() resolves immediately.
  await io();
  const { url, publishableKey } = supabaseEnv();

  return createServerClient<AdminDatabase>(url, publishableKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Server Components cannot write cookies; src/proxy.ts refreshes the session instead.
        }
      },
    },
  });
}
