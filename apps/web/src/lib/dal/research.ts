import 'server-only';

import { addDays, fromISODate, type Currency } from '@hetevch/shared';
import { cache } from 'react';

import { toAgeBand, type AgeBand } from '@/lib/age-bands';
import type { Sex } from '@/lib/sex';
import { requireAdmin } from '@/lib/dal/auth';
import { toBandRow } from '@/lib/dal/band-rows';
import { type RangeDays, todayInUlaanbaatar } from '@/lib/range';
import { createClient } from '@/lib/supabase/server';

export type BandRow = {
  band: AgeBand;
  users: number;
  activeUsers: number;
  income: number;
  expense: number;
  savers: number;
  savedMnt: number;
  savedUsd: number;
};

export type CategoryAgeRow = { band: AgeBand; categoryId: string; name: string; icon: string; total: number };
export type WeekdayAgeRow = { band: AgeBand; weekday: number; expense: number; txCount: number };
export type SavingsFlowRow = { weekStart: string; currency: Currency; deposits: number; withdrawals: number };

export type SavingsCardRow = {
  id: string;
  userId: string;
  owner: string;
  band: AgeBand;
  name: string;
  icon: string;
  currency: Currency;
  deposited: number;
  goal: number | null;
  rate: number;
  entries: number;
  lastMovedOn: string | null;
  createdAt: string;
};

export type Research = {
  days: RangeDays;
  /** The age band the page is filtered to, or null for everyone. */
  band: AgeBand | null;
  /** Every band, even when filtered (the age distribution always shows all of them). */
  allBands: BandRow[];
  /** Rows below are narrowed to `band` when one is chosen. */
  bands: BandRow[];
  spending: CategoryAgeRow[];
  weekdays: WeekdayAgeRow[];
  /** How many times each ISO weekday (index 0 = Monday) occurs in the period. */
  weekdayCounts: number[];
  cards: SavingsCardRow[];
  flow: SavingsFlowRow[];
};

function fail(what: string, message: string): never {
  throw new Error(`Failed to load ${what}: ${message}`);
}

/** ISO weekday (1 = Monday … 7 = Sunday) of a `YYYY-MM-DD` day. */
function isoWeekday(day: string): number {
  return ((fromISODate(day).getDay() + 6) % 7) + 1;
}

/**
 * Everything the Судалгаа page shows for one period, in one round of queries. Cached per
 * request so its sections share it. Users only: admin accounts are left out in SQL.
 */
export const getResearch = cache(async (
  days: RangeDays,
  band: AgeBand | null,
  sex: Sex | null = null,
): Promise<Research> => {
  await requireAdmin();
  const supabase = await createClient();
  const period = { period_days: days, p_sex: sex ?? undefined };

  const [bands, spending, weekdays, cards, flow] = await Promise.all([
    supabase.rpc('admin_age_bands_by_sex', period),
    supabase.rpc('admin_category_by_age_by_sex', { ...period, p_kind: 'expense' }),
    supabase.rpc('admin_weekday_by_age_by_sex', period),
    supabase.rpc('admin_savings_cards_by_sex', { max_rows: 200, p_sex: sex ?? undefined }),
    supabase.rpc('admin_savings_flow_by_segment', { ...period, p_age_band: band ?? undefined }),
  ]);
  if (bands.error) fail('age bands', bands.error.message);
  if (spending.error) fail('spending by age', spending.error.message);
  if (weekdays.error) fail('weekdays', weekdays.error.message);
  if (cards.error) fail('savings cards', cards.error.message);
  if (flow.error) fail('savings flow', flow.error.message);

  const today = todayInUlaanbaatar();
  const weekdayCounts = [0, 0, 0, 0, 0, 0, 0];
  for (let i = 0; i < days; i++) {
    const index = isoWeekday(addDays(today, -i)) - 1;
    weekdayCounts[index] = (weekdayCounts[index] ?? 0) + 1;
  }

  const keep = <T extends { band: AgeBand }>(rows: T[]) => (band ? rows.filter((r) => r.band === band) : rows);
  const allBands = bands.data.map(toBandRow);

  return {
    days,
    band,
    allBands,
    bands: keep(allBands),
    spending: keep(spending.data.map((r) => ({
      band: toAgeBand(r.band),
      categoryId: r.category_id,
      name: r.name,
      icon: r.icon,
      total: Number(r.total),
    }))),
    weekdays: keep(weekdays.data.map((r) => ({
      band: toAgeBand(r.band),
      weekday: Number(r.weekday),
      expense: Number(r.expense),
      txCount: Number(r.tx_count),
    }))),
    weekdayCounts,
    cards: keep(cards.data.map((r) => ({
      id: r.account_id,
      userId: r.user_id,
      owner: r.full_name?.trim() || r.email || 'Нэргүй хэрэглэгч',
      band: toAgeBand(r.band),
      name: r.name,
      icon: r.icon,
      currency: r.currency,
      deposited: Number(r.deposited),
      goal: r.goal_amount === null ? null : Number(r.goal_amount),
      rate: Number(r.annual_rate),
      entries: Number(r.entries),
      lastMovedOn: r.last_moved_on,
      createdAt: r.created_at,
    }))),
    flow: flow.data.map((r) => ({
      weekStart: r.week_start,
      currency: r.currency,
      deposits: Number(r.deposits),
      withdrawals: Number(r.withdrawals),
    })),
  };
});
