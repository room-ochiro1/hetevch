/**
 * Chart colors for categories. The colors stored on categories (picked for looks) fail the
 * dataviz checks: yellow vanishes on white. So the app shows each seeded category in a slot of
 * the validated categorical palette, keyed by its stored color, so a category keeps the same
 * color on every screen. Validated with the dataviz script: worst adjacent CVD ΔE 9.1.
 */

//               blue       orange     aqua       yellow     magenta    green      violet     red
const SLOTS = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#6250d6', '#e34948'];

/** "Other" and anything folded into it: a quiet neutral, never a ninth hue. */
const OTHER = '#9aa1b1';

/** Seeded category color (supabase/migrations/*_finance.sql) → palette slot, or 'other'. */
const SLOT_BY_STORED_COLOR: Record<string, number | 'other'> = {
  '#F97316': 1, // Хоол (was Хоол хүнс) → orange
  '#16A34A': 5, // Хүнс → green
  '#DB2777': 4, // Гоо сайхан → magenta
  '#DC2626': 7, // Зээл → red
  '#0EA5E9': 0, // Тээвэр → blue
  '#EC4899': 4, // Дэлгүүр → magenta
  '#8B5CF6': 6, // Орон сууц → violet
  '#EAB308': 3, // Төлбөр → yellow
  '#EF4444': 7, // Эрүүл мэнд → red
  '#6366F1': 5, // Боловсрол → green
  '#14B8A6': 2, // Зугаа цэнгэл → aqua
  '#64748B': 'other', // Бусад
  '#10B981': 5, // Цалин → green
  '#22C55E': 0, // Бизнес → blue
  '#F43F5E': 4, // Бэлэг → magenta
  '#84CC16': 'other', // Бусад орлого
};

/**
 * Colors a user can give their own category: the palette itself, stored upper-case.
 */
export const USER_CATEGORY_COLORS: readonly string[] = SLOTS.map((color) => color.toUpperCase());

/**
 * The display color for a category. Categories an admin adds later (unknown stored color)
 * keep their own color.
 */
export function categoryColor(storedColor: string | null | undefined): string {
  if (!storedColor) return OTHER;
  const upper = storedColor.toUpperCase();
  if (USER_CATEGORY_COLORS.includes(upper)) return upper;
  const slot = SLOT_BY_STORED_COLOR[upper];
  if (slot === undefined) return storedColor;
  return slot === 'other' ? OTHER : (SLOTS[slot] ?? OTHER);
}

export function otherColor(): string {
  return OTHER;
}
