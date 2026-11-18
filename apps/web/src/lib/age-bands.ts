/**
 * Age bands of the Судалгаа page, in display order. The keys come from public.age_band() in
 * the admin_research migration (age = this Ulaanbaatar year − birth year). The cut-points are
 * the common survey convention (18–24, 25–34 … 65+), so numbers compare with other studies.
 */
export const AGE_BANDS = ['under18', '18-24', '25-34', '35-44', '45-54', '55-64', '65+', 'unknown'] as const;

export type AgeBand = (typeof AGE_BANDS)[number];

export const AGE_BAND_LABELS: Record<AgeBand, string> = {
  under18: '18-аас доош',
  '18-24': '18–24 нас',
  '25-34': '25–34 нас',
  '35-44': '35–44 нас',
  '45-54': '45–54 нас',
  '55-64': '55–64 нас',
  '65+': '65+ нас',
  unknown: 'Нас тодорхойгүй',
};

export function toAgeBand(value: string): AgeBand {
  return (AGE_BANDS as readonly string[]).includes(value) ? (value as AgeBand) : 'unknown';
}

/**
 * Below this many people a band describes individuals more than a group, so its numbers are
 * flagged as a small sample (statistics offices hide cells under 5–10; admins see raw data
 * anyway, so here they are marked rather than hidden).
 */
export const MIN_SAMPLE = 5;

/** What a savings card is for, read from the picture its owner chose. */
export const SAVINGS_PURPOSES: Record<string, string> = {
  '🐷': 'Ерөнхий хуримтлал',
  '💰': 'Бэлэн мөнгө',
  '🏦': 'Банкны хадгаламж',
  '🏠': 'Орон сууц',
  '🚗': 'Машин',
  '✈️': 'Аялал',
  '🎓': 'Боловсрол',
  '💍': 'Хурим, ёслол',
  '🎁': 'Бэлэг',
  '🛡️': 'Яаралтай үеийн',
  '📱': 'Гар утас, техник',
  '🌱': 'Ирээдүй, тэтгэвэр',
};

/** ISO weekdays, Monday first (1 = Monday … 7 = Sunday). */
export const WEEKDAY_LABELS = ['Даваа', 'Мягмар', 'Лхагва', 'Пүрэв', 'Баасан', 'Бямба', 'Ням'] as const;
