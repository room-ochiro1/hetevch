import { formatMoney } from '@hetevch/shared';

import { Badge } from '@/components/ui/badge';
import { MIN_SAMPLE } from '@/lib/age-bands';
import type { GenderGroup } from '@/lib/dal/gender';
import { formatCount } from '@/lib/format';
import { SEX_LABELS, type Sex } from '@/lib/sex';

/** Series colour per gender (validated pair; "unknown" is the neutral). */
export const SEX_DOT: Record<Sex, string> = {
  male: 'bg-chart-male',
  female: 'bg-chart-female',
  unknown: 'bg-muted',
};

const money = (value: number) => formatMoney(Math.round(value));
const ratio = (part: number, whole: number) => (whole > 0 ? part / whole : null);
const percent = (value: number | null) => (value === null ? '—' : `${Math.round(value * 100)}%`);
const each = (total: number, people: number) => (people > 0 ? money(total / people) : '—');

type Metric = { label: string; hint: string; value: (g: GenderGroup, all: number) => string };

/** Averages are per active person (who logged anything), so new, idle accounts don't dilute them. */
const METRICS: Metric[] = [
  { label: 'Хэрэглэгч', hint: 'нийт хэрэглэгчийн хувь', value: (g, all) => `${formatCount(g.users)} · ${percent(ratio(g.users, all))}` },
  { label: 'Идэвхтэй', hint: 'хугацаанд гүйлгээ бүртгэсэн', value: (g) => percent(ratio(g.activeUsers, g.users)) },
  { label: 'Дундаж орлого', hint: 'идэвхтэй нэг хүнд', value: (g) => each(g.income, g.activeUsers) },
  { label: 'Дундаж зарлага', hint: 'идэвхтэй нэг хүнд', value: (g) => each(g.expense, g.activeUsers) },
  { label: 'Хэмнэлт', hint: '(орлого − зарлага) ÷ орлого', value: (g) => percent(ratio(g.income - g.expense, g.income)) },
  { label: 'Нэг худалдан авалт', hint: 'зарлагын гүйлгээний дундаж', value: (g) => each(g.expense, g.expenseTx) },
  {
    label: 'Гүйлгээ',
    hint: 'идэвхтэй нэг хүнд',
    value: (g) => (g.activeUsers > 0 ? ((g.incomeTx + g.expenseTx) / g.activeUsers).toFixed(1) : '—'),
  },
  { label: 'Хадгалагч', hint: 'хадгаламжид мөнгө хийсэн', value: (g) => percent(ratio(g.savers, g.users)) },
  { label: 'Хадгалсан', hint: 'нэг хадгалагчид', value: (g) => each(g.saved, g.savers) },
];

/** One column per gender (Тодорхойгүй only when someone has no gender), one row per metric. */
export function GenderCompareTable({ groups }: { groups: GenderGroup[] }) {
  const all = groups.reduce((sum, g) => sum + g.users, 0);
  const columns = groups.filter((g) => g.sex !== 'unknown' || g.users > 0);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-sm">
        <caption className="sr-only">Эр, эм хэрэглэгчдийн орлого, зарлага, хадгаламжийн харьцуулалт</caption>
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted">
            <th scope="col" className="py-2 pr-3 font-medium">Үзүүлэлт</th>
            {columns.map((g) => (
              <th key={g.sex} scope="col" className="px-3 py-2 text-right font-medium">
                <span className="inline-flex items-center gap-1.5">
                  <span aria-hidden className={`size-2.5 rounded-full ${SEX_DOT[g.sex]}`} />
                  <span className="text-foreground">{SEX_LABELS[g.sex]}</span>
                  {g.users < MIN_SAMPLE ? <Badge>бага түүвэр</Badge> : null}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {METRICS.map((metric) => (
            <tr key={metric.label} className="border-b border-border last:border-0">
              <th scope="row" className="py-2.5 pr-3 text-left font-medium">
                {metric.label}
                <span className="block text-xs font-normal text-muted">{metric.hint}</span>
              </th>
              {columns.map((g) => (
                <td key={g.sex} className="px-3 py-2.5 text-right tabular-nums">
                  {metric.value(g, all)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
