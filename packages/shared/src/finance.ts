import type { Database } from './database.types';
import { formatMoney } from './format';

export type TransactionKind = Database['public']['Enums']['transaction_kind'];

/** Expense first: it is what people log most. */
export const TRANSACTION_KINDS = ['expense', 'income'] as const satisfies readonly TransactionKind[];

export const KIND_LABELS: Record<TransactionKind, string> = {
  expense: 'Зарлага',
  income: 'Орлого',
};

/** Largest value `numeric(14, 2)` holds is just under one trillion. */
const MAX_AMOUNT = 1_000_000_000_000;

export type Totals = { income: number; expense: number; net: number };

type Amounted = { kind: TransactionKind; amount: number };

/** Income is positive, expense negative. */
export function signedAmount({ kind, amount }: Amounted): number {
  return kind === 'income' ? amount : -amount;
}

/** "+12,500 ₮" for income, "−12,500 ₮" for expense (true minus sign). */
export function formatSignedMoney({ kind, amount }: Amounted): string {
  return `${kind === 'income' ? '+' : '−'}${formatMoney(amount)}`;
}

export function toTotals(income: number, expense: number): Totals {
  return { income, expense, net: income - expense };
}

export function summarize(rows: readonly Amounted[]): Totals {
  let income = 0;
  let expense = 0;
  for (const row of rows) {
    if (row.kind === 'income') income += row.amount;
    else expense += row.amount;
  }
  return toTotals(income, expense);
}

/** "+3,000 ₮" / "−3,000 ₮" for a net amount that may be negative. */
export function formatNet(net: number): string {
  return formatSignedMoney({ kind: net >= 0 ? 'income' : 'expense', amount: Math.abs(net) });
}

export type DayGroup<T> = { day: string; items: T[]; net: number };

/** Groups rows (already sorted newest first) by `occurred_on`, keeping that order. */
export function groupByDay<T extends Amounted & { occurred_on: string }>(
  rows: readonly T[],
): DayGroup<T>[] {
  const groups: DayGroup<T>[] = [];
  for (const row of rows) {
    let group = groups.at(-1);
    if (!group || group.day !== row.occurred_on) {
      group = { day: row.occurred_on, items: [], net: 0 };
      groups.push(group);
    }
    group.items.push(row);
    group.net += signedAmount(row);
  }
  return groups;
}

export type CategoryShare<C> = { category: C; total: number; share: number };

/** Totals per category for one kind, largest first; `share` is 0–1 of the kind's total. */
export function breakdownByCategory<C extends { id: string }>(
  rows: readonly (Amounted & { category: C | null })[],
  kind: TransactionKind,
): CategoryShare<C>[] {
  const byId = new Map<string, { category: C; total: number }>();
  let sum = 0;
  for (const row of rows) {
    if (row.kind !== kind || !row.category) continue;
    const entry = byId.get(row.category.id) ?? { category: row.category, total: 0 };
    entry.total += row.amount;
    byId.set(row.category.id, entry);
    sum += row.amount;
  }
  return [...byId.values()]
    .map((entry) => ({ ...entry, share: sum > 0 ? entry.total / sum : 0 }))
    .sort((a, b) => b.total - a.total);
}

/**
 * Live-formats what the user is typing into an amount field: keeps digits and one decimal
 * point (max 2 decimals) and groups thousands — "12500.5" → "12,500.5". `parseAmount` reads it back.
 */
export function formatAmountInput(text: string): string {
  const cleaned = text.replace(/[^\d.]/g, '');
  const [whole = '', ...rest] = cleaned.split('.');
  const digits = whole.replace(/^0+(?=\d)/, '');
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return rest.length > 0 ? `${grouped}.${rest.join('').slice(0, 2)}` : grouped;
}

/**
 * Parses an amount the user typed ("12500", "12 500", "12,500.50").
 * Returns null unless it is a positive number with at most 2 decimals that fits the column.
 */
export function parseAmount(text: string): number | null {
  const cleaned = text.replace(/[\s,₮]/g, '');
  // A trailing "." (typed, then left) is fine: "5." is 5.
  if (!/^\d+(\.\d{0,2})?$/.test(cleaned)) {
    return null;
  }
  const value = Number(cleaned);
  return value > 0 && value < MAX_AMOUNT ? value : null;
}
