import { CategoryForm } from '@/components/categories/category-form';
import { CategoryList } from '@/components/categories/category-list';
import { PageHeader } from '@/components/ui/page-header';
import { Panel } from '@/components/ui/panel';
import { listCategories } from '@/lib/dal/categories';

export default async function CategoriesPage() {
  const categories = await listCategories();
  const expense = categories.filter((category) => category.kind === 'expense');
  const income = categories.filter((category) => category.kind === 'income');

  return (
    <>
      <PageHeader
        title="Ангилал"
        description="Бүх хэрэглэгчийн аппад харагдах орлого, зарлагын ангиллууд"
      />
      <div className="grid items-start gap-4 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-4">
          <Panel title="Зарлагын ангилал" description={`${expense.length} ангилал`} flush>
            <CategoryList categories={expense} />
          </Panel>
          <Panel title="Орлогын ангилал" description={`${income.length} ангилал`} flush>
            <CategoryList categories={income} />
          </Panel>
        </div>
        <Panel title="Шинэ ангилал" description="Хэрэглэгчид шууд харагдана" className="lg:sticky lg:top-8">
          <CategoryForm />
        </Panel>
      </div>
    </>
  );
}
