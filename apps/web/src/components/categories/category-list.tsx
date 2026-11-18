import { CategoryForm } from '@/components/categories/category-form';
import { DeleteCategoryButton } from '@/components/categories/delete-category-button';
import { EmptyState } from '@/components/ui/empty-state';
import type { AdminCategory } from '@/lib/dal/categories';
import { formatCount } from '@/lib/format';

/** Category rows; each opens an inline editor with a delete action. */
export function CategoryList({ categories }: { categories: AdminCategory[] }) {
  if (categories.length === 0) {
    return <EmptyState title="Ангилал алга байна" />;
  }

  return (
    <ul className="flex flex-col divide-y divide-border border-t border-border">
      {categories.map((category) => (
        <li key={category.id}>
          <details className="group">
            <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-3 hover:bg-surface-2/50">
              <span
                className="grid size-9 shrink-0 place-items-center rounded-xl text-lg"
                style={{ backgroundColor: `${category.color}26` }}
                aria-hidden
              >
                {category.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{category.name}</span>
                <span className="block text-xs text-muted">
                  {formatCount(category.txCount)} гүйлгээ · эрэмбэ {category.sortOrder}
                </span>
              </span>
              <span
                className="size-3 shrink-0 rounded-full"
                style={{ backgroundColor: category.color }}
                aria-hidden
              />
              <span className="text-xs text-muted group-open:hidden">Засах</span>
              <span className="hidden text-xs text-muted group-open:inline">Хаах</span>
            </summary>
            <div className="grid gap-4 bg-surface-2/40 px-5 py-4 sm:grid-cols-[1fr_auto]">
              <CategoryForm category={category} />
              <div className="sm:w-48">
                <DeleteCategoryButton
                  id={category.id}
                  name={category.name}
                  inUse={category.txCount > 0}
                />
              </div>
            </div>
          </details>
        </li>
      ))}
    </ul>
  );
}
