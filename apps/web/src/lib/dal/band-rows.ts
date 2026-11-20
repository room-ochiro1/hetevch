import 'server-only';

import type { Database } from '@hetevch/shared';
import { cache } from 'react';

import { toAgeBand } from '@/lib/age-bands';
import { requireAdmin } from '@/lib/dal/auth';
import type { BandRow } from '@/lib/dal/research';
import type { RangeDays } from '@/lib/range';
import type { Sex } from '@/lib/sex';
import { createClient } from '@/lib/supabase/server';

type RawBand = Database['public']['Functions']['admin_age_bands_by_sex']['Returns'][number];

export function toBandRow(r: RawBand): BandRow {
  return {
    band: toAgeBand(r.band),
    users: Number(r.users),
    activeUsers: Number(r.active_users),
    income: Number(r.income),
    expense: Number(r.expense),
    savers: Number(r.savers),
    savedMnt: Number(r.saved_mnt),
    savedUsd: Number(r.saved_usd),
  };
}

/** Every age band's users, money and savings for the period (one query; admins left out). */
export const getBandRows = cache(async (days: RangeDays, sex: Sex | null = null): Promise<BandRow[]> => {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('admin_age_bands_by_sex', { period_days: days, p_sex: sex ?? undefined });
  if (error) throw new Error(`Failed to load age bands: ${error.message}`);
  return (data ?? []).map(toBandRow);
});
