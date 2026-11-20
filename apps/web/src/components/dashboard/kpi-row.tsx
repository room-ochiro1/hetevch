import { formatMoney } from '@hetevch/shared';

import { MiniArea, MiniBars, MiniMeter, MiniRing } from '@/components/charts/mini-viz';
import { KpiCard, KpiCardSkeleton } from '@/components/dashboard/kpi-card';
import { ActivityIcon, ReceiptIcon, TrendDownIcon, UserPlusIcon } from '@/components/ui/icons';
import { formatCompactMoney } from '@/lib/chart-scale';
import { getDashboard } from '@/lib/dal/analytics';
import { formatCount } from '@/lib/format';
import { filterHref, type Filters } from '@/lib/filters';

const percent = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 100) : 0);

/** The four headline numbers for the period, each with its change and a small chart. */
export async function KpiRow({ filters }: { filters: Filters }) {
  const { days, band, sex } = filters;
  const { totalUsers, daily, current, previous } = await getDashboard(days, band, sex);
  const versus = `өмнөх ${days} хоногоос`;
  const bands = filterHref('/', filters, { type: 'bands' });
  const expenseHref = filterHref('/', filters, { type: 'kind', kind: 'expense' });
  const perDay = Math.round(current.txCount / days);

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        icon={UserPlusIcon}
        label="Шинэ хэрэглэгч"
        value={formatCount(current.newUsers)}
        hint={`Нийт ${formatCount(totalUsers)} хэрэглэгч`}
        delta={{ current: current.newUsers, previous: previous.newUsers, versus }}
        viz={<MiniBars values={daily.map((d) => d.newUsers)} />}
        href={bands}
      />
      <KpiCard
        icon={ActivityIcon}
        tone="income"
        label="Идэвхтэй хэрэглэгч"
        value={formatCount(current.activeUsers)}
        hint={`Нийт хэрэглэгчийн ${percent(current.activeUsers, totalUsers)}% гүйлгээ бүртгэсэн`}
        delta={{ current: current.activeUsers, previous: previous.activeUsers, versus }}
        viz={<MiniRing ratio={totalUsers > 0 ? current.activeUsers / totalUsers : 0} />}
        href={bands}
      />
      <KpiCard
        icon={ReceiptIcon}
        tone="warn"
        label="Гүйлгээ"
        value={formatCount(current.txCount)}
        hint={`Өдөрт дунджаар ${formatCount(perDay)}`}
        delta={{ current: current.txCount, previous: previous.txCount, versus }}
        viz={<MiniArea values={daily.map((d) => d.txCount)} />}
        href={expenseHref}
      />
      <KpiCard
        icon={TrendDownIcon}
        tone="expense"
        label="Нийт зарлага"
        value={formatMoney(current.expense)}
        hint={current.income > 0 ? `Орлогын ${percent(current.expense, current.income)}%-ийг зарцуулсан` : 'Орлого бүртгэгдээгүй'}
        delta={{ current: current.expense, previous: previous.expense, versus, polarity: 'neutral' }}
        footer={
          <MiniMeter
            total={Math.max(current.income, current.expense)}
            parts={[
              { label: 'Зарлага', value: current.expense, text: formatCompactMoney(current.expense), className: 'bg-chart-expense' },
              {
                label: 'Үлдсэн',
                value: Math.max(0, current.income - current.expense),
                text: formatCompactMoney(Math.max(0, current.income - current.expense)),
                className: 'bg-chart-income',
              },
            ]}
          />
        }
        href={expenseHref}
      />
    </div>
  );
}

export function KpiRowSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }, (_, i) => (
        <KpiCardSkeleton key={i} />
      ))}
    </div>
  );
}
