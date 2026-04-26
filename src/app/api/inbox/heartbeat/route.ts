import { NextResponse } from 'next/server';
import { requireAdminBearer } from '@/lib/api-auth';
import { pingBridge, isValidMachineName } from '@/lib/heartbeat';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  const fail = requireAdminBearer(request);
  if (fail) return fail;

  const { searchParams } = new URL(request.url);
  const machineRaw = (searchParams.get('machine') ?? '').trim();
  if (!machineRaw) {
    return NextResponse.json({ ok: false, error: 'machine query parameter is required.' }, { status: 400 });
  }
  if (!isValidMachineName(machineRaw)) {
    return NextResponse.json(
      { ok: false, error: 'machine must be 1-80 chars of letters, numbers, dot, dash, or underscore.' },
      { status: 400 },
    );
  }

  const heartbeat = await pingBridge(machineRaw);
  return NextResponse.json({ ok: true, heartbeat });
}
