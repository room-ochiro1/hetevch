'use server';

import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';

export type SignInState = { error: string | null };

export async function signIn(_prev: SignInState, formData: FormData): Promise<SignInState> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    return { error: 'Имэйл болон нууц үгээ оруулна уу.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: 'Имэйл эсвэл нууц үг буруу байна.' };
  }

  // The admin role is checked by requireAdmin() on the dashboard.
  redirect('/');
}
