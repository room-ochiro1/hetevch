import { DISPLAY_CURRENCIES, type UsdRates } from '@hetevch/shared';
import AsyncStorage from '@react-native-async-storage/async-storage';

/** ExchangeRate-API's open endpoint: free, no key, updated daily. Its terms ask for attribution. */
export const RATE_SOURCE = { name: 'ExchangeRate-API', url: 'https://www.exchangerate-api.com' };

const ENDPOINT = 'https://open.er-api.com/v6/latest/USD';
/** v2: every display currency (v1, 'hetevch.usdRate', held tögrög only and is ignored). */
const STORAGE_KEY = 'hetevch.rates';
/** The provider updates once a day; refetching twice a day is plenty. */
const MAX_AGE_MS = 12 * 60 * 60 * 1000;

export type Rates = {
  /** Units of each display currency per dollar. */
  perUsd: UsdRates;
  /** When the provider last updated them (ms since epoch). */
  updatedAt: number;
  /** When this device downloaded them. */
  fetchedAt: number;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

/** Every currency present and positive; tögrög in a sane range (guards a broken response). */
function toUsdRates(value: unknown): UsdRates | null {
  if (!isRecord(value)) return null;
  const mnt = value.MNT;
  if (typeof mnt !== 'number' || mnt < 100 || mnt > 100_000) return null;
  const rates: Partial<UsdRates> = {};
  for (const currency of DISPLAY_CURRENCIES) {
    const rate = currency === 'USD' ? 1 : value[currency];
    if (typeof rate !== 'number' || !Number.isFinite(rate) || rate <= 0) return null;
    rates[currency] = rate;
  }
  return rates as UsdRates;
}

function toRates(value: unknown): Rates | null {
  if (!isRecord(value) || typeof value.updatedAt !== 'number' || typeof value.fetchedAt !== 'number') {
    return null;
  }
  const perUsd = toUsdRates(value.perUsd);
  return perUsd ? { perUsd, updatedAt: value.updatedAt, fetchedAt: value.fetchedAt } : null;
}

export async function readCachedRates(): Promise<Rates | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return toRates(raw ? JSON.parse(raw) : null);
  } catch {
    return null;
  }
}

export function isStale(rates: Rates): boolean {
  return Date.now() - rates.fetchedAt > MAX_AGE_MS;
}

/** Downloads today's rates and caches them; null when offline or the answer looks wrong. */
export async function fetchRates(): Promise<Rates | null> {
  try {
    const response = await fetch(ENDPOINT);
    if (!response.ok) return null;
    const body: unknown = await response.json();
    if (!isRecord(body) || body.result !== 'success') return null;
    const perUsd = toUsdRates(body.rates);
    if (!perUsd) return null;
    const updated = body.time_last_update_unix;
    const rates: Rates = {
      perUsd,
      updatedAt: typeof updated === 'number' ? updated * 1000 : Date.now(),
      fetchedAt: Date.now(),
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(rates));
    return rates;
  } catch {
    return null;
  }
}
