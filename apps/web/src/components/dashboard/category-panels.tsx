import { CategoryBars } from '@/components/charts/category-bars';
import { Panel } from '@/components/ui/panel';
import { getDashboard } from '@/lib/dal/analytics';
import { getTopCategories } from '@/lib/dal/overview';
import type { RangeDays } from '@/lib/range';

/** What people spend on and earn from, across all users, for the period. */
export async function CategoryPanels({ days }: { days: RangeDays }) {
  const [{ current }, expense, income] = await Promise.all([
    getDashboard(days),
    getTopCategories('expense', days),
    getTopCategories('income', days),
  ]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title="Зарлага ангиллаар" description={`Хамгийн их зарцуулалт · сүүлийн ${days} хоног`}>
        <CategoryBars
          categories={expense}
          total={current.expense}
          barClass="bg-chart-expense"
          emptyTitle="Зарлага бүртгэгдээгүй байна"
        />
      </Panel>
      <Panel title="Орлого ангиллаар" description={`Орлогын эх үүсвэр · сүүлийн ${days} хоног`}>
        <CategoryBars
          categories={income}
          total={current.income}
          barClass="bg-chart-income"
          emptyTitle="Орлого бүртгэгдээгүй байна"
        />
      </Panel>
    </div>
  );
}
