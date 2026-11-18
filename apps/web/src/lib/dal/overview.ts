import 'server-only';

import type { TransactionKind } from '@hetevch/shared';

import { requireAdmin } from '@/lib/dal/auth';
import { createClient } from '@/lib/supabase/server';

// Period KPIs, daily series, the heatmap and top users live in lib/dal/analytics.ts.

export type CategoryTotal = {
  categoryId: string;
  name: string;
  icon: string;
  total: number;
  txCount: number;
};

/** Largest categories of one kind across all users in the last `days` days (top 8). */
export async function getTopCategories(
  kind: TransactionKind = 'expense',
  days = 30,
): Promise<CategoryTotal[]> {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('admin_category_totals', {
    period_days: days,
    p_kind: kind,
  });
  if (error) throw new Error(`Failed to load category totals: ${error.message}`);

  return (data ?? []).map((row) => ({
    categoryId: row.category_id,
    name: row.name,
    icon: row.icon,
    total: Number(row.total),
    txCount: Number(row.tx_count),
  }));
}
