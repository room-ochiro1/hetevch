import { formatMoney, formatNet } from '@hetevch/shared';

import { Waterfall, type WaterfallStep } from '@/components/charts/waterfall';
import { Pill } from '@/components/ui/badge';
import { Panel } from '@/components/ui/panel';
import { getDashboard } from '@/lib/dal/analytics';
import { getTopCategories } from '@/lib/dal/overview';
import { filterHref, type Filters } from '@/lib/filters';
import { RANGE_LABELS } from '@/lib/range';

/** Where the period's income went: the three biggest expenses, the rest, and what's left. */
export async function MoneyFlowPanel({ filters }: { filters: Filters }) {
  const { days, band, sex } = filters;
  const [{ current }, expense] = await Promise.all([
    getDashboard(days, band, sex),
    getTopCategories('expense', days, band, sex),
  ]);
  const net = current.income - current.expense;
  const top = expense.slice(0, 3);
  const rest = current.expense - top.reduce((sum, category) => sum + category.total, 0);
  const link = (detail: Parameters<typeof filterHref>[2]) => filterHref('/', filters, detail);

  const steps: WaterfallStep[] = [
    { key: 'income', label: 'Орлого', icon: '💰', value: current.income, href: link({ type: 'kind', kind: 'income' }) },
    ...top.map((category) => ({
      key: category.categoryId,
      label: category.name,
      icon: category.icon,
      value: -category.total,
      href: link({ type: 'category', id: category.categoryId, band: null }),
    })),
    ...(rest > 0.5 ? [{ key: 'rest', label: 'Бусад', icon: '⋯', value: -rest, href: link({ type: 'kind', kind: 'expense' }) }] : []),
    { key: 'net', label: 'Үлдсэн', icon: '🏦', value: 0, total: true },
  ];

  return (
    <Panel
      title="Мөнгөний задаргаа"
      description="Орлогоос юунд зарцуулаад хэд үлдсэн бэ"
      action={<Pill>{RANGE_LABELS[days]}</Pill>}
      className="h-full"
    >
      <div className="flex flex-col gap-4">
        <div>
          <p className={`text-[28px] leading-none font-semibold tracking-tight tabular-nums ${net < 0 ? 'text-expense' : ''}`}>
            {formatNet(net)}
          </p>
          <p className="mt-1.5 text-xs text-muted">
            {formatMoney(current.income)} орлогоос {formatMoney(current.expense)} зарцуулсан
          </p>
        </div>
        <Waterfall steps={steps} label={`Сүүлийн ${days} хоногийн орлого, зарлага, үлдэгдэл`} />
      </div>
    </Panel>
  );
}
