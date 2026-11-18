/**
 * Хүйс as stored in profiles.gender (the database checks the same two values). Optional:
 * accounts made before it was asked have none.
 */
export const GENDERS = ['male', 'female'] as const;

export type Gender = (typeof GENDERS)[number];

export const GENDER_LABELS: Record<Gender, string> = {
  male: 'Эр',
  female: 'Эм',
};

/** A stored value (plain text in the database types) as a Gender, or null. */
export function parseGender(value: string | null | undefined): Gender | null {
  return GENDERS.find((gender) => gender === value) ?? null;
}
