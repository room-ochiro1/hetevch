import { authErrorMessage } from '@/lib/auth-errors';
import { supabase } from '@/lib/supabase';

/** Supabase Auth's default minimum; the server checks it too. */
export const MIN_PASSWORD_LENGTH = 6;

/** Each action returns a Mongolian error message, or null when it worked. */

export async function updateFullName(userId: string, fullName: string): Promise<string | null> {
  const { error } = await supabase
    .from('profiles')
    .update({ full_name: fullName.trim() || null })
    .eq('id', userId);
  return error ? 'Нэрийг хадгалж чадсангүй. Интернэт холболтоо шалгаад дахин оролдоно уу.' : null;
}

export async function changePassword(password: string): Promise<string | null> {
  const { error } = await supabase.auth.updateUser({ password });
  return error ? authErrorMessage(error.code) : null;
}

/**
 * Deletes the account and every transaction in it (see the delete_my_account migration),
 * then clears the session on this device; the router then shows the sign-in screen.
 */
export async function deleteAccount(): Promise<string | null> {
  const { error } = await supabase.rpc('delete_my_account');
  if (error) {
    return error.message === 'admin_account'
      ? 'Админ бүртгэлийг аппаас устгах боломжгүй.'
      : 'Бүртгэлийг устгаж чадсангүй. Интернэт холболтоо шалгаад дахин оролдоно уу.';
  }
  // The server has already dropped this user, so only the local copy is left to clear.
  await supabase.auth.signOut({ scope: 'local' });
  return null;
}
