/**
 * Birth year ↔ age. The app stores the birth year (it never goes stale) and shows age.
 * Years are counted in Mongolian time (UTC+8, no daylight saving), so New Year's Eve
 * in Ulaanbaatar already counts as the new year even when a server runs in UTC.
 */

/** Youngest and oldest ages the welcome form accepts. */
export const MIN_AGE = 5;
export const MAX_AGE = 120;

const ULAANBAATAR_OFFSET_MS = 8 * 60 * 60 * 1000;

export function currentYearInMongolia(now: Date = new Date()): number {
  return new Date(now.getTime() + ULAANBAATAR_OFFSET_MS).getUTCFullYear();
}

/** Age this calendar year (birthdays are not stored, so this can be one year high). */
export function ageFromBirthYear(birthYear: number, now: Date = new Date()): number {
  return currentYearInMongolia(now) - birthYear;
}

/** Parses a typed birth year ("1998"); null unless it means an age of MIN_AGE–MAX_AGE. */
export function parseBirthYear(text: string, now: Date = new Date()): number | null {
  const trimmed = text.trim();
  if (!/^\d{4}$/.test(trimmed)) {
    return null;
  }
  const year = Number(trimmed);
  const age = ageFromBirthYear(year, now);
  return age >= MIN_AGE && age <= MAX_AGE ? year : null;
}
