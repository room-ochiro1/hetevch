import { formatMoney, formatNet } from '@hetevch/shared';

import { CashflowChart } from '@/components/charts/cashflow-chart';
import { Panel } from '@/components/ui/panel';
import { getDashboard } from '@/lib/dal/analytics';
import type { RangeDays } from '@/lib/range';

/** Headline figures for the period, beside the chart title (the chart shows the shape). */
function Totals({ income, expense }: { income: number; expense: number }) {
  const items = [
    { label: 'Орлого', value: `+${formatMoney(income)}`, swatch: 'bg-chart-income' },
    { label: 'Зарлага', value: `−${formatMoney(expense)}`, swatch: 'bg-chart-expense' },
    { label: 'Зөрүү', value: formatNet(income - expense) },
  ];
  return (
    <dl className="flex flex-wrap gap-x-6 gap-y-2">
      {items.map((item) => (
        <div key={item.label} className="flex flex-col">
          <dt className="flex items-center gap-1.5 text-xs text-muted">
            {item.swatch ? <span aria-hidden className={`size-2 rounded-[2px] ${item.swatch}`} /> : null}
            {item.label}
          </dt>
          <dd className="text-sm font-semibold tabular-nums">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export async function CashflowPanel({ days }: { days: RangeDays }) {
  const { daily, current } = await getDashboard(days);

  return (
    <Panel
      title="Мөнгөн урсгал"
      description="Бүх хэрэглэгчийн өдөр бүрийн орлого (дээш) ба зарлага (доош)"
      action={<Totals income={current.income} expense={current.expense} />}
    >
      <CashflowChart
        label={`Сүүлийн ${days} хоногийн өдөр бүрийн орлого ба зарлага`}
        data={daily.map((d) => ({ day: d.day, income: d.income, expense: d.expense }))}
      />
    </Panel>
  );
}
