import { USER_CATEGORY_SORT_ORDER, type TransactionKind } from '@hetevch/shared';

import { supabase } from '@/lib/supabase';

export type CategoryDraft = {
  kind: TransactionKind;
  name: string;
  icon: string;
  color: string;
};

const NETWORK_ERROR = 'Интернэт холболтоо шалгаад дахин оролдоно уу.';
const UNIQUE_VIOLATION = '23505';
const FOREIGN_KEY_VIOLATION = '23503';

/**
 * Adds one of the user's own categories (no id) or edits it. The kind is fixed after creation:
 * transactions are tied to it. Returns a Mongolian error message, or null on success.
 */
export async function saveCategory(
  draft: CategoryDraft,
  ownerId: string,
  id?: string,
): Promise<string | null> {
  const fields = { name: draft.name.trim(), icon: draft.icon.trim(), color: draft.color };
  const { error } = id
    ? await supabase.from('categories').update(fields).eq('id', id).eq('owner_id', ownerId)
    : await supabase.from('categories').insert({
        ...fields,
        kind: draft.kind,
        owner_id: ownerId,
        sort_order: USER_CATEGORY_SORT_ORDER,
      });
  if (error?.code === UNIQUE_VIOLATION) return 'Ийм нэртэй ангилал танд аль хэдийн байна.';
  return error ? `Хадгалж чадсангүй. ${NETWORK_ERROR}` : null;
}

/** Deletes one of the user's own categories; refused while transactions still use it. */
export async function deleteCategory(id: string, ownerId: string): Promise<string | null> {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)
    .eq('owner_id', ownerId);
  if (error?.code === FOREIGN_KEY_VIOLATION) {
    return 'Энэ ангилалд гүйлгээ бүртгэгдсэн байна. Эхлээд тэдгээрийг өөр ангилал руу шилжүүлнэ үү.';
  }
  return error ? `Устгаж чадсангүй. ${NETWORK_ERROR}` : null;
}
