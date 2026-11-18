import { formatCount } from '@/lib/format';

/** Rounds up to a clean axis maximum (1, 2, 2.5 or 5 × 10ⁿ) so ticks read as round numbers. */
export function niceMax(value: number): number {
  if (!(value > 0)) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 2.5, 5, 10].find((candidate) => value <= candidate * magnitude) ?? 10;
  return step * magnitude;
}

function trim(value: number): string {
  return String(Number(value.toFixed(1)));
}

/**
 * Axis tick text: in full under 10,000 ("2,500"), then compact Mongolian units
 * ("15 мян", "1.5 сая", "2 тэрбум"). One style per axis because ticks share one scale.
 */
export function formatTick(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '−' : '';
  if (abs < 10_000) return `${sign}${formatCount(abs)}`;
  if (abs < 1_000_000) return `${sign}${trim(abs / 1_000)} мян`;
  if (abs < 1_000_000_000) return `${sign}${trim(abs / 1_000_000)} сая`;
  return `${sign}${trim(abs / 1_000_000_000)} тэрбум`;
}

/** Change from `previous` to `current` as a ratio (0.12 = +12%); null when there's no base. */
export function changeRatio(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return (current - previous) / previous;
}
