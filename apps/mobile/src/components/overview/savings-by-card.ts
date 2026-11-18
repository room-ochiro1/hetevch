import type { SavingsMove } from '@hetevch/shared';

import { cardColor } from '@/constants/savings-appearance';

/** Money one card gained in a period, drawn in the card's own colour. */
export type CardSavings = {
  cardId: string;
  name: string;
  icon: string;
  /** The card's display colour (hex). */
  color: string;
  /** Net tögrög put in; only cards that gained appear. */
  total: number;
};

/** Net tögrög put into each card, biggest first; cards that lost money in the period are left out. */
export function savingsByCard(moves: readonly SavingsMove[]): CardSavings[] {
  const byCard = new Map<string, CardSavings>();
  for (const move of moves) {
    if (!move.card || move.base_amount === null) continue;
    const entry = byCard.get(move.card.id) ?? {
      cardId: move.card.id,
      name: move.card.name,
      icon: move.card.icon,
      color: cardColor(move.card.color),
      total: 0,
    };
    entry.total += move.base_amount;
    byCard.set(move.card.id, entry);
  }
  return [...byCard.values()].filter((card) => card.total > 0).sort((a, b) => b.total - a.total);
}
