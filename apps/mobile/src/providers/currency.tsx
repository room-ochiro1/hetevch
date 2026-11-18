import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Currency } from '@hetevch/shared';
import { createContext, use, useEffect, useState, type ReactNode } from 'react';

import { fetchUsdRate, isStale, readCachedRate, type UsdRate } from '@/lib/exchange-rate';

const STORAGE_KEY = 'hetevch.currency';

type CurrencyState = {
  /** What the user picked in Profile; tögrög until they pick dollars. */
  preference: Currency;
  setPreference: (currency: Currency) => void;
  /** What amounts are shown in: the preference, or tögrög while no dollar rate is known. */
  currency: Currency;
  rate: UsdRate | null;
};

const CurrencyContext = createContext<CurrencyState | null>(null);

/** Remembers the display currency on this device and keeps the dollar rate fresh. */
export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<Currency>('MNT');
  const [rate, setRate] = useState<UsdRate | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [stored, cached] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY).catch(() => null),
        readCachedRate(),
      ]);
      if (cancelled) return;
      if (stored === 'MNT' || stored === 'USD') setPreferenceState(stored);
      if (cached) setRate(cached);
      if (!cached || isStale(cached)) {
        const fresh = await fetchUsdRate();
        if (!cancelled && fresh) setRate(fresh);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  function setPreference(next: Currency) {
    setPreferenceState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {
      // Not saved: the choice still applies until the app restarts.
    });
  }

  const currency = preference === 'USD' && !rate ? 'MNT' : preference;

  return (
    <CurrencyContext value={{ preference, setPreference, currency, rate }}>{children}</CurrencyContext>
  );
}

export function useCurrency(): CurrencyState {
  const value = use(CurrencyContext);
  if (!value) {
    throw new Error('useCurrency must be used inside <CurrencyProvider>');
  }
  return value;
}
