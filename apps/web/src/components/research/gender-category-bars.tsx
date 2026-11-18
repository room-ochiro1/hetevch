import { formatMoney } from '@hetevch/shared';

import { SEX_DOT } from '@/components/research/gender-compare-table';
import type { GenderCategory } from '@/lib/dal/gender';
import { SEX_LABELS } from '@/lib/sex';

const SHOWN = 8;
const PAIR = ['male', 'female'] as const;

type Row = { id: string; name: string; icon: string; share: Record<(typeof PAIR)[number], number>; total: Record<(typeof PAIR)[number], number> };

/**
 * What men and women spend on: for the biggest categories, each gender's share of its own
 * spending (so a bigger group doesn't win just by being bigger). Two thin bars per category on
 * one shared scale, each with its percent; hover a bar for the amount.
 */
export function GenderCategoryBars({ categories }: { categories: GenderCategory[] }) {
  const spent = { male: 0, female: 0 };
  const byId = new Map<string, Row>();
  for (const row of categories) {
    if (row.sex === 'unknown') continue;
    spent[row.sex] += row.total;
    const entry = byId.get(row.categoryId) ?? {
      id: row.categoryId,
      name: row.name,
      icon: row.icon,
      share: { male: 0, female: 0 },
      total: { male: 0, female: 0 },
    };
    entry.total[row.sex] += row.total;
    byId.set(row.categoryId, entry);
  }
  const rows = [...byId.values()]
    .map((row) => ({
      ...row,
      share: {
        male: spent.male > 0 ? row.total.male / spent.male : 0,
        female: spent.female > 0 ? row.total.female / spent.female : 0,
      },
    }))
    .sort((a, b) => b.share.male + b.share.female - (a.share.male + a.share.female))
    .slice(0, SHOWN);
  const max = Math.max(0.01, ...rows.flatMap((row) => [row.share.male, row.share.female]));

  if (rows.length === 0) {
    return <p className="py-6 text-center text-sm text-muted">Энэ хугацаанд эр, эм хэрэглэгчдийн зарлага алга.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-4 text-xs text-muted" aria-hidden>
        {PAIR.map((sex) => (
          <span key={sex} className="inline-flex items-center gap-1.5">
            <span className={`size-2.5 rounded-full ${SEX_DOT[sex]}`} /> {SEX_LABELS[sex]}: өөрийн зарлагын хувь
          </span>
        ))}
      </div>
      <ul className="flex flex-col gap-3">
        {rows.map((row) => (
          <li key={row.id} className="grid grid-cols-[minmax(0,9rem)_1fr] items-center gap-3">
            <span className="truncate text-sm">
              <span aria-hidden>{row.icon}</span> {row.name}
            </span>
            <span className="flex flex-col gap-1">
              {PAIR.map((sex) => (
                <span
                  key={sex}
                  className="flex items-center gap-2"
                  title={`${SEX_LABELS[sex]}: ${Math.round(row.share[sex] * 100)}% · ${formatMoney(Math.round(row.total[sex]))}`}
                >
                  <span
                    className={`h-2 rounded-r ${SEX_DOT[sex]}`}
                    style={{ width: `${Math.max((row.share[sex] / max) * 100, row.share[sex] > 0 ? 2 : 0)}%` }}
                  />
                  <span className="text-xs text-muted tabular-nums">
                    <span className="sr-only">{SEX_LABELS[sex]}: </span>
                    {Math.round(row.share[sex] * 100)}%
                  </span>
                </span>
              ))}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
