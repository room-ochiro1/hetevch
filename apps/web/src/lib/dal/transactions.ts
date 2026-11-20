import 'server-only';

import type { TransactionKind } from '@hetevch/shared';

import { requireAdmin } from '@/lib/dal/auth';
import { pageRange } from '@/lib/search-params';
import { createClient } from '@/lib/supabase/server';

const SELECT =
  'id, kind, amount, note, occurred_on, created_at, user_id, ' +
  'category:categories(id, name, icon), user:profiles(id, email, full_name)';

export type AdminTransaction = {
  id: string;
  kind: TransactionKind;
  amount: number;
  note: string | null;
  occurredOn: string;
  /** When it was entered in the app (timestamptz). */
  createdAt: string;
  category: { name: string; icon: string } | null;
  user: { id: string; label: string } | null;
};

type Row = {
  id: string;
  kind: TransactionKind;
  amount: number;
  note: string | null;
  occurred_on: string;
  created_at: string;
  category: { name: string; icon: string } | null;
  user: { id: string; email: string | null; full_name: string | null } | null;
};

function toAdminTransaction(row: Row): AdminTransaction {
  return {
    id: row.id,
    kind: row.kind,
    amount: Number(row.amount),
    note: row.note,
    occurredOn: row.occurred_on,
    createdAt: row.created_at,
    category: row.category,
    user: row.user
      ? { id: row.user.id, label: row.user.full_name ?? row.user.email ?? row.user.id }
      : null,
  };
}

export type TransactionFilters = {
  kind?: TransactionKind;
  userId?: string;
  page: number;
};

/** Every user's transactions, newest first. */
export async function listTransactions({ kind, userId, page }: TransactionFilters) {
  await requireAdmin();
  const supabase = await createClient();
  const [from, to] = pageRange(page);

  let query = supabase
    .from('transactions')
    .select(SELECT, { count: 'exact' })
    .order('occurred_on', { ascending: false })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (kind) query = query.eq('kind', kind);
  if (userId) query = query.eq('user_id', userId);

  const { data, error, count } = await query.overrideTypes<Row[], { merge: false }>();
  if (error) throw new Error(`Failed to load transactions: ${error.message}`);

  return { rows: (data ?? []).map(toAdminTransaction), total: count ?? 0 };
}
