import type { Database } from './database.types';
import { fromISODate, toISODate } from './dates';

/**
 * Deposit interest the way Mongolian banks state it (Mongolbank's method): a day's interest
 * is the yearly rate ÷ 365, a month's is the yearly rate ÷ 12. Rates are nominal, in percent.
 */

export type Compounding = Database['public']['Enums']['interest_compounding'];

export const COMPOUNDING_LABELS: Record<Compounding, string> = {
  monthly: 'Хүү хуримтлагдана',
  simple: 'Энгийн хүү',
};

export const DAYS_PER_YEAR = 365;

/** Withholding tax on individuals' interest income. Exemptions exist: the bank has the final word. */
export const INTEREST_TAX_RATE = 0.1;

export type Deposit = { principal: number; annualRate: number; compounding: Compounding };

/** A stretch of time as whole calendar months plus leftover days. */
export type Span = { months: number; days: number };

/**
 * Balance after `span`. Monthly compounding adds each whole month's interest to the deposit;
 * leftover days (and everything, for simple interest) accrue without compounding.
 */
export function balanceAfter({ principal, annualRate, compounding }: Deposit, span: Span): number {
  const rate = annualRate / 100;
  const dayPart = (rate * span.days) / DAYS_PER_YEAR;
  if (compounding === 'simple') {
    return principal * (1 + (rate * span.months) / 12 + dayPart);
  }
  return principal * (1 + rate / 12) ** span.months * (1 + dayPart);
}

export function interestFor(deposit: Deposit, span: Span): number {
  return balanceAfter(deposit, span) - deposit.principal;
}

/** Interest in the first day, month and year: the "өдөрт / сард / жилд" figures. */
export function interestPer(deposit: Deposit) {
  return {
    day: interestFor(deposit, { months: 0, days: 1 }),
    month: interestFor(deposit, { months: 1, days: 0 }),
    year: interestFor(deposit, { months: 12, days: 0 }),
  };
}

/** What a year really earns, in percent; above the nominal rate when interest compounds. */
export function effectiveAnnualRate(deposit: Deposit): number {
  return interestFor({ ...deposit, principal: 100 }, { months: 12, days: 0 });
}

export function afterTax(interest: number): number {
  return interest * (1 - INTEREST_TAX_RATE);
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function daysBetween(from: string, to: string): number {
  // Rounded: a daylight-saving shift makes some days 23 or 25 hours long.
  return Math.round((fromISODate(to).getTime() - fromISODate(from).getTime()) / MS_PER_DAY);
}

/** Same day `months` later; a missing day clamps to the month's end (Jan 31 + 1 → Feb 28). */
export function addMonths(iso: string, months: number): string {
  const date = fromISODate(iso);
  const target = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(date.getDate(), lastDay));
  return toISODate(target);
}

/** Whole months and leftover days from `from` to `to` (`to` on or after `from`). */
export function spanBetween(from: string, to: string): Span {
  const a = fromISODate(from);
  const b = fromISODate(to);
  let months = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
  if (addMonths(from, months) > to) months -= 1;
  return { months, days: daysBetween(addMonths(from, months), to) };
}

export type TrackedDeposit = Deposit & { startDate: string; termMonths: number | null };

/** Where a tracked deposit stands today: interest so far, maturity, and how far along it is. */
export function depositStatus(deposit: TrackedDeposit, today: string) {
  const { startDate, termMonths, principal } = deposit;
  const maturity = termMonths ? addMonths(startDate, termMonths) : null;
  // Interest stops at maturity; a start date in the future has earned nothing yet.
  const until = maturity && maturity < today ? maturity : today;
  const accrued = until > startDate ? interestFor(deposit, spanBetween(startDate, until)) : 0;
  const totalDays = maturity ? daysBetween(startDate, maturity) : 0;
  return {
    accrued,
    balance: principal + accrued,
    maturity,
    atMaturity: termMonths ? balanceAfter(deposit, { months: termMonths, days: 0 }) : null,
    daysLeft: maturity ? Math.max(0, daysBetween(today, maturity)) : null,
    /** 0–1 share of the term that has passed; null without a term. */
    progress: maturity
      ? Math.min(1, Math.max(0, daysBetween(startDate, until) / Math.max(1, totalDays)))
      : null,
  };
}

/** "12.5%" — at most two decimals, no trailing zeros. */
export function formatRate(percent: number): string {
  return `${Number(percent.toFixed(2))}%`;
}

/** Reads a typed yearly rate ("12.5", "12,5", "12.5%"): 0–100 with up to 2 decimals, else null. */
export function parseRate(text: string): number | null {
  const cleaned = text.replace(/[\s%]/g, '').replace(',', '.');
  if (!/^\d{1,3}(\.\d{0,2})?$/.test(cleaned)) return null;
  const value = Number(cleaned);
  return value <= 100 ? value : null;
}
