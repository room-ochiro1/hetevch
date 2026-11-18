import AsyncStorage from '@react-native-async-storage/async-storage';
import { isDisplayCurrency, type DisplayCurrency } from '@hetevch/shared';
import { createContext, use, useEffect, useState, type ReactNode } from 'react';

import { fetchRates, isStale, readCachedRates, type Rates } from '@/lib/exchange-rate';

const STORAGE_KEY = 'hetevch.currency';

type CurrencyState = {
  /** What the user picked in Profile; tögrög until they pick another. */
  preference: DisplayCurrency;
  setPreference: (currency: DisplayCurrency) => void;
  /** What amounts are shown in: the preference, or tögrög while no rates are known. */
  currency: DisplayCurrency;
  rates: Rates | null;
};

const CurrencyContext = createContext<CurrencyState | null>(null);

/** Remembers the display currency on this device and keeps the exchange rates fresh. */
export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<DisplayCurrency>('MNT');
  const [rates, setRates] = useState<Rates | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [stored, cached] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY).catch(() => null),
        readCachedRates(),
      ]);
      if (cancelled) return;
      if (isDisplayCurrency(stored)) setPreferenceState(stored);
      if (cached) setRates(cached);
      if (!cached || isStale(cached)) {
        const fresh = await fetchRates();
        if (!cancelled && fresh) setRates(fresh);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  function setPreference(next: DisplayCurrency) {
    setPreferenceState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {
      // Not saved: the choice still applies until the app restarts.
    });
  }

  const currency = preference !== 'MNT' && !rates ? 'MNT' : preference;

  return (
    <CurrencyContext value={{ preference, setPreference, currency, rates }}>{children}</CurrencyContext>
  );
}

export function useCurrency(): CurrencyState {
  const value = use(CurrencyContext);
  if (!value) {
    throw new Error('useCurrency must be used inside <CurrencyProvider>');
  }
  return value;
}
