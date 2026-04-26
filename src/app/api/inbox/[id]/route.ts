import { NextResponse } from 'next/server';
import { requireAdminBearer } from '@/lib/api-auth';
import {
  getInboxItemById,
  updateInboxStatus,
  isStatus,
  type InboxStatus,
} from '@/lib/inbox';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface UpdateBody {
  status?: string;
  resultNotes?: string | null;
}

interface Params {
  params: Promise<{ id: string }>;
}

function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isFinite(id) && id > 0 ? id : null;
}

export async function GET(request: Request, { params }: Params) {
  const fail = requireAdminBearer(request);
  if (fail) return fail;

  const { id: idStr } = await params;
  const id = parseId(idStr);
  if (id === null) return NextResponse.json({ ok: false, error: 'Invalid id.' }, { status: 400 });

  const item = await getInboxItemById(id);
  if (!item) return NextResponse.json({ ok: false, error: 'Not found.' }, { status: 404 });
  return NextResponse.json({ ok: true, item });
}

export async function PUT(request: Request, { params }: Params) {
  const fail = requireAdminBearer(request);
  if (fail) return fail;

  const { id: idStr } = await params;
  const id = parseId(idStr);
  if (id === null) return NextResponse.json({ ok: false, error: 'Invalid id.' }, { status: 400 });

  let body: UpdateBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body.' }, { status: 400 });
  }

  let status: InboxStatus | undefined;
  if (body.status !== undefined) {
    if (typeof body.status !== 'string' || !isStatus(body.status)) {
      return NextResponse.json({ ok: false, error: `Invalid status: ${body.status}` }, { status: 400 });
    }
    status = body.status;
  }

  let resultNotes: string | null | undefined;
  if (body.resultNotes !== undefined) {
    resultNotes = body.resultNotes === null ? null : String(body.resultNotes);
  }

  const existing = await getInboxItemById(id);
  if (!existing) return NextResponse.json({ ok: false, error: 'Not found.' }, { status: 404 });

  const item = await updateInboxStatus(id, { status, resultNotes });
  if (!item) return NextResponse.json({ ok: false, error: 'Update failed.' }, { status: 500 });
  return NextResponse.json({ ok: true, item });
}
