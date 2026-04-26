'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_COOKIE, getExpectedPassword } from '@/lib/admin-auth';

export async function loginAction(_prev: { error?: string } | null, formData: FormData): Promise<{ error?: string }> {
  const password = String(formData.get('password') ?? '');

  if (password !== getExpectedPassword()) {
    return { error: 'Incorrect password.' };
  }

  const store = await cookies();
  store.set(ADMIN_COOKIE, '1', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect('/admin');
}

export async function logoutAction() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
  redirect('/admin/login');
}
