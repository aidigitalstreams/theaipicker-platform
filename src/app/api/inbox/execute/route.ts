import { NextResponse } from 'next/server';
import { requireAdminBearer } from '@/lib/api-auth';
import { listInboxItems } from '@/lib/inbox';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  const fail = requireAdminBearer(request);
  if (fail) return fail;

  const items = await listInboxItems({ status: 'execute-requested', limit: 1000 });
  return NextResponse.json({ ok: true, items });
}
