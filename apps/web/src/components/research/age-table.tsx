import { formatAmount, formatMoney } from '@hetevch/shared';

import { Badge } from '@/components/ui/badge';
import { AGE_BANDS, AGE_BAND_LABELS, MIN_SAMPLE } from '@/lib/age-bands';
import type { BandRow } from '@/lib/dal/research';
import { formatCount } from '@/lib/format';

const money = (value: number) => formatMoney(Math.round(value));
const per = (total: number, people: number) => (people > 0 ? money(total / people) : '—');

/**
 * One row per age band that has users. Averages are per person who did the thing (spent, or
 * saved), so a band full of new users doesn't look thrifty just because it is inactive.
 */
export function AgeTable({ bands }: { bands: BandRow[] }) {
  const rows = AGE_BANDS.map((band) => bands.find((row) => row.band === band)).filter(
    (row): row is BandRow => Boolean(row && row.users > 0),
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <caption className="sr-only">Насны бүлэг бүрийн дундаж орлого, зарлага, хадгаламж</caption>
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted">
            <th scope="col" className="py-2 pr-3 font-medium">Бүлэг</th>
            <th scope="col" className="px-3 py-2 text-right font-medium">Идэвхтэй</th>
            <th scope="col" className="px-3 py-2 text-right font-medium">Дундаж зарлага</th>
            <th scope="col" className="px-3 py-2 text-right font-medium">Дундаж орлого</th>
            <th scope="col" className="px-3 py-2 text-right font-medium">Хадгаламжтай</th>
            <th scope="col" className="py-2 pl-3 text-right font-medium">Дундаж хадгаламж</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.band} className="border-b border-border last:border-0">
              <th scope="row" className="py-2.5 pr-3 text-left font-medium">
                <span className="flex flex-wrap items-center gap-1.5">
                  {AGE_BAND_LABELS[row.band]}
                  {row.users < MIN_SAMPLE ? <Badge>бага түүвэр</Badge> : null}
                </span>
                <span className="block text-xs font-normal text-muted">{formatCount(row.users)} хүн</span>
              </th>
              <td className="px-3 py-2.5 text-right tabular-nums">
                {formatCount(row.activeUsers)}
                <span className="block text-xs text-muted">
                  {Math.round((row.activeUsers / row.users) * 100)}%
                </span>
              </td>
              <td className="px-3 py-2.5 text-right tabular-nums">{per(row.expense, row.activeUsers)}</td>
              <td className="px-3 py-2.5 text-right tabular-nums">{per(row.income, row.activeUsers)}</td>
              <td className="px-3 py-2.5 text-right tabular-nums">
                {formatCount(row.savers)}
                <span className="block text-xs text-muted">{Math.round((row.savers / row.users) * 100)}%</span>
              </td>
              <td className="py-2.5 pl-3 text-right tabular-nums">
                {per(row.savedMnt, row.savers)}
                {row.savedUsd > 0 ? (
                  <span className="block text-xs text-muted">+ {formatAmount(row.savedUsd / row.savers, 'USD')}</span>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-xs text-muted">
        Дундаж зарлага, орлого нь тухайн хугацаанд гүйлгээ хийсэн нэг хүнд, дундаж хадгаламж нь картай
        нэг хүнд ногдох дүн. «Бага түүвэр» гэсэн бүлэгт {MIN_SAMPLE}-аас цөөн хүн байгаа тул дүгнэлт
        хийхэд эрт.
      </p>
    </div>
  );
}
