import type { Database } from './database.types';
import { formatMoney } from './format';

export type Currency = Database['public']['Enums']['currency_code'];

export const CURRENCIES = ['MNT', 'USD'] as const satisfies readonly Currency[];

/**
 * Income and expenses are always stored in tögrög. Another currency only changes how amounts
 * are shown (converted at the day's rate); savings cards may also be held in dollars.
 */
export const BASE_CURRENCY: Currency = 'MNT';

export const CURRENCY_INFO: Record<Currency, { symbol: string; label: string }> = {
  MNT: { symbol: '₮', label: 'Төгрөг' },
  USD: { symbol: '$', label: 'Доллар' },
};

const usd = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** "12,500 ₮" or "$12.50" (dollars always show cents). */
export function formatAmount(amount: number, currency: Currency): string {
  if (currency === 'MNT') return formatMoney(amount);
  return `${amount < 0 ? '-' : ''}$${usd.format(Math.abs(amount))}`;
}

/** Converts between tögrög and dollars; `usdRate` is tögrög per dollar. */
export function convertAmount(amount: number, from: Currency, to: Currency, usdRate: number): number {
  if (from === to) return amount;
  return from === 'USD' ? amount * usdRate : amount / usdRate;
}

/** Rounds to what the currency can hold (both columns keep 2 decimals). */
export function roundAmount(amount: number): number {
  return Math.round(amount * 100) / 100;
}
