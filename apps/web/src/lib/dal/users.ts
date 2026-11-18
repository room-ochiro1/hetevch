import 'server-only';

import type { UserRole } from '@hetevch/shared';

import { requireAdmin } from '@/lib/dal/auth';
import { pageRange, sanitizeSearch } from '@/lib/search-params';
import { createClient } from '@/lib/supabase/server';
import { IDENTITY_SELECT, toIdentity, type UserIdentity } from '@/lib/user-label';

export type UserListItem = UserIdentity & {
  id: string;
  role: UserRole;
  createdAt: string;
  txCount: number;
};

export type UserFilters = {
  search?: string;
  role?: UserRole;
  page: number;
};

export async function listUsers({ search, role, page }: UserFilters) {
  await requireAdmin();
  const supabase = await createClient();
  const [from, to] = pageRange(page);

  let query = supabase
    .from('profiles')
    .select(`id, ${IDENTITY_SELECT}, role, created_at, transactions(count)`, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  const term = search ? sanitizeSearch(search) : '';
  if (term) query = query.or(`email.ilike.*${term}*,full_name.ilike.*${term}*`);
  if (role) query = query.eq('role', role);

  const { data, error, count } = await query;
  if (error) throw new Error(`Failed to load users: ${error.message}`);

  const rows: UserListItem[] = (data ?? []).map((row) => ({
    ...toIdentity(row),
    id: row.id,
    role: row.role,
    createdAt: row.created_at,
    txCount: row.transactions[0]?.count ?? 0,
  }));
  return { rows, total: count ?? 0 };
}

export async function listRecentSignups(limit = 6) {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select(`id, ${IDENTITY_SELECT}, created_at`)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Failed to load recent signups: ${error.message}`);
  return (data ?? []).map((row) => ({ ...toIdentity(row), id: row.id, createdAt: row.created_at }));
}
