'use client';

import { useActionState, useEffect, useRef } from 'react';

import { createCategory, updateCategory } from '@/app/(admin)/categories/actions';
import { FormMessage } from '@/components/ui/form-message';
import { initialActionState } from '@/lib/action-state';
import type { AdminCategory } from '@/lib/dal/categories';

type CategoryFormProps = { category?: AdminCategory };

const field =
  'w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent';
const label = 'flex flex-col gap-1 text-xs font-medium text-muted';

/** Creates a category, or edits one when `category` is given (kind is fixed once created). */
export function CategoryForm({ category }: CategoryFormProps) {
  const isEdit = Boolean(category);
  const [state, formAction, pending] = useActionState(
    isEdit ? updateCategory : createCategory,
    initialActionState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success && !isEdit) formRef.current?.reset();
  }, [state, isEdit]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      {category ? <input type="hidden" name="id" value={category.id} /> : null}
      {isEdit ? null : (
        <label className={label}>
          Төрөл
          <select name="kind" defaultValue="expense" className={field}>
            <option value="expense">Зарлага</option>
            <option value="income">Орлого</option>
          </select>
        </label>
      )}
      <label className={label}>
        Нэр
        <input name="name" required maxLength={40} defaultValue={category?.name} className={field} />
      </label>
      <div className="grid grid-cols-[1fr_auto_1fr] gap-3">
        <label className={label}>
          Дүрс
          <input name="icon" required defaultValue={category?.icon ?? '📦'} className={field} />
        </label>
        <label className={label}>
          Өнгө
          <input
            name="color"
            type="color"
            defaultValue={category?.color.toLowerCase() ?? '#64748b'}
            className="h-[38px] w-14 cursor-pointer rounded-xl border border-border bg-surface p-1"
          />
        </label>
        <label className={label}>
          Эрэмбэ
          <input
            name="sortOrder"
            type="number"
            min={0}
            max={9999}
            defaultValue={category?.sortOrder ?? 100}
            className={field}
          />
        </label>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-on-accent hover:opacity-90 disabled:opacity-60"
      >
        {pending ? 'Хадгалж байна…' : isEdit ? 'Хадгалах' : 'Ангилал нэмэх'}
      </button>
      <FormMessage state={state} />
    </form>
  );
}
