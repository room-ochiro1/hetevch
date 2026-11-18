import { GENDER_LABELS, ageFromBirthYear, parseGender, type Gender } from '@hetevch/shared';

export type DevicePlatform = 'android' | 'ios' | 'web';

const PLATFORM_LABELS: Record<DevicePlatform, string> = {
  android: 'Android',
  ios: 'iPhone',
  web: 'Вэб',
};

export type UserIdentity = {
  email: string | null;
  fullName: string | null;
  birthYear: number | null;
  gender: Gender | null;
  platform: DevicePlatform | null;
};

/** App users have no email (device accounts), so fall back to a neutral name. */
export function userName(user: UserIdentity): string {
  return user.fullName ?? user.email ?? 'Нэргүй хэрэглэгч';
}

/** Second line under the name: "27 настай · Эм · Android", or the email for email accounts. */
export function userSubtitle(user: UserIdentity): string {
  const parts = [
    user.birthYear ? `${ageFromBirthYear(user.birthYear)} настай` : null,
    user.gender ? GENDER_LABELS[user.gender] : null,
    user.platform ? PLATFORM_LABELS[user.platform] : null,
    user.email,
  ].filter((part): part is string => Boolean(part));
  return parts.length > 0 ? parts.join(' · ') : '—';
}

type ProfileRow = {
  email: string | null;
  full_name: string | null;
  birth_year: number | null;
  gender: string | null;
  /** The column is text in the database; only known platforms are shown. */
  device: { platform: string } | null;
};

function toPlatform(value: string | undefined): DevicePlatform | null {
  return value === 'android' || value === 'ios' || value === 'web' ? value : null;
}

/** Maps a profiles row with `device:device_links(platform)` embedded. */
export function toIdentity(row: ProfileRow): UserIdentity {
  return {
    email: row.email,
    fullName: row.full_name,
    birthYear: row.birth_year,
    gender: parseGender(row.gender),
    platform: toPlatform(row.device?.platform),
  };
}

/** PostgREST select fragment that yields a ProfileRow. */
export const IDENTITY_SELECT = 'email, full_name, birth_year, gender, device:device_links(platform)';
