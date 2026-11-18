/** Dashboard periods: every chart and number on the page uses the same one. */
export const RANGES = [7, 30, 90] as const;
export type RangeDays = (typeof RANGES)[number];
export const DEFAULT_RANGE: RangeDays = 30;

export const RANGE_LABELS: Record<RangeDays, string> = {
  7: '7 хоног',
  30: '30 хоног',
  90: '90 хоног',
};

/** `?range=7|30|90` → a supported period, anything else → the default. */
export function parseRange(value: string | undefined): RangeDays {
  return RANGES.find((days) => String(days) === value) ?? DEFAULT_RANGE;
}

/** Today's date in Ulaanbaatar as `YYYY-MM-DD` (servers usually run in UTC). */
export function todayInUlaanbaatar(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ulaanbaatar' }).format(new Date());
}
