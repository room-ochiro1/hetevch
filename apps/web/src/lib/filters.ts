import { AGE_BANDS, type AgeBand } from '@/lib/age-bands';
import { isUuid } from '@/lib/parse';
import { DEFAULT_RANGE, parseRange, type RangeDays } from '@/lib/range';
import { parseSex, type Sex } from '@/lib/sex';
import { buildQuery, getParam, type SearchParams } from '@/lib/search-params';

/*
 * Page filters and the open detail dialog live in the URL (?range=30&age=25-34&sex=female&detail=…), so a
 * view survives reloads, the back button closes a dialog, and a link shares exactly what you
 * see. Pure functions: used by server pages and client charts alike.
 */

export type Filters = { days: RangeDays; band: AgeBand | null; sex: Sex | null };

export type Detail =
  | { type: 'category'; id: string; band: AgeBand | null }
  | { type: 'day'; day: string }
  | { type: 'band'; band: AgeBand }
  | { type: 'bands' }
  | { type: 'kind'; kind: 'income' | 'expense' }
  | { type: 'purpose'; icon: string; band: AgeBand | null };

function parseBand(value: string | undefined): AgeBand | null {
  return AGE_BANDS.find((band) => band === value) ?? null;
}

export function parseFilters(params: SearchParams): Filters {
  return {
    days: parseRange(getParam(params, 'range')),
    band: parseBand(getParam(params, 'age')),
    sex: parseSex(getParam(params, 'sex')),
  };
}

/** `?detail=` → a dialog to open, or null when absent or malformed. */
export function parseDetail(params: SearchParams): Detail | null {
  const raw = getParam(params, 'detail');
  if (!raw) return null;
  const [type, value = '', extra] = raw.split(':');
  switch (type) {
    case 'category':
      return isUuid(value) ? { type, id: value, band: parseBand(extra) } : null;
    case 'day':
      return /^\d{4}-\d{2}-\d{2}$/.test(value) ? { type, day: value } : null;
    case 'band': {
      const band = parseBand(value);
      return band ? { type, band } : null;
    }
    case 'bands':
      return { type };
    case 'kind':
      return value === 'income' || value === 'expense' ? { type, kind: value } : null;
    case 'purpose':
      return value && [...value].length <= 8 ? { type, icon: value, band: parseBand(extra) } : null;
    default:
      return null;
  }
}

/** The `detail` value for a dialog (inverse of parseDetail). */
export function detailKey(detail: Detail): string {
  switch (detail.type) {
    case 'category':
      return detail.band ? `category:${detail.id}:${detail.band}` : `category:${detail.id}`;
    case 'day':
      return `day:${detail.day}`;
    case 'band':
      return `band:${detail.band}`;
    case 'bands':
      return 'bands';
    case 'kind':
      return `kind:${detail.kind}`;
    case 'purpose':
      return detail.band ? `purpose:${detail.icon}:${detail.band}` : `purpose:${detail.icon}`;
  }
}

/** A link to `basePath` with these filters, optionally with a dialog open. */
export function filterHref(basePath: string, filters: Filters, detail?: Detail | null): string {
  return `${basePath}${buildQuery({
    range: filters.days === DEFAULT_RANGE ? undefined : filters.days,
    age: filters.band ?? undefined,
    sex: filters.sex ?? undefined,
    detail: detail ? detailKey(detail) : undefined,
  })}`;
}
