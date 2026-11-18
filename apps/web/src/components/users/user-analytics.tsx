import { formatMoney } from '@hetevch/shared';

import { CashflowChart } from '@/components/charts/cashflow-chart';
import { CategoryBars } from '@/components/charts/category-bars';
import { Panel } from '@/components/ui/panel';
import { getUserCategories, getUserDaily } from '@/lib/dal/user-analytics';

const DAYS = 90;

/** One user's last 90 days: daily money flow and where their money goes. */
export async function UserAnalytics({ userId }: { userId: string }) {
  const [daily, categories] = await Promise.all([
    getUserDaily(userId, DAYS),
    getUserCategories(userId, 'expense', DAYS),
  ]);
  const income = daily.reduce((sum, d) => sum + d.income, 0);
  const expense = daily.reduce((sum, d) => sum + d.expense, 0);

  return (
    <div className="grid items-start gap-4 xl:grid-cols-[1.6fr_1fr]">
      <Panel
        title="Мөнгөн урсгал"
        description={`Сүүлийн ${DAYS} хоног · орлого +${formatMoney(income)}, зарлага −${formatMoney(expense)}`}
      >
        <CashflowChart label={`Хэрэглэгчийн сүүлийн ${DAYS} хоногийн орлого ба зарлага`} data={daily} />
      </Panel>
      <Panel title="Зарлагын бүтэц" description={`Ангиллаар · сүүлийн ${DAYS} хоног`}>
        <CategoryBars
          categories={categories}
          total={expense}
          barClass="bg-chart-expense"
          emptyTitle="Энэ хугацаанд зарлага алга"
        />
      </Panel>
    </div>
  );
}

export function UserAnalyticsSkeleton() {
  return (
    <div aria-hidden className="grid animate-pulse gap-4 xl:grid-cols-[1.6fr_1fr]">
      <div className="h-96 rounded-2xl bg-surface-2" />
      <div className="h-96 rounded-2xl bg-surface-2" />
    </div>
  );
}
