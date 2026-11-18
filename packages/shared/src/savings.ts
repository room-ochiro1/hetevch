import type { Database } from './database.types';
import { depositStatus, interestPer, type TrackedDeposit } from './interest';

type SavingsRow = Database['public']['Tables']['savings_accounts']['Row'];

/** A `savings_accounts` row as the interest helpers want it. */
export function toTrackedDeposit(row: SavingsRow): TrackedDeposit {
  return {
    principal: Number(row.principal),
    annualRate: Number(row.annual_rate),
    compounding: row.compounding,
    startDate: row.start_date,
    termMonths: row.term_months,
  };
}

export type SavingsSummary = {
  count: number;
  principal: number;
  /** Interest earned so far, across every account. */
  accrued: number;
  balance: number;
  /** What all accounts together earn in a day, a month and a year. */
  perDay: number;
  perMonth: number;
  perYear: number;
};

export function summarizeSavings(rows: readonly SavingsRow[], today: string): SavingsSummary {
  const summary: SavingsSummary = {
    count: rows.length,
    principal: 0,
    accrued: 0,
    balance: 0,
    perDay: 0,
    perMonth: 0,
    perYear: 0,
  };
  for (const row of rows) {
    const deposit = toTrackedDeposit(row);
    const status = depositStatus(deposit, today);
    const per = interestPer(deposit);
    summary.principal += deposit.principal;
    summary.accrued += status.accrued;
    summary.balance += status.balance;
    // A matured deposit no longer earns.
    if (status.daysLeft !== 0) {
      summary.perDay += per.day;
      summary.perMonth += per.month;
      summary.perYear += per.year;
    }
  }
  return summary;
}
