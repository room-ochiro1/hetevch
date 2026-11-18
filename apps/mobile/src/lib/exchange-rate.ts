import AsyncStorage from '@react-native-async-storage/async-storage';

/** ExchangeRate-API's open endpoint: free, no key, updated daily. Its terms ask for attribution. */
export const RATE_SOURCE = { name: 'ExchangeRate-API', url: 'https://www.exchangerate-api.com' };

const ENDPOINT = 'https://open.er-api.com/v6/latest/USD';
const STORAGE_KEY = 'hetevch.usdRate';
/** The provider updates once a day; refetching twice a day is plenty. */
const MAX_AGE_MS = 12 * 60 * 60 * 1000;

export type UsdRate = {
  /** Tögrög per dollar. */
  value: number;
  /** When the provider last updated it (ms since epoch). */
  updatedAt: number;
  /** When this device downloaded it. */
  fetchedAt: number;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

/** A tögrög-per-dollar figure that is plausible at all (guards against a broken response). */
const isPlausible = (value: unknown): value is number =>
  typeof value === 'number' && value > 100 && value < 100_000;

function isUsdRate(value: unknown): value is UsdRate {
  return (
    isRecord(value) &&
    isPlausible(value.value) &&
    typeof value.updatedAt === 'number' &&
    typeof value.fetchedAt === 'number'
  );
}

export async function readCachedRate(): Promise<UsdRate | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    return isUsdRate(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function isStale(rate: UsdRate): boolean {
  return Date.now() - rate.fetchedAt > MAX_AGE_MS;
}

/** Downloads today's rate and caches it; null when offline or the answer looks wrong. */
export async function fetchUsdRate(): Promise<UsdRate | null> {
  try {
    const response = await fetch(ENDPOINT);
    if (!response.ok) return null;
    const body: unknown = await response.json();
    if (!isRecord(body) || body.result !== 'success' || !isRecord(body.rates)) return null;
    const value = body.rates.MNT;
    if (!isPlausible(value)) return null;
    const updated = body.time_last_update_unix;
    const rate: UsdRate = {
      value,
      updatedAt: typeof updated === 'number' ? updated * 1000 : Date.now(),
      fetchedAt: Date.now(),
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(rate));
    return rate;
  } catch {
    return null;
  }
}
