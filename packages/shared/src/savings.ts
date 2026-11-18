import type { Currency } from './currency';
import type { Database } from './database.types';
import {
  addMonths,
  daysBetween,
  interestFor,
  interestPer,
  spanBetween,
  type Deposit,
} from './interest';

type Tables = Database['public']['Tables'];

export type SavingsEntry = Pick<
  Tables['savings_entries']['Row'],
  'id' | 'amount' | 'occurred_on' | 'note' | 'created_at'
>;

/** A savings card with its money movements, as `SAVINGS_CARD_SELECT` returns it. */
export type SavingsCard = Tables['savings_accounts']['Row'] & { entries: SavingsEntry[] };

export const SAVINGS_CARD_SELECT =
  '*, entries:savings_entries(id, amount, occurred_on, note, created_at)';

/** A sum that starts earning interest on `date` (negative for money taken out). */
type Flow = { amount: number; date: string };

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);
const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/**
 * Where a card stands on `today`. Every movement earns from its own date, which is how a bank's
 * daily-balance interest works for simple interest (and a close estimate when it compounds).
 * Interest stops at maturity.
 */
export function savingsStatus(card: SavingsCard, today: string) {
  const deposit: Deposit = {
    principal: 0,
    annualRate: Number(card.annual_rate),
    compounding: card.compounding,
  };
  const start = card.start_date;
  const flows: Flow[] = [
    { amount: Number(card.principal), date: start },
    ...card.entries.map((entry) => ({
      amount: Number(entry.amount),
      date: entry.occurred_on > start ? entry.occurred_on : start,
    })),
  ];
  const earned = (flow: Flow, to: string) =>
    flow.date < to ? interestFor({ ...deposit, principal: flow.amount }, spanBetween(flow.date, to)) : 0;

  const maturity = card.term_months ? addMonths(start, card.term_months) : null;
  const until = maturity && maturity < today ? maturity : today;
  const matured = maturity !== null && today >= maturity;
  const deposited = sum(flows.map((flow) => flow.amount));
  const accrued = sum(flows.map((flow) => earned(flow, until)));
  const balance = deposited + accrued;
  // Compounding earns on interest already added; simple interest only on what was put in.
  const earning = Math.max(0, deposit.compounding === 'monthly' ? balance : deposited);
  const goalAmount = card.goal_amount === null ? null : Number(card.goal_amount);

  return {
    deposited,
    accrued,
    balance,
    maturity,
    matured,
    atMaturity: maturity ? deposited + sum(flows.map((flow) => earned(flow, maturity))) : null,
    daysLeft: maturity ? Math.max(0, daysBetween(today, maturity)) : null,
    /** 0–1 share of the term that has passed; null without a term. */
    termProgress: maturity
      ? clamp01(daysBetween(start, until) / Math.max(1, daysBetween(start, maturity)))
      : null,
    /** What it earns next: per day, month and year at today's balance. */
    per: matured
      ? { day: 0, month: 0, year: 0 }
      : interestPer({ ...deposit, principal: earning }),
    goal: goalAmount
      ? { amount: goalAmount, progress: clamp01(balance / goalAmount), left: Math.max(0, goalAmount - balance) }
      : null,
  };
}

export type SavingsStatus = ReturnType<typeof savingsStatus>;

/** Amounts kept apart by currency; the app converts them for display. */
export type ByCurrency = Partial<Record<Currency, number>>;

export type SavingsSummary = {
  count: number;
  balance: ByCurrency;
  accrued: ByCurrency;
  perDay: ByCurrency;
  perMonth: ByCurrency;
  perYear: ByCurrency;
};

export function summarizeSavings(cards: readonly SavingsCard[], today: string): SavingsSummary {
  const summary: SavingsSummary = {
    count: cards.length,
    balance: {},
    accrued: {},
    perDay: {},
    perMonth: {},
    perYear: {},
  };
  const add = (bucket: ByCurrency, currency: Currency, value: number) => {
    bucket[currency] = (bucket[currency] ?? 0) + value;
  };
  for (const card of cards) {
    const status = savingsStatus(card, today);
    add(summary.balance, card.currency, status.balance);
    add(summary.accrued, card.currency, status.accrued);
    add(summary.perDay, card.currency, status.per.day);
    add(summary.perMonth, card.currency, status.per.month);
    add(summary.perYear, card.currency, status.per.year);
  }
  return summary;
}
