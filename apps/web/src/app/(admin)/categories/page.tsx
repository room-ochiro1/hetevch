import { Suspense } from 'react';

import { CategoryForm } from '@/components/categories/category-form';
import { CategoryList } from '@/components/categories/category-list';
import { UserCategoryTable } from '@/components/categories/user-category-table';
import { PageHeader } from '@/components/ui/page-header';
import { Panel } from '@/components/ui/panel';
import { listCategories, listUserCategories } from '@/lib/dal/categories';
import { formatCount } from '@/lib/format';

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
      <Suspense fallback={<div aria-hidden className="h-64 animate-pulse rounded-2xl bg-surface-2" />}>
        <UserCategories />
      </Suspense>
    </>
  );
}

/** Categories users made in the app; each is visible only to the user who made it. */
async function UserCategories() {
  const { rows, total } = await listUserCategories();
  const shown = rows.length < total ? ` · сүүлийн ${formatCount(rows.length)}-г харуулж байна` : '';

  return (
    <Panel
      title="Хэрэглэгчдийн нэмсэн ангиллууд"
      description={`${formatCount(total)} ангилал · зөвхөн нэмсэн хэрэглэгч нь харж, засна${shown}`}
      flush
    >
      <UserCategoryTable rows={rows} />
    </Panel>
  );
}
