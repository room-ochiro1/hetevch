import {
  BASE_CURRENCY,
  CURRENCY_INFO,
  convertAmount,
  formatAmount,
  roundAmount,
  type ByCurrency,
  type Currency,
  type TransactionKind,
} from '@hetevch/shared';

import { useCurrency } from '@/providers/currency';

/**
 * Formats money in the currency the user chose to see. Amounts are tögrög unless `from` says
 * otherwise (a dollar savings card); they are converted at the day's rate. Tögrög shows whole
 * numbers, dollars show cents.
 */
export function useMoney() {
  const { currency, rate } = useCurrency();
  const usdRate = rate?.value ?? null;

  /** `amount` (held in `from`) in the display currency, or null when no rate is known. */
  function convert(amount: number, from: Currency = BASE_CURRENCY): number | null {
    if (from === currency) return amount;
    return usdRate ? convertAmount(amount, from, currency, usdRate) : null;
  }

  function show(amount: number, inCurrency: Currency): string {
    return formatAmount(inCurrency === 'MNT' ? Math.round(amount) : amount, inCurrency);
  }

  /** Converted when possible; otherwise shown in its own currency rather than mislabelled. */
  function format(amount: number, from: Currency = BASE_CURRENCY): string {
    const converted = convert(amount, from);
    return converted === null ? show(amount, from) : show(converted, currency);
  }

  /** "+12,500 ₮" / "−12,500 ₮" (true minus sign) for a value that may be negative. */
  function net(value: number, from?: Currency): string {
    return `${value >= 0 ? '+' : '−'}${format(Math.abs(value), from)}`;
  }

  function forKind({ kind, amount }: { kind: TransactionKind; amount: number }): string {
    return `${kind === 'income' ? '+' : '−'}${format(amount)}`;
  }

  /** One total from amounts held in several currencies ("… + $120.00" if no rate yet). */
  function combine(parts: ByCurrency): string {
    const entries = (Object.entries(parts) as [Currency, number][]).filter(([, v]) => v !== 0);
    const converted = entries.map(([from, value]) => convert(value, from));
    if (converted.every((value) => value !== null)) {
      return show(
        converted.reduce<number>((total, value) => total + (value ?? 0), 0),
        currency,
      );
    }
    return entries.map(([from, value]) => show(value, from)).join(' + ');
  }

  /** A typed amount in the display currency → tögrög to store (2 decimals). */
  function toBase(amount: number): number {
    if (currency === BASE_CURRENCY || !usdRate) return amount;
    return roundAmount(convertAmount(amount, currency, BASE_CURRENCY, usdRate));
  }

  return {
    currency,
    symbol: CURRENCY_INFO[currency].symbol,
    rate,
    convert,
    format,
    net,
    forKind,
    combine,
    toBase,
  };
}
