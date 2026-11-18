import 'server-only';

import type { TransactionKind } from '@hetevch/shared';

import { requireAdmin } from '@/lib/dal/auth';
import { createClient } from '@/lib/supabase/server';
import { IDENTITY_SELECT, toIdentity, userName } from '@/lib/user-label';

export type AdminCategory = {
  id: string;
  kind: TransactionKind;
  name: string;
  icon: string;
  color: string;
  sortOrder: number;
  txCount: number;
};

/**
 * The built-in categories (no owner) every user sees, with how many transactions use each,
 * ordered for display. Users' own categories are listed separately by listUserCategories.
 */
export async function listCategories(): Promise<AdminCategory[]> {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('id, kind, name, icon, color, sort_order, transactions(count)')
    .is('owner_id', null)
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

export type UserCategory = {
  id: string;
  kind: TransactionKind;
  name: string;
  icon: string;
  color: string;
  createdAt: string;
  txCount: number;
  owner: { id: string; label: string } | null;
};

/** How many user categories the page lists; `total` still counts all of them. */
const USER_CATEGORY_LIMIT = 200;

/** Categories users added for themselves in the app, newest first, with who added each. */
export async function listUserCategories(): Promise<{ rows: UserCategory[]; total: number }> {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error, count } = await supabase
    .from('categories')
    .select(
      `id, kind, name, icon, color, created_at, transactions(count),
       owner:profiles!categories_owner_id_fkey(id, ${IDENTITY_SELECT})`,
      { count: 'exact' },
    )
    .not('owner_id', 'is', null)
    .order('created_at', { ascending: false })
    .limit(USER_CATEGORY_LIMIT);

  if (error) throw new Error(`Failed to load user categories: ${error.message}`);

  const rows = (data ?? []).map((row) => ({
    id: row.id,
    kind: row.kind,
    name: row.name,
    icon: row.icon,
    color: row.color,
    createdAt: row.created_at,
    txCount: row.transactions[0]?.count ?? 0,
    owner: row.owner ? { id: row.owner.id, label: userName(toIdentity(row.owner)) } : null,
  }));
  return { rows, total: count ?? rows.length };
}
