import { cookies } from 'next/headers';

export const ADMIN_COOKIE = 'aids_admin';

export function getExpectedPassword(): string {
  return process.env.ADMIN_PASSWORD || 'changeme';
}

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return store.get(ADMIN_COOKIE)?.value === '1';
}
