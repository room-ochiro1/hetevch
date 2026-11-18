import type { Period } from '@hetevch/shared';

import type { ThemeColor } from '@/constants/theme';

/** One number in the row under a statement's total. */
export type StatementTile = { label: string; value: string; tone?: ThemeColor };

const PREVIOUS_LABEL: Record<Period, string> = {
  day: 'Өмнөх өдрөөс',
  week: 'Өмнөх 7 хоногоос',
  month: 'Өмнөх сараас',
  year: 'Өмнөх жилээс',
};

/**
 * "+12%" against the previous period, green when the change is good (less spending, more
 * income or savings) and red when it is not. "Шинэ" when there was nothing before.
 */
export function changeTile(
  period: Period,
  current: number | null,
  previous: number | null,
  goodWhenUp: boolean,
): StatementTile {
  const label = PREVIOUS_LABEL[period];
  if (current === null || previous === null) return { label, value: '—' };
  if (previous === 0) return { label, value: current > 0 ? 'Шинэ' : '0%' };

  const percent = Math.round(((current - previous) / Math.abs(previous)) * 100);
  if (percent === 0) return { label, value: '0%' };
  const good = percent > 0 === goodWhenUp;
  const value = `${percent > 0 ? '+' : '−'}${Math.abs(percent)}%`;
  return { label, value, tone: good ? 'income' : 'expense' };
}
