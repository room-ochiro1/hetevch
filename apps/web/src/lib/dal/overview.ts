import 'server-only';

import type { TransactionKind } from '@hetevch/shared';

import type { AgeBand } from '@/lib/age-bands';
import type { Sex } from '@/lib/sex';
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

/** Largest categories of one kind in the last `days` days (top 8), optionally for an age band and gender. */
export async function getTopCategories(
  kind: TransactionKind = 'expense',
  days = 30,
  band: AgeBand | null = null,
  sex: Sex | null = null,
): Promise<CategoryTotal[]> {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('admin_category_totals_by_segment', {
    period_days: days,
    p_kind: kind,
    p_age_band: band ?? undefined,
    p_sex: sex ?? undefined,
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
