import type { TransactionKind } from '@hetevch/shared';

import { withAlpha } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Above this intensity a cell's tint is strong enough to need white text. */
const STRONG = 0.6;

/**
 * Colors for calendar cells: the kind's color (expense red, income green), stronger for busier
 * cells; empty cells stay neutral. Savings dots use the card's own colour (from the data).
 */
export function useCellColors(kind: TransactionKind) {
  const theme = useTheme();
  const tone = kind === 'expense' ? theme.expense : theme.income;

  return {
    tone,
    today: theme.text,
    fill: (intensity: number) =>
      intensity > 0 ? withAlpha(tone, 0.14 + 0.66 * intensity) : theme.backgroundElement,
    ink: (intensity: number) => (intensity > STRONG ? theme.onAccent : theme.text),
  };
}
