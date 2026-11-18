import 'server-only';

import { cache } from 'react';

import { toAgeBand, type AgeBand } from '@/lib/age-bands';
import { requireAdmin } from '@/lib/dal/auth';
import type { RangeDays } from '@/lib/range';
import { toSex, type Sex } from '@/lib/sex';
import { createClient } from '@/lib/supabase/server';

/** One gender's people and money in the period (users only). */
export type GenderGroup = {
  sex: Sex;
  users: number;
  activeUsers: number;
  income: number;
  expense: number;
  incomeTx: number;
  expenseTx: number;
  /** People who put more into savings than they took out. */
  savers: number;
  /** Net tögrög moved into savings cards. */
  saved: number;
};

export type GenderCategory = {
  sex: Sex;
  categoryId: string;
  name: string;
  icon: string;
  total: number;
  users: number;
};

export type GenderAgeRow = { band: AgeBand; sex: Sex; users: number; total: number };

export type GenderInsights = {
  groups: GenderGroup[];
  /** Expense per gender × category. */
  categories: GenderCategory[];
  /** Expense per age band × gender (every band, whatever the age filter). */
  byAge: GenderAgeRow[];
};

function fail(what: string, message: string): never {
  throw new Error(`Failed to load ${what}: ${message}`);
}

/**
 * Men, women and those who did not say, side by side for the Судалгаа page: one round of
 * queries per request. The age filter narrows the groups and categories; the gender filter does
 * not apply here, since this section is the comparison itself.
 */
export const getGenderInsights = cache(
  async (days: RangeDays, band: AgeBand | null): Promise<GenderInsights> => {
    await requireAdmin();
    const supabase = await createClient();
    const filter = { period_days: days, p_age_band: band ?? undefined };

    const [groups, categories, byAge] = await Promise.all([
      supabase.rpc('admin_gender_breakdown', filter),
      supabase.rpc('admin_category_by_gender', { ...filter, p_kind: 'expense' }),
      supabase.rpc('admin_gender_by_age', { period_days: days, p_kind: 'expense' }),
    ]);
    if (groups.error) fail('gender breakdown', groups.error.message);
    if (categories.error) fail('categories by gender', categories.error.message);
    if (byAge.error) fail('gender by age', byAge.error.message);

    return {
      groups: (groups.data ?? []).map((row) => ({
        sex: toSex(row.gender),
        users: Number(row.users),
        activeUsers: Number(row.active_users),
        income: Number(row.income),
        expense: Number(row.expense),
        incomeTx: Number(row.income_tx),
        expenseTx: Number(row.expense_tx),
        savers: Number(row.savers),
        saved: Number(row.saved),
      })),
      categories: (categories.data ?? []).map((row) => ({
        sex: toSex(row.gender),
        categoryId: row.category_id,
        name: row.name,
        icon: row.icon,
        total: Number(row.total),
        users: Number(row.users),
      })),
      byAge: (byAge.data ?? []).map((row) => ({
        band: toAgeBand(row.band),
        sex: toSex(row.gender),
        users: Number(row.users),
        total: Number(row.total),
      })),
    };
  },
);
