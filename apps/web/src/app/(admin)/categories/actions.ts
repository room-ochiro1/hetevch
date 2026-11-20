'use server';

import { refresh } from 'next/cache';

import { actionError, actionSuccess, type ActionState } from '@/lib/action-state';
import { requireAdmin } from '@/lib/dal/auth';
import { isUuid } from '@/lib/parse';
import { createClient } from '@/lib/supabase/server';
import { parseCategoryFields, parseKindField } from '@/lib/validation/category';

const FOREIGN_KEY_VIOLATION = '23503';

export async function createCategory(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const kind = parseKindField(formData);
  const fields = parseCategoryFields(formData);
  if (!kind) return actionError('Төрөл сонгоно уу.');
  if (!fields.ok) return actionError(fields.error);

  const supabase = await createClient();
  const { name, icon, color, sortOrder } = fields.data;
  const { error } = await supabase
    .from('categories')
    .insert({ kind, name, icon, color, sort_order: sortOrder });
  if (error) return actionError(`Нэмж чадсангүй: ${error.message}`);

  refresh();
  return actionSuccess(`«${name}» ангилал нэмэгдлээ.`);
}

/**
 * Adds a category users keep making for themselves to the built-in list (placed last). Their own
 * copies stay as they are; nothing is moved or deleted.
 */
export async function promoteCategory(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const kind = parseKindField(formData);
  const fields = parseCategoryFields(formData);
  if (!kind) return actionError('Төрөл буруу байна.');
  if (!fields.ok) return actionError(fields.error);

  const supabase = await createClient();
  const { name, icon, color } = fields.data;
  const { data: builtIn, error: readError } = await supabase
    .from('categories')
    .select('name, sort_order')
    .is('owner_id', null)
    .eq('kind', kind);
  if (readError) return actionError(`Шалгаж чадсангүй: ${readError.message}`);
  if ((builtIn ?? []).some((c) => c.name.trim().toLowerCase() === name.toLowerCase())) {
    return actionError(`«${name}» нийтийн ангилалд аль хэдийн байна.`);
  }

  const sortOrder = Math.min(9999, Math.max(0, ...(builtIn ?? []).map((c) => c.sort_order)) + 1);
  const { error } = await supabase.from('categories').insert({ kind, name, icon, color, sort_order: sortOrder });
  if (error) return actionError(`Нэмж чадсангүй: ${error.message}`);

  refresh();
  return actionSuccess('Нийтийн ангилалд нэмэгдлээ');
}

export async function updateCategory(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = String(formData.get('id') ?? '');
  const fields = parseCategoryFields(formData);
  if (!isUuid(id)) return actionError('Буруу хүсэлт.');
  if (!fields.ok) return actionError(fields.error);

  const supabase = await createClient();
  const { name, icon, color, sortOrder } = fields.data;
  const { error } = await supabase
    .from('categories')
    .update({ name, icon, color, sort_order: sortOrder })
    .eq('id', id);
  if (error) return actionError(`Хадгалж чадсангүй: ${error.message}`);

  refresh();
  return actionSuccess('Хадгаллаа.');
}

export async function deleteCategory(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = String(formData.get('id') ?? '');
  if (!isUuid(id)) return actionError('Буруу хүсэлт.');

  const supabase = await createClient();
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error?.code === FOREIGN_KEY_VIOLATION) {
    return actionError('Энэ ангилалд гүйлгээ бүртгэгдсэн тул устгах боломжгүй.');
  }
  if (error) return actionError(`Устгаж чадсангүй: ${error.message}`);

  refresh();
  return actionSuccess('Устгалаа.');
}
