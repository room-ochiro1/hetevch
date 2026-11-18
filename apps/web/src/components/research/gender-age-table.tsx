import { formatMoney } from '@hetevch/shared';

import { SEX_DOT } from '@/components/research/gender-compare-table';
import { AGE_BANDS, AGE_BAND_LABELS, MIN_SAMPLE } from '@/lib/age-bands';
import type { GenderAgeRow } from '@/lib/dal/gender';
import { formatCount } from '@/lib/format';
import { SEX_LABELS } from '@/lib/sex';

const PAIR = ['male', 'female'] as const;

/**
 * Age × gender: how many men and women are in each band and what one of them spends on
 * average in the period (everyone in the cell, active or not). Cells under MIN_SAMPLE people
 * are marked, since a couple of people can swing an average.
 */
export function GenderAgeTable({ rows }: { rows: GenderAgeRow[] }) {
  const cell = (band: string, sex: string) => rows.find((row) => row.band === band && row.sex === sex);
  const bands = AGE_BANDS.filter((band) => PAIR.some((sex) => (cell(band, sex)?.users ?? 0) > 0));
  const unknown = rows.filter((row) => row.sex === 'unknown').reduce((sum, row) => sum + row.users, 0);

  if (bands.length === 0) {
    return <p className="py-6 text-center text-sm text-muted">Хүйсээ оруулсан хэрэглэгч алга.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <caption className="sr-only">Насны бүлэг ба хүйсээр: хүний тоо, нэг хүний дундаж зарлага</caption>
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted">
              <th scope="col" className="py-2 pr-3 font-medium">Нас</th>
              {PAIR.map((sex) => (
                <th key={sex} scope="col" className="px-3 py-2 text-right font-medium">
                  <span className="inline-flex items-center gap-1.5">
                    <span aria-hidden className={`size-2.5 rounded-full ${SEX_DOT[sex]}`} />
                    {SEX_LABELS[sex]}: хүн · нэг хүний зарлага
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bands.map((band) => (
              <tr key={band} className="border-b border-border last:border-0">
                <th scope="row" className="py-2.5 pr-3 text-left font-medium">{AGE_BAND_LABELS[band]}</th>
                {PAIR.map((sex) => {
                  const row = cell(band, sex);
                  const users = row?.users ?? 0;
                  return (
                    <td key={sex} className={`px-3 py-2.5 text-right tabular-nums ${users > 0 && users < MIN_SAMPLE ? 'text-muted' : ''}`}>
                      {users > 0 ? `${formatCount(users)} · ${formatMoney(Math.round((row?.total ?? 0) / users))}` : '—'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted">
        Саарал тоо: {MIN_SAMPLE}-аас цөөн хүнтэй нүд.
        {unknown > 0 ? ` Хүйсээ оруулаагүй ${formatCount(unknown)} хэрэглэгч энэ хүснэгтэд ороогүй.` : ''}
      </p>
    </div>
  );
}
