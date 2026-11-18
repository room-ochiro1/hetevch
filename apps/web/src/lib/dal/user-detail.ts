import 'server-only';

import { notFound } from 'next/navigation';

import { requireAdmin } from '@/lib/dal/auth';
import { createClient } from '@/lib/supabase/server';

export type UserDetail = {
  id: string;
  email: string | null;
  fullName: string | null;
  role: 'user' | 'admin';
  createdAt: string;
  isSelf: boolean;
  summary: {
    txCount: number;
    income: number;
    expense: number;
    lastOccurredOn: string | null;
  };
};

export async function getUserDetail(userId: string): Promise<UserDetail> {
  const admin = await requireAdmin();
  const supabase = await createClient();

  const [profileResult, summaryResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, email, full_name, role, created_at')
      .eq('id', userId)
      .maybeSingle(),
    supabase.rpc('admin_user_summary', { target_user_id: userId }),
  ]);

  if (profileResult.error) {
    throw new Error(`Failed to load user: ${profileResult.error.message}`);
  }
  if (!profileResult.data) notFound();
  if (summaryResult.error) {
    throw new Error(`Failed to load user summary: ${summaryResult.error.message}`);
  }

  const profile = profileResult.data;
  const summary = summaryResult.data?.[0];

  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    role: profile.role,
    createdAt: profile.created_at,
    isSelf: profile.id === admin.id,
    summary: {
      txCount: Number(summary?.tx_count ?? 0),
      income: Number(summary?.income ?? 0),
      expense: Number(summary?.expense ?? 0),
      lastOccurredOn: summary?.last_occurred_on ?? null,
    },
  };
}
