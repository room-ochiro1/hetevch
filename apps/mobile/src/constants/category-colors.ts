/**
 * Chart colors for categories. The colors stored on categories (picked for looks) fail the
 * dataviz checks: yellow vanishes on white and four are too light on the dark surface. So the
 * app shows each seeded category in a slot of the validated categorical palette, keyed by its
 * stored color, so a category keeps the same color on every screen and in both themes.
 * Validated with the dataviz script: light and dark sets pass, worst adjacent CVD ΔE 9.1 / 8.4.
 */

type Scheme = 'light' | 'dark';

const SLOTS: Record<Scheme, readonly string[]> = {
  //       blue       orange     aqua       yellow     magenta    green      violet     red
  light: ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#6250d6', '#e34948'],
  dark: ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#0ca30c', '#9085e9', '#e66767'],
};

/** "Other" and anything folded into it: a quiet neutral, never a ninth hue. */
const OTHER: Record<Scheme, string> = { light: '#9aa1b1', dark: '#5d6478' };

/** Seeded category color (supabase/migrations/*_finance.sql) → palette slot, or 'other'. */
const SLOT_BY_STORED_COLOR: Record<string, number | 'other'> = {
  '#F97316': 1, // Хоол хүнс → orange
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
 * The display color for a category. Categories an admin adds later (unknown stored color)
 * keep their own color.
 */
export function categoryColor(storedColor: string | null | undefined, scheme: Scheme): string {
  if (!storedColor) return OTHER[scheme];
  const slot = SLOT_BY_STORED_COLOR[storedColor.toUpperCase()];
  if (slot === undefined) return storedColor;
  return slot === 'other' ? OTHER[scheme] : (SLOTS[scheme][slot] ?? OTHER[scheme]);
}

export function otherColor(scheme: Scheme): string {
  return OTHER[scheme];
}
