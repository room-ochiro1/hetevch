import 'server-only';

import { addDays } from '@hetevch/shared';
import { cache } from 'react';

import { requireAdmin } from '@/lib/dal/auth';
import { type RangeDays, todayInUlaanbaatar } from '@/lib/range';
import { createClient } from '@/lib/supabase/server';

export type DailyMetric = {
  day: string;
  newUsers: number;
  activeUsers: number;
  txCount: number;
  income: number;
  expense: number;
};

export type PeriodTotals = {
  newUsers: number;
  activeUsers: number;
  txCount: number;
  income: number;
  expense: number;
};

export type Dashboard = {
  totalUsers: number;
  /** One row per day of the selected period, oldest first. */
  daily: DailyMetric[];
  /** Same days in the period before it, for the KPI deltas. */
  previousDaily: DailyMetric[];
  current: PeriodTotals;
  previous: PeriodTotals;
};

function fail(what: string, message: string): never {
  throw new Error(`Failed to load ${what}: ${message}`);
}

/**
 * Everything the KPI row and the time-series charts need for one period. Cached per
 * request, so the several dashboard sections that call it share one round of queries.
 */
export const getDashboard = cache(async (days: RangeDays): Promise<Dashboard> => {
  await requireAdmin();
  const supabase = await createClient();
  const today = todayInUlaanbaatar();
  const currentFrom = addDays(today, -(days - 1));
  const previousFrom = addDays(currentFrom, -days);

  const [overview, metrics, current, previous] = await Promise.all([
    supabase.rpc('admin_overview'),
    supabase.rpc('admin_daily_metrics', { period_days: days * 2 }),
    supabase.rpc('admin_finance_totals', { p_from: currentFrom, p_to: addDays(today, 1) }),
    supabase.rpc('admin_finance_totals', { p_from: previousFrom, p_to: currentFrom }),
  ]);
  if (overview.error) fail('overview', overview.error.message);
  if (metrics.error) fail('daily metrics', metrics.error.message);
  if (current.error || previous.error) fail('period totals', (current.error ?? previous.error)?.message ?? '');

  const all: DailyMetric[] = (metrics.data ?? []).map((row) => ({
    day: row.day,
    newUsers: Number(row.new_users),
    activeUsers: Number(row.active_users),
    txCount: Number(row.tx_count),
    income: Number(row.income),
    expense: Number(row.expense),
  }));
  const daily = all.slice(-days);
  const previousDaily = all.slice(0, Math.max(0, all.length - days));
  const totals = (rows: typeof current.data, period: DailyMetric[]): PeriodTotals => ({
    newUsers: period.reduce((sum, d) => sum + d.newUsers, 0),
    activeUsers: Number(rows?.[0]?.user_count ?? 0),
    txCount: Number(rows?.[0]?.tx_count ?? 0),
    income: Number(rows?.[0]?.income ?? 0),
    expense: Number(rows?.[0]?.expense ?? 0),
  });

  return {
    totalUsers: Number(overview.data?.[0]?.total_users ?? 0),
    daily,
    previousDaily,
    current: totals(current.data, daily),
    previous: totals(previous.data, previousDaily),
  };
});

export type HeatmapCell = { weekday: number; hour: number; count: number };

export async function getActivityHeatmap(days: RangeDays): Promise<HeatmapCell[]> {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('admin_activity_heatmap', { period_days: days });
  if (error) fail('activity heatmap', error.message);
  return (data ?? []).map((row) => ({
    weekday: Number(row.weekday),
    hour: Number(row.hour),
    count: Number(row.tx_count),
  }));
}

export type TopUser = {
  id: string;
  name: string;
  email: string | null;
  txCount: number;
  income: number;
  expense: number;
  lastActive: string;
};

export async function getTopUsers(days: RangeDays, limit = 8): Promise<TopUser[]> {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('admin_top_users', { period_days: days, max_rows: limit });
  if (error) fail('top users', error.message);
  return (data ?? []).map((row) => ({
    id: row.user_id,
    name: row.full_name ?? row.email ?? 'Нэргүй',
    email: row.email,
    txCount: Number(row.tx_count),
    income: Number(row.income),
    expense: Number(row.expense),
    lastActive: row.last_active,
  }));
}
