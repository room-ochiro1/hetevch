import type { Session } from '@supabase/supabase-js';
import { createContext, use, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import {
  clearOnboardedLocally,
  ensureDeviceSession,
  markOnboardedLocally,
} from '@/lib/device-session';
import { supabase } from '@/lib/supabase';

type AuthState = {
  session: Session | null;
  isLoading: boolean;
  /** The welcome form (name + birth year) is still due on this phone. */
  needsOnboarding: boolean;
  /** Mongolian message when the first launch could not reach the server. */
  error: string | null;
  retry: () => void;
  /** Called by the welcome form once the profile is saved. */
  finishOnboarding: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

const OFFLINE_MESSAGE =
  'Сервертэй холбогдож чадсангүй. Интернэт холболтоо шалгаад дахин оролдоно уу.';

/**
 * No sign-in screen: on launch the phone gets (or restores) its own account via its device
 * key. See lib/device-session.ts and the device_accounts migration.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State is only set in promise callbacks, never synchronously in the effect that starts it.
  const load = useCallback(
    () =>
      ensureDeviceSession()
        .then(async (result) => {
          const { data } = await supabase.auth.getSession();
          setSession(data.session);
          setNeedsOnboarding(result.needsOnboarding);
          setError(null);
        })
        .catch((cause: unknown) => {
          // The user sees a plain message; keep the real reason in the dev logs.
          console.warn('[device-session]', cause instanceof Error ? cause.message : cause);
          setError(OFFLINE_MESSAGE);
        })
        .finally(() => setIsLoading(false)),
    [],
  );

  const retry = useCallback(() => {
    setIsLoading(true);
    setError(null);
    void load();
  }, [load]);

  useEffect(() => {
    void load();
    const { data: listener } = supabase.auth.onAuthStateChange((event, next) => {
      setSession(next);
      // Signing out or deleting the account leaves no session: start over as this device.
      if (event === 'SIGNED_OUT') {
        void clearOnboardedLocally().finally(retry);
      }
    });
    return () => listener.subscription.unsubscribe();
  }, [load, retry]);

  const finishOnboarding = useCallback(async () => {
    await markOnboardedLocally();
    setNeedsOnboarding(false);
  }, []);

  const value = useMemo(
    () => ({ session, isLoading, needsOnboarding, error, retry, finishOnboarding }),
    [session, isLoading, needsOnboarding, error, retry, finishOnboarding],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth(): AuthState {
  const value = use(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return value;
}
