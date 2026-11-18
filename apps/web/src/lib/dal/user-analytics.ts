import 'server-only';

import type { TransactionKind } from '@hetevch/shared';

import type { CashflowPoint } from '@/components/charts/cashflow-chart';
import type { CategoryTotal } from '@/lib/dal/overview';
import { requireAdmin } from '@/lib/dal/auth';
import { createClient } from '@/lib/supabase/server';

/** One user's daily income and expense, oldest first, zero-filled. */
export async function getUserDaily(userId: string, days = 90): Promise<CashflowPoint[]> {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('admin_user_daily', {
    target_user_id: userId,
    period_days: days,
  });
  if (error) throw new Error(`Failed to load user daily totals: ${error.message}`);
  return (data ?? []).map((row) => ({
    day: row.day,
    income: Number(row.income),
    expense: Number(row.expense),
  }));
}

/** One user's totals per category of one kind, largest first. */
export async function getUserCategories(
  userId: string,
  kind: TransactionKind = 'expense',
  days = 90,
): Promise<CategoryTotal[]> {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('admin_user_category_totals', {
    target_user_id: userId,
    period_days: days,
    p_kind: kind,
  });
  if (error) throw new Error(`Failed to load user categories: ${error.message}`);
  return (data ?? []).map((row) => ({
    categoryId: row.category_id,
    name: row.name,
    icon: row.icon,
    total: Number(row.total),
    txCount: Number(row.tx_count),
  }));
}
