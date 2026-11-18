import { supabase } from '@/lib/supabase';

/** Each action returns a Mongolian error message, or null when it worked. */

/** Saves the name and birth year (the only profile fields users may change). */
export async function updateProfile(
  userId: string,
  fields: { fullName: string; birthYear: number | null },
): Promise<string | null> {
  const { error } = await supabase
    .from('profiles')
    .update({ full_name: fields.fullName.trim() || null, birth_year: fields.birthYear })
    .eq('id', userId);
  return error ? 'Хадгалж чадсангүй. Интернэт холболтоо шалгаад дахин оролдоно уу.' : null;
}

/**
 * Deletes the account and everything in it (see the delete_my_account migration), then clears
 * the session on this device; the app then starts over with the welcome form.
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
