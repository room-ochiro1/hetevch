import 'server-only';

import type { TransactionKind } from '@hetevch/shared';

import { requireAdmin } from '@/lib/dal/auth';
import { createClient } from '@/lib/supabase/server';

export type AdminCategory = {
  id: string;
  kind: TransactionKind;
  name: string;
  icon: string;
  color: string;
  sortOrder: number;
  txCount: number;
};

/** All categories with how many transactions use each, ordered for display. */
export async function listCategories(): Promise<AdminCategory[]> {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('id, kind, name, icon, color, sort_order, transactions(count)')
    .order('kind', { ascending: false })
    .order('sort_order', { ascending: true });

  if (error) throw new Error(`Failed to load categories: ${error.message}`);

  return (data ?? []).map((row) => ({
    id: row.id,
    kind: row.kind,
    name: row.name,
    icon: row.icon,
    color: row.color,
    sortOrder: row.sort_order,
    txCount: row.transactions[0]?.count ?? 0,
  }));
}
