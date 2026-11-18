import type { TableInsert, TransactionKind } from '@hetevch/shared';

import { supabase } from '@/lib/supabase';

export type TransactionDraft = {
  kind: TransactionKind;
  amount: number;
  categoryId: string;
  note: string;
  occurredOn: string;
};

const SAVE_FAILED = 'Хадгалж чадсангүй. Интернэт холболтоо шалгаад дахин оролдоно уу.';
const DELETE_FAILED = 'Устгаж чадсангүй. Дахин оролдоно уу.';

/**
 * Creates a transaction, or updates it when `id` is given. `user_id` is filled in by the
 * database (`default auth.uid()`) and checked by RLS. Returns an error message or null.
 */
export async function saveTransaction(draft: TransactionDraft, id?: string): Promise<string | null> {
  const row = {
    kind: draft.kind,
    amount: draft.amount,
    category_id: draft.categoryId,
    note: draft.note.trim() || null,
    occurred_on: draft.occurredOn,
  } satisfies TableInsert<'transactions'>;

  const { error } = id
    ? await supabase.from('transactions').update(row).eq('id', id)
    : await supabase.from('transactions').insert(row);

  if (error) {
    console.warn('saveTransaction failed', error.message);
    return SAVE_FAILED;
  }
  return null;
}

export async function deleteTransaction(id: string): Promise<string | null> {
  const { error } = await supabase.from('transactions').delete().eq('id', id);
  if (error) {
    console.warn('deleteTransaction failed', error.message);
    return DELETE_FAILED;
  }
  return null;
}
