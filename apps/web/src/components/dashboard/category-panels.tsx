import { CategoryBars } from '@/components/charts/category-bars';
import { Panel } from '@/components/ui/panel';
import { getDashboard } from '@/lib/dal/analytics';
import { getTopCategories } from '@/lib/dal/overview';
import { filterHref, type Filters } from '@/lib/filters';

/** What people spend on and earn from, across all users, for the period. */
export async function CategoryPanels({ filters }: { filters: Filters }) {
  const { days, band, sex } = filters;
  const [{ current }, expense, income] = await Promise.all([
    getDashboard(days, band, sex),
    getTopCategories('expense', days, band, sex),
    getTopCategories('income', days, band, sex),
  ]);

  const hrefFor = (id: string) => filterHref('/', filters, { type: 'category', id, band: null });

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title="Зарлага ангиллаар" description={`Хамгийн их зарцуулалт · сүүлийн ${days} хоног`}>
        <CategoryBars
          categories={expense}
          total={current.expense}
          barClass="bg-chart-expense"
          emptyTitle="Зарлага бүртгэгдээгүй байна"
          hrefFor={hrefFor}
        />
      </Panel>
      <Panel title="Орлого ангиллаар" description={`Орлогын эх үүсвэр · сүүлийн ${days} хоног`}>
        <CategoryBars
          categories={income}
          total={current.income}
          barClass="bg-chart-income"
          emptyTitle="Орлого бүртгэгдээгүй байна"
          hrefFor={hrefFor}
        />
      </Panel>
    </div>
  );
}
