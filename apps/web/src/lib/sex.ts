import { GENDER_LABELS } from '@hetevch/shared';

/**
 * The gender filter of the admin pages (?sex=…): the profile's gender, or 'unknown' for
 * profiles without one (accounts made before it was asked). Matches public.in_segment().
 */
export const SEXES = ['male', 'female', 'unknown'] as const;

export type Sex = (typeof SEXES)[number];

export const SEX_LABELS: Record<Sex, string> = {
  ...GENDER_LABELS,
  unknown: 'Тодорхойгүй',
};

export function parseSex(value: string | undefined): Sex | null {
  return SEXES.find((sex) => sex === value) ?? null;
}

/** A database gender bucket ('male' | 'female' | 'unknown') as a Sex; anything else is unknown. */
export function toSex(value: string): Sex {
  return parseSex(value) ?? 'unknown';
}
