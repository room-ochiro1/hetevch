import { formatMoney, formatNet } from '@hetevch/shared';
import Link from 'next/link';

import { CashflowChart } from '@/components/charts/cashflow-chart';
import { Panel } from '@/components/ui/panel';
import { getDashboard } from '@/lib/dal/analytics';
import { filterHref, type Filters } from '@/lib/filters';

/** Headline figures for the period, beside the chart title (the chart shows the shape). */
function Totals({ income, expense, filters }: { income: number; expense: number; filters: Filters }) {
  const kind = (k: 'income' | 'expense') => filterHref('/', filters, { type: 'kind', kind: k });
  const items = [
    { label: 'Орлого', value: `+${formatMoney(income)}`, swatch: 'bg-chart-income', href: kind('income') },
    { label: 'Зарлага', value: `−${formatMoney(expense)}`, swatch: 'bg-chart-expense', href: kind('expense') },
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
          <dd className="text-sm font-semibold tabular-nums">
            {item.href ? (
              <Link href={item.href} scroll={false} className="underline decoration-dotted underline-offset-4 hover:decoration-solid">
                {item.value}
              </Link>
            ) : (
              item.value
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export async function CashflowPanel({ filters }: { filters: Filters }) {
  const { days, band, sex } = filters;
  const { daily, current } = await getDashboard(days, band, sex);

  return (
    <Panel
      title="Мөнгөн урсгал"
      description="Өдөр бүрийн орлого (дээш) ба зарлага (доош) · өдөр дээр дарж тухайн өдрийг задална"
      action={<Totals income={current.income} expense={current.expense} filters={filters} />}
    >
      <CashflowChart
        label={`Сүүлийн ${days} хоногийн өдөр бүрийн орлого ба зарлага`}
        data={daily.map((d) => ({ day: d.day, income: d.income, expense: d.expense }))}
        link={{ basePath: '/', filters }}
      />
    </Panel>
  );
}
