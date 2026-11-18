'use client';

import { useActionState } from 'react';

import { deleteCategory } from '@/app/(admin)/categories/actions';
import { FormMessage } from '@/components/ui/form-message';
import { initialActionState } from '@/lib/action-state';

type DeleteCategoryButtonProps = {
  id: string;
  name: string;
  inUse: boolean;
};

export function DeleteCategoryButton({ id, name, inUse }: DeleteCategoryButtonProps) {
  const [state, formAction, pending] = useActionState(deleteCategory, initialActionState);

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!window.confirm(`«${name}» ангиллыг устгах уу? Энэ үйлдлийг буцаах боломжгүй.`)) {
          event.preventDefault();
        }
      }}
      className="flex flex-col gap-2"
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={pending || inUse}
        title={inUse ? 'Гүйлгээнд ашиглагдаж буй ангиллыг устгах боломжгүй' : undefined}
        className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-expense hover:bg-expense-soft disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? 'Устгаж байна…' : 'Устгах'}
      </button>
      {inUse ? (
        <p className="text-xs text-muted">Гүйлгээнд ашиглагдаж байгаа тул устгах боломжгүй.</p>
      ) : null}
      <FormMessage state={state} />
    </form>
  );
}
