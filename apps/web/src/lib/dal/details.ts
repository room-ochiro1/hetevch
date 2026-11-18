import 'server-only';

import { notFound } from 'next/navigation';

import { toAgeBand, type AgeBand } from '@/lib/age-bands';
import type { Sex } from '@/lib/sex';
import { requireAdmin } from '@/lib/dal/auth';
import { type BandDetail, toBandDetail } from '@/lib/dal/band-shape';
import { type CategoryDetail, type DayDetail, toCategoryDetail, toDayDetail } from '@/lib/dal/detail-shapes';
import type { RangeDays } from '@/lib/range';
import { createClient } from '@/lib/supabase/server';

export type { BandDetail } from '@/lib/dal/band-shape';
export type { CategoryDetail, DayDetail } from '@/lib/dal/detail-shapes';

function fail(what: string, message: string): never {
  throw new Error(`Failed to load ${what}: ${message}`);
}

/** One category for the period (and age band): totals, bands, days, top users, latest rows. */
export async function getCategoryDetail(
  categoryId: string,
  days: RangeDays,
  band: AgeBand | null,
  sex: Sex | null = null,
): Promise<CategoryDetail> {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('admin_category_detail_by_segment', {
    p_category_id: categoryId,
    period_days: days,
    p_age_band: band ?? undefined,
    p_sex: sex ?? undefined,
  });
  if (error) fail('category detail', error.message);
  const detail = toCategoryDetail(data);
  if (!detail) notFound();
  return detail;
}

/** One day's money, sign-ups, categories and transactions (optionally an age band and gender). */
export async function getDayDetail(
  day: string,
  band: AgeBand | null,
  sex: Sex | null = null,
): Promise<DayDetail> {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('admin_day_detail_by_segment', {
    p_day: day,
    p_age_band: band ?? undefined,
    p_sex: sex ?? undefined,
  });
  if (error) fail('day detail', error.message);
  return toDayDetail(data);
}

/** Everything about one age band for the period (users only). */
export async function getBandDetail(band: AgeBand, days: RangeDays): Promise<BandDetail> {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('admin_band_detail', { p_band: band, period_days: days });
  if (error) fail('age band detail', error.message);
  return toBandDetail(data, toAgeBand(band));
}
