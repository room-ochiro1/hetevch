import 'server-only';

import { requireAdmin } from '@/lib/dal/auth';
import { createClient } from '@/lib/supabase/server';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export type UserStats = {
  total: number;
  admins: number;
  newThisWeek: number;
};

export async function getUserStats(): Promise<UserStats> {
  await requireAdmin();
  const supabase = await createClient();
  const weekAgo = new Date(Date.now() - WEEK_MS).toISOString();
  const countProfiles = () =>
    supabase.from('profiles').select('*', { count: 'exact', head: true });

  const [total, admins, newThisWeek] = await Promise.all([
    countProfiles(),
    countProfiles().eq('role', 'admin'),
    countProfiles().gte('created_at', weekAgo),
  ]);

  return {
    total: total.count ?? 0,
    admins: admins.count ?? 0,
    newThisWeek: newThisWeek.count ?? 0,
  };
}

export async function listUsers(limit = 50) {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to load users: ${error.message}`);
  }
  return data;
}
