'use client';

import { useActionState } from 'react';

import { changeRole, type RoleFormState } from '@/app/(admin)/users/[id]/actions';

type RoleFormProps = {
  userId: string;
  role: 'user' | 'admin';
  isSelf: boolean;
};

const initialState: RoleFormState = { error: null, success: null };

export function RoleForm({ userId, role, isSelf }: RoleFormProps) {
  const [state, formAction, pending] = useActionState(changeRole, initialState);
  const isAdmin = role === 'admin';
  const nextRole = isAdmin ? 'user' : 'admin';
  const confirmText = isAdmin
    ? 'Энэ хэрэглэгчийн админ эрхийг хасах уу?'
    : 'Энэ хэрэглэгчид админ эрх өгөх үү? Тэр бүх хэрэглэгчийн мэдээллийг харах боломжтой болно.';

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!window.confirm(confirmText)) event.preventDefault();
      }}
      className="flex flex-col gap-3"
    >
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="role" value={nextRole} />
      <p className="text-sm text-muted">
        {isAdmin
          ? 'Энэ хэрэглэгч админ самбарт нэвтэрч, бүх өгөгдлийг харах эрхтэй.'
          : 'Энгийн хэрэглэгч. Зөвхөн мобайл аппаар өөрийн мэдээллээ хардаг.'}
      </p>
      <button
        type="submit"
        disabled={pending || (isSelf && isAdmin)}
        className={`rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-50 ${
          isAdmin
            ? 'border border-border text-expense hover:bg-expense-soft'
            : 'bg-accent text-on-accent hover:opacity-90'
        }`}
      >
        {pending ? 'Хадгалж байна…' : isAdmin ? 'Админ эрхийг хасах' : 'Админ болгох'}
      </button>
      {isSelf && isAdmin ? (
        <p className="text-xs text-muted">Өөрийнхөө админ эрхийг хасах боломжгүй.</p>
      ) : null}
      {state.error ? (
        <p role="alert" className="text-sm text-expense">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p role="status" className="text-sm text-income">
          {state.success}
        </p>
      ) : null}
    </form>
  );
}
