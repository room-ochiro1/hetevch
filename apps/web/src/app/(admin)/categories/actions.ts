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
