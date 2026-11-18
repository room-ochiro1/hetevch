'use server';

import { refresh } from 'next/cache';

import { requireAdmin } from '@/lib/dal/auth';
import { isUuid } from '@/lib/parse';
import { createClient } from '@/lib/supabase/server';

export type RoleFormState = { error: string | null; success: string | null };

export async function changeRole(_prev: RoleFormState, formData: FormData): Promise<RoleFormState> {
  const admin = await requireAdmin();
  const userId = String(formData.get('userId') ?? '');
  const role = formData.get('role');

  if (!isUuid(userId) ||(role !== 'admin' && role !== 'user')) {
    return { error: 'Буруу хүсэлт.', success: null };
  }
  if (userId === admin.id && role !== 'admin') {
    return { error: 'Өөрийнхөө админ эрхийг хасах боломжгүй.', success: null };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc('set_user_role', { target_user_id: userId, new_role: role });
  if (error) {
    return { error: `Эрх өөрчилж чадсангүй: ${error.message}`, success: null };
  }

  refresh();
  return {
    error: null,
    success: role === 'admin' ? 'Админ эрх олголоо.' : 'Админ эрхийг хаслаа.',
  };
}
