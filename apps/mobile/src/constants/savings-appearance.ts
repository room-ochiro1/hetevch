/**
 * Savings card looks. The colour keys are stored in savings_accounts.color and checked by the
 * database (migration 20261118090000): add a colour in both places. Every colour keeps white
 * text above 5:1 contrast (WCAG AA).
 */
export const CARD_COLORS = {
  indigo: '#4F46E5',
  emerald: '#047857',
  sky: '#0369A1',
  rose: '#BE123C',
  amber: '#B45309',
  violet: '#6D28D9',
  teal: '#0F766E',
  slate: '#334155',
} as const;

export type CardColor = keyof typeof CARD_COLORS;

export const CARD_COLOR_KEYS = Object.keys(CARD_COLORS) as CardColor[];

export function cardColor(key: string): string {
  return key in CARD_COLORS ? CARD_COLORS[key as CardColor] : CARD_COLORS.indigo;
}

/** Goal pictures, like a pot's image: what the money is for. */
export const CARD_ICONS = ['🐷', '💰', '🏦', '🏠', '🚗', '✈️', '🎓', '💍', '🎁', '🛡️', '📱', '🌱'] as const;

/** Text on a card: white, and a slightly softer white for secondary lines. */
export const ON_CARD = '#FFFFFF';
export const ON_CARD_SOFT = 'rgba(255,255,255,0.92)';
