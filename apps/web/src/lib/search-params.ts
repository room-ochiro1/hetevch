export const PAGE_SIZE = 25;

export type SearchParams = Record<string, string | string[] | undefined>;

/** First value of a query param, trimmed; empty strings become undefined. */
export function getParam(params: SearchParams, key: string): string | undefined {
  const raw = params[key];
  const value = (Array.isArray(raw) ? raw[0] : raw)?.trim();
  return value ? value : undefined;
}

/** 1-based page number from `?page=`, never below 1. */
export function getPage(params: SearchParams): number {
  const page = Number.parseInt(getParam(params, 'page') ?? '1', 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

/** Inclusive row range for Supabase `.range(from, to)`. */
export function pageRange(page: number, size = PAGE_SIZE): [number, number] {
  const from = (page - 1) * size;
  return [from, from + size - 1];
}

/** Removes characters that would break a PostgREST `or=(...)` filter. */
export function sanitizeSearch(term: string): string {
  return term.replace(/[%,()*\\:"']/g, ' ').trim().slice(0, 60);
}

/** Builds `?a=1&b=2` from the given params, skipping empty values. */
export function buildQuery(params: Record<string, string | number | undefined>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') query.set(key, String(value));
  }
  const text = query.toString();
  return text ? `?${text}` : '';
}
