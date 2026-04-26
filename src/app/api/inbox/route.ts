import { NextResponse } from 'next/server';
import { requireAdminBearer } from '@/lib/api-auth';
import {
  listInboxItems,
  addInboxItem,
  isPriority,
  isStatus,
  CATEGORIES,
  type InboxStatus,
  type InboxPriority,
} from '@/lib/inbox';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const VALID_CATEGORY_VALUES = new Set(CATEGORIES.map(c => c.value));

export async function GET(request: Request) {
  const fail = requireAdminBearer(request);
  if (fail) return fail;

  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get('status');
  let status: InboxStatus | undefined;
  if (statusParam) {
    if (!isStatus(statusParam)) {
      return NextResponse.json({ ok: false, error: `Invalid status: ${statusParam}` }, { status: 400 });
    }
    status = statusParam;
  }
  const limitParam = Number(searchParams.get('limit') ?? '1000');
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 5000) : 1000;

  const items = await listInboxItems({ status, limit });
  return NextResponse.json({ ok: true, items });
}

interface CreateBody {
  title?: string;
  priority?: string;
  category?: string;
  instructions?: string;
}

export async function POST(request: Request) {
  const fail = requireAdminBearer(request);
  if (fail) return fail;

  let body: CreateBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body.' }, { status: 400 });
  }

  const title = (body.title ?? '').trim();
  const priorityRaw = (body.priority ?? 'medium').trim();
  const categoryRaw = (body.category ?? '').trim();
  const instructions = (body.instructions ?? '').trim();

  if (!title) return NextResponse.json({ ok: false, error: 'title is required.' }, { status: 400 });
  if (!isPriority(priorityRaw)) {
    return NextResponse.json({ ok: false, error: 'priority must be high, medium, or low.' }, { status: 400 });
  }
  const priority: InboxPriority = priorityRaw;
  const category = categoryRaw && VALID_CATEGORY_VALUES.has(categoryRaw) ? categoryRaw : undefined;

  const item = await addInboxItem({ title, priority, category, instructions });
  return NextResponse.json({ ok: true, item }, { status: 201 });
}
