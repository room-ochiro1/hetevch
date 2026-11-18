import { formatAmount, formatMoney } from '@hetevch/shared';

import { WEEKDAY_LABELS } from '@/lib/age-bands';
import { getResearch, type Research } from '@/lib/dal/research';
import { formatCount } from '@/lib/format';
import type { RangeDays } from '@/lib/range';

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);
const share = (part: number, whole: number) => (whole > 0 ? `${Math.round((part / whole) * 100)}%` : '—');

/** Average expense per occurrence of each weekday (index 0 = Monday). */
export function weekdayAverages(research: Research): { total: number; average: number }[] {
  return WEEKDAY_LABELS.map((_, index) => {
    const total = sum(research.weekdays.filter((row) => row.weekday === index + 1).map((row) => row.expense));
    const times = research.weekdayCounts[index] ?? 0;
    return { total, average: times > 0 ? total / times : 0 };
  });
}

/** The headline numbers of the research page, each with the context that makes it readable. */
export async function ResearchKpis({ days }: { days: RangeDays }) {
  const research = await getResearch(days);
  const { bands, cards, flow } = research;
  const users = sum(bands.map((b) => b.users));
  const withAge = users - sum(bands.filter((b) => b.band === 'unknown').map((b) => b.users));
  const savers = sum(bands.map((b) => b.savers));
  const savedMnt = sum(bands.map((b) => b.savedMnt));
  const savedUsd = sum(bands.map((b) => b.savedUsd));
  const income = sum(bands.map((b) => b.income));
  const deposits = sum(flow.filter((f) => f.currency === 'MNT').map((f) => f.deposits));
  const averages = weekdayAverages(research);
  const peak = averages.reduce((best, day, i) => (day.average > (averages[best]?.average ?? 0) ? i : best), 0);
  const hasSpending = (averages[peak]?.average ?? 0) > 0;

  const tiles = [
    {
      label: 'Хэрэглэгч',
      value: formatCount(users),
      note: `Насаа бүртгүүлсэн ${formatCount(withAge)} (${share(withAge, users)})`,
    },
    {
      label: 'Хадгаламжтай хэрэглэгч',
      value: share(savers, users),
      note: `${formatCount(savers)} хүн · ${formatCount(cards.length)} карт`,
    },
    {
      label: 'Нийт хадгаламж',
      value: formatMoney(Math.round(savedMnt)),
      note: savedUsd > 0 ? `Үүн дээр ${formatAmount(savedUsd, 'USD')} долларын картад` : 'Төгрөгийн картуудад',
    },
    {
      label: 'Орлогоосоо хадгалсан',
      value: share(deposits, income),
      note: `${formatMoney(Math.round(deposits))} хийсэн / ${formatMoney(Math.round(income))} орлого`,
    },
    {
      label: 'Хамгийн их зарцуулдаг гараг',
      value: hasSpending ? (WEEKDAY_LABELS[peak] ?? '—') : '—',
      note: hasSpending
        ? `Тэр өдөр дунджаар ${formatMoney(Math.round(averages[peak]?.average ?? 0))}`
        : 'Зарлага бүртгэгдээгүй',
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {tiles.map((tile) => (
        <div key={tile.label} className="flex flex-col gap-1 rounded-2xl border border-border bg-surface p-5">
          <p className="text-xs font-medium text-muted">{tile.label}</p>
          <p className="truncate text-2xl font-semibold tabular-nums">{tile.value}</p>
          <p className="text-xs text-muted">{tile.note}</p>
        </div>
      ))}
    </div>
  );
}

export function ResearchKpisSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} aria-hidden className="h-28 animate-pulse rounded-2xl bg-surface-2" />
      ))}
    </div>
  );
}
