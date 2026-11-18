import type { Database } from './database.types';
import { formatMoney } from './format';

/** Currencies a savings card can be held in (the database's currency_code). */
export type Currency = Database['public']['Enums']['currency_code'];

/**
 * Currencies amounts can be shown in: tögrög and the ten foreign currencies Mongolians use
 * most (the main currencies on Mongolbank's commercial-bank rate table, plus the biggest
 * diaspora countries: Korea, the US, Japan, Czechia, Sweden, Australia). Display only:
 * income and expenses are stored in tögrög, savings cards in a `Currency`.
 */
export const DISPLAY_CURRENCIES = [
  'MNT', 'USD', 'CNY', 'KRW', 'RUB', 'JPY', 'EUR', 'GBP', 'AUD', 'CZK', 'SEK',
] as const;

export type DisplayCurrency = (typeof DISPLAY_CURRENCIES)[number];

/** Card currencies are also display currencies (the `satisfies` keeps that true). */
export const CURRENCIES = ['MNT', 'USD'] as const satisfies readonly (Currency & DisplayCurrency)[];

export const BASE_CURRENCY: Currency = 'MNT';

/** The display currency if a savings card can be held in it too, else tögrög (for defaults). */
export function toCardCurrency(currency: DisplayCurrency): Currency {
  return CURRENCIES.find((card) => card === currency) ?? BASE_CURRENCY;
}

type CurrencyInfo = {
  symbol: string;
  /** Mongolian name. */
  label: string;
  /** Minor units shown (ISO 4217; tögrög is shown whole). */
  decimals: 0 | 2;
  /** "$12.50" vs "1,250 ₽". */
  symbolFirst: boolean;
  /** Common round amounts: one tap instead of typing. */
  quick: readonly number[];
};

export const CURRENCY_INFO: Record<DisplayCurrency, CurrencyInfo> = {
  MNT: { symbol: '₮', label: 'Төгрөг', decimals: 0, symbolFirst: false, quick: [1000, 5000, 10000, 20000, 50000] },
  USD: { symbol: '$', label: 'Ам.доллар', decimals: 2, symbolFirst: true, quick: [1, 5, 10, 20, 50] },
  CNY: { symbol: 'CN¥', label: 'Юань', decimals: 2, symbolFirst: true, quick: [10, 20, 50, 100, 200] },
  KRW: { symbol: '₩', label: 'Вон', decimals: 0, symbolFirst: true, quick: [1000, 5000, 10000, 20000, 50000] },
  RUB: { symbol: '₽', label: 'Рубль', decimals: 2, symbolFirst: false, quick: [100, 500, 1000, 2000, 5000] },
  JPY: { symbol: '¥', label: 'Иен', decimals: 0, symbolFirst: true, quick: [100, 500, 1000, 5000, 10000] },
  EUR: { symbol: '€', label: 'Евро', decimals: 2, symbolFirst: true, quick: [1, 5, 10, 20, 50] },
  GBP: { symbol: '£', label: 'Фунт стерлинг', decimals: 2, symbolFirst: true, quick: [1, 5, 10, 20, 50] },
  AUD: { symbol: 'A$', label: 'Австрали доллар', decimals: 2, symbolFirst: true, quick: [5, 10, 20, 50, 100] },
  CZK: { symbol: 'Kč', label: 'Чех крон', decimals: 2, symbolFirst: false, quick: [50, 100, 200, 500, 1000] },
  SEK: { symbol: 'kr', label: 'Швед крон', decimals: 2, symbolFirst: false, quick: [20, 50, 100, 200, 500] },
};

/** Units of each currency per one US dollar (USD = 1), as exchange-rate APIs publish them. */
export type UsdRates = Record<DisplayCurrency, number>;

export function isDisplayCurrency(value: unknown): value is DisplayCurrency {
  return DISPLAY_CURRENCIES.some((currency) => currency === value);
}

const formats = {
  0: new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }),
  2: new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
};

/** "12,500 ₮", "$12.50", "₩13,350", "1,250.00 ₽": each currency's symbol and decimals. */
export function formatAmount(amount: number, currency: DisplayCurrency): string {
  if (currency === 'MNT') return formatMoney(amount);
  const { symbol, decimals, symbolFirst } = CURRENCY_INFO[currency];
  const digits = formats[decimals].format(Math.abs(amount));
  const sign = amount < 0 ? '-' : '';
  return symbolFirst ? `${sign}${symbol}${digits}` : `${sign}${digits} ${symbol}`;
}

/** Converts between any two display currencies through the dollar. */
export function convertAmount(
  amount: number,
  from: DisplayCurrency,
  to: DisplayCurrency,
  rates: UsdRates,
): number {
  if (from === to) return amount;
  return (amount / rates[from]) * rates[to];
}

/** Rounds to what a database column can hold (amounts keep 2 decimals). */
export function roundAmount(amount: number): number {
  return Math.round(amount * 100) / 100;
}
